import { useState, useMemo, useTransition, useEffect } from "react";
import dayjs from "dayjs";
import Decimal from "decimal.js";
import { createPortal } from "react-dom";
import WarningIcon from "@mui/icons-material/Warning";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  ReceiptLong,
  TrendingUp,
  LocalAtm,
  MonetizationOn,
  AccountBalanceWallet,
} from "@mui/icons-material";

import { useForm, Controller } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";

// react redux stuff
import { useSelector, useDispatch } from "react-redux";
import {
  openLoanPaymentModal,
  closeLoanPaymentModal,
  selectModalData,
} from "../../features/redux/paymentModalSlice";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchLoanPaymentsView } from "../../backend/hooks/shared/view/useFetchPaymentsView";
import { useFetchPaySched } from "../../backend/hooks/shared/useFetchPaySched";
import { useFetchLoanAccView } from "../../backend/hooks/shared/useFetchLoanAccView";
import { useMemberRole } from "../../backend/context/useMemberRole";

// mutation hooks
import { useDeletePayment } from "../../backend/hooks/treasurer/useDeletePayment";
import { useAddLoanPayments } from "../../backend/hooks/treasurer/useAddPayments";
import { useEditLoanPayments } from "../../backend/hooks/treasurer/useEditPayments";

// components
import FilterToolbar from "../shared/components/FilterToolbar";
import DataTableV2 from "../shared/components/DataTableV2";
import StatCardV2 from "../shared/components/StatCardV2";

// modal
import ReceiptModal from "./modals/ReceiptModal";
import FormModal from "./modals/FormModal";

// constants
import {
  PAYMENT_METHOD_COLORS,
  LOAN_PAYMENT_STATUS_COLORS,
} from "../../constants/Color";
import placeHolderAvatar from "../../assets/placeholder-avatar.png";

// utils
import { display } from "../../constants/numericFormat";
import { getMinAllowedDate } from "../board/helpers/utils";

const monthNameToNumber = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};
import { useFetchTotal } from "../../backend/hooks/shared/useFetchTotal";
import { calcGrowth } from "../shared/utils/CurrentVSPrevCalculator";

// HELPER: To avoid timezone issues with date inputs
function getLocalDateString(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

function CoopLoansPayments() {
  // redux stuff to control the modal
  const dispatch = useDispatch();
  const loanPaymentModal = useSelector(selectModalData); // fetch the data from the store
  const payment_redux_data = loanPaymentModal?.data || [];

  // fetch data hooks
  const { memberRole } = useMemberRole();
  const { data: loan_acc_view } = useFetchLoanAccView({});
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const {
    data: view_loan_payments_data,
    isLoading,
    isError,
    error,
  } = useFetchLoanPaymentsView({});

  // React hook forms
  const { mutate: addLoanPayments, isPending: isAddPending } =
    useAddLoanPayments();
  const { mutate: editLoanPayments, isPending: isEditPending } =
    useEditLoanPayments();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  /**
   * Use Transitions handler for the filtertable to be smooth and stable if the datasets grow larger
   * it needs to be paired with useMemo on the filtered data (clubFunds)
   *
   */
  // Add useTransition
  const [isPending, startTransition] = useTransition();

  // Update filter handlers to use startTransition
  const handleSearchChange = (value) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  };
  // Update filter handlers to use startTransition
  const handleStatusChange = (value) => {
    startTransition(() => {
      setStatusFilter(value);
    });
  };
  // Update filter handlers to use startTransition
  const handlePaymentMethodChange = (value) => {
    startTransition(() => {
      setPaymentMethodFilter(value);
    });
  };

  const handleYearChange = (value) => {
    startTransition(() => {
      setYearFilter(value);
    });
  };
  const handleMonthChange = (value) => {
    startTransition(() => {
      setMonthFilter(value);
    });
  };

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setYearFilter("");
    setMonthFilter("");
    setPaymentMethodFilter("");
  };

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250);

  // Dynamically generate year options for past 5 years (including current)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  // just for fancy subtext in line with active filters
  const activeFiltersText =
    [
      debouncedSearch ? `Search: "${debouncedSearch}"` : null,
      statusFilter ? `${statusFilter}` : null,
      paymentMethodFilter ? `${paymentMethodFilter}` : null,
      yearFilter ? `${yearFilter}` : null,
      monthFilter ? `${monthFilter}` : null,
    ]
      .filter(Boolean)
      .join(" - ") || "Showing all payments";

  const TABLE_PREFIX = "LP"; // You can change this per table, this for the the unique table ID but this is not included in the database
  const loanPayments = useMemo(() => {
    const loanPaymentsData = view_loan_payments_data?.data || [];
    return loanPaymentsData.filter((row) => {
      const generatedId = `${TABLE_PREFIX}_${row.payment_id}`;

      const matchesSearch =
        debouncedSearch === "" ||
        (row.full_name &&
          row.full_name
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())) ||
        (row.account_number &&
          row.account_number
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())) ||
        (row.loan_ref_number &&
          row.loan_ref_number
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())) ||
        generatedId.toLowerCase().includes(debouncedSearch.toLowerCase()); // <-- ID match
      const statusPaymentFilter =
        statusFilter === "" || row.status === statusFilter;

      const matchesPaymentMethod =
        paymentMethodFilter === "" ||
        row.payment_method === paymentMethodFilter;

      const date = row.payment_date ? new Date(row.payment_date) : null;
      const matchesYear =
        yearFilter === "" ||
        (date && date.getFullYear().toString() === yearFilter);

      // Month filter uses month names -> convert to number for comparison
      const filterMonthNumber = monthFilter
        ? monthNameToNumber[monthFilter]
        : null;
      const matchesMonth =
        monthFilter === "" ||
        (date && date.getMonth() + 1 === filterMonthNumber);

      return (
        matchesSearch &&
        matchesYear &&
        matchesMonth &&
        matchesPaymentMethod &&
        statusPaymentFilter
      );
    });
  }, [
    view_loan_payments_data,
    debouncedSearch,
    statusFilter,
    paymentMethodFilter,
    yearFilter,
    monthFilter,
  ]);

  // Derived filters for totals (driven by toolbar year/month)
  const monthForTotals = monthFilter ? monthNameToNumber[monthFilter] : null;
  const yearForTotals = yearFilter ? Number(yearFilter) : null;
  const effectiveYearForTotals = yearForTotals ?? currentYear;

  const prevPeriod = (() => {
    if (monthForTotals) {
      const base = new Date(effectiveYearForTotals, monthForTotals - 1, 1);
      const prev = new Date(base);
      prev.setMonth(base.getMonth() - 1);
      return { month: prev.getMonth() + 1, year: prev.getFullYear() };
    }
    if (yearForTotals) return { month: null, year: yearForTotals - 1 };
    return { month: null, year: null };
  })();

  const totalsSubtitle = monthForTotals
    ? `${monthFilter} ${effectiveYearForTotals}`
    : yearForTotals
      ? `${yearForTotals}`
      : "All Time";

  const {
    data: totalSummary,
    isLoading: loadingCurrent,
    isError: isCurrentError,
    error: currentErrorMessage,
  } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: yearForTotals,
    month: monthForTotals,
    key: `loanpayments-summary-current-${totalsSubtitle}`,
  });
  console.log(totalSummary);
  const {
    data: prevSummary,
    isLoading: loadingPrev,
    isError: isPrevError,
    error: prevErrorMessage,
  } = useFetchTotal({
    rpcFn: "get_funds_summary",
    month: prevPeriod.month,
    year: prevPeriod.year,
    key: `loanpayments-summary-prev-${totalsSubtitle}`,
  });

  const loadingTotals = loadingCurrent || loadingPrev;
  const errorTotals = isCurrentError || isPrevError;
  const errorMessageTotals =
    currentErrorMessage?.message ||
    prevErrorMessage?.message ||
    "Failed to load totals";

  const stats = useMemo(() => {
    const c = totalSummary || {};
    const p = prevSummary || {};
    return [
      {
        statName: "Penalty Fee Income",
        amount: Number(c.club_total_fees_income ?? 0),
        growthPercent: calcGrowth(
          c.club_total_fees_income,
          p.club_total_fees_income
        ),
        iconBgColor: "bg-amber-500",
        icon: <ReceiptLong />,
        subtitle: totalsSubtitle,
        loading: loadingTotals,
        error: errorTotals,
        errorMessage: errorMessageTotals,
      },
      {
        statName: "Interest Income",
        amount: Number(c.club_total_interest_income ?? 0),
        growthPercent: calcGrowth(
          c.club_total_interest_income,
          p.club_total_interest_income
        ),
        iconBgColor: "bg-indigo-500",
        icon: <TrendingUp />,
        subtitle: totalsSubtitle,
        loading: loadingTotals,
        error: errorTotals,
        errorMessage: errorMessageTotals,
      },
      {
        statName: "Service Fee Income",
        amount: Number(c.club_total_service_fee_income ?? 0),
        growthPercent: calcGrowth(
          c.club_total_service_fee_income,
          p.club_total_service_fee_income
        ),
        iconBgColor: "bg-teal-500",
        icon: <LocalAtm />,
        subtitle: totalsSubtitle,
        loading: loadingTotals,
        error: errorTotals,
        errorMessage: errorMessageTotals,
      },
      {
        statName: "Principal Paid",
        amount: Number(c.coop_total_principal_paid ?? 0),
        growthPercent: calcGrowth(
          c.coop_total_principal_paid,
          p.coop_total_principal_paid
        ),
        iconBgColor: "bg-emerald-600",
        icon: <MonetizationOn />,
        subtitle: totalsSubtitle,
        loading: loadingTotals,
        error: errorTotals,
        errorMessage: errorMessageTotals,
      },
      {
        statName: "Total Loan Payments",
        amount: Number(c.coop_total_loan_paid_amount ?? 0),
        growthPercent: calcGrowth(
          c.coop_total_loan_paid_amount,
          p.coop_total_loan_paid_amount
        ),
        iconBgColor: "bg-orange-600",
        icon: <LocalAtm />,
        subtitle: totalsSubtitle,
        loading: loadingTotals,
        error: errorTotals,
        errorMessage: errorMessageTotals,
      },
      {
        statName: "Club Total Income",
        amount: Number(c.club_total_income ?? 0),
        growthPercent: calcGrowth(c.club_total_income, p.club_total_income),
        iconBgColor: "bg-blue-600",
        icon: <AccountBalanceWallet />,
        subtitle: totalsSubtitle,
        loading: loadingTotals,
        error: errorTotals,
        errorMessage: errorMessageTotals,
      },
    ];
  }, [
    totalSummary,
    prevSummary,
    totalsSubtitle,
    loadingTotals,
    errorTotals,
    errorMessageTotals,
  ]);

  const { mutate: mutateDelete } = useDeletePayment("loan_payments");

  const today = getLocalDateString(new Date());

  const defaultFormValues = {
    payment_id: "",
    loan_id: null,
    loan_ref_number: "",
    account_number: "",
    member_id: null,
    total_amount: "",
    payment_method: "",
    payment_date: today,
    payment_type: "",
    sched_id: "",
    outstanding_balance: "",
    status: "",
  };

  const { control, register, watch, handleSubmit, reset, setValue } = useForm({
    defaultValues: defaultFormValues,
  });

  // Modal Controls
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  // Auto-populate form when modal opens with prefilled data from payment schedules
  useEffect(() => {
    if (
      loanPaymentModal.isOpen &&
      loanPaymentModal.type === "add" &&
      payment_redux_data &&
      Object.keys(payment_redux_data).length > 0
    ) {
      // Find the member to get member_id
      const selectedMember = members.find(
        (m) => m.account_number === payment_redux_data.member_account_number
      );

      reset({
        payment_id: "",
        loan_id: payment_redux_data.loan_id || null,
        loan_ref_number: payment_redux_data.loan_ref_number || "",
        account_number: payment_redux_data.member_account_number || "",
        member_id: selectedMember?.member_id || null,
        total_amount: "",
        payment_method: "",
        payment_date: getLocalDateString(new Date()),
        payment_type: "",
        sched_id: payment_redux_data.schedule_id || "",
        outstanding_balance: "",
        status: "",
      });
    }
  }, [
    loanPaymentModal.isOpen,
    loanPaymentModal.type,
    payment_redux_data,
    members,
    reset,
  ]);

  const openAddModal = () => {
    reset(defaultFormValues);
    dispatch(openLoanPaymentModal({ type: "add" }));
  };

  const [isStatsVisible, setIsStatsVisible] = useState(true);

  const closeModal = () => {
    reset(defaultFormValues);
    dispatch(closeLoanPaymentModal());
  };

  // View modals
  const [viewPaymentData, setViewPaymentData] = useState(null);
  const [showEditModal, setEditModal] = useState(false); // receives a conditional to be opened or not base on loan acc

  const openViewModal = (data) => {
    setViewPaymentData(data); // sets the data

    // Fetch the loan account details based on the selected payment data
    const selectedLoan = loanAcc.find(
      (loan) => loan.loan_ref_number === data.loan_ref_number
    );
    // Show the modal if the loan is active
    setEditModal(selectedLoan?.status === "Active" ? true : false);
  };

  const editModal = () => {
    if (!viewPaymentData) return;

    // Fetch the loan account details based on the selected payment data
    const selectedLoan = loanAcc.find(
      (loan) => loan.loan_ref_number === viewPaymentData.loan_ref_number
    );

    // Populate the form fields with the loan account details
    reset({
      ...viewPaymentData,
      loan_id: selectedLoan?.loan_id || null,
      outstanding_balance: selectedLoan?.outstanding_balance || 0,
      status: selectedLoan?.status || "",
    });

    // put something here to trigger the shcedule id to be filtered

    closeViewModal();
    dispatch(openLoanPaymentModal({ type: "edit", data: viewPaymentData }));
  };

  const closeViewModal = () => {
    setViewPaymentData(null);
  };

  // Handlers
  const handleDelete = (payment_id) => {
    // console.log("Deleting Coop contribution:", payment_id);
    mutateDelete({
      table: "loan_payments",
      column_name: "payment_id",
      id: payment_id,
    });
    closeModal();
  };
  const [pendingPaymentData, setPendingPaymentData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // On form submit (opens confirmation)
  const handlePaymentSubmit = (data) => {
    setPendingPaymentData(data);
    setShowPaymentConfirm(true);
  };

  // On confirm button
  const confirmPayment = () => {
    if (!pendingPaymentData) return;

    if (loanPaymentModal.type === "add") {
      // console.log("ADD",pendingPaymentData)
      const addPayload = {
        ...pendingPaymentData,
        member_name:
          members.find(
            (m) => m.account_number === pendingPaymentData.account_number
          )?.f_name +
          " " +
          members.find(
            (m) => m.account_number === pendingPaymentData.account_number
          )?.l_name,
        total_amount: new Decimal(pendingPaymentData?.total_amount || 0)
          .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
          .toNumber(),
      };
      // console.log("Add Payload", addPayload)
      addLoanPayments(addPayload, {
        onSuccess: () => {
          toast.success("Successfully added payment");
          setShowPaymentConfirm(false);
          setPendingPaymentData(null);
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong");
          setShowPaymentConfirm(false);
        },
      });
    } else if (loanPaymentModal.type === "edit") {
      // console.log("Payload", pendingPaymentData)

      // custom payload for editing to avoid non-db fields error when inserting the whole form data
      const customPayload = {
        schedule_id: pendingPaymentData?.schedule_id,
        payment_id: pendingPaymentData?.payment_id,
        loan_ref_number: pendingPaymentData?.loan_ref_number,
        account_number: pendingPaymentData?.account_number,
        total_amount: new Decimal(pendingPaymentData?.total_amount || 0)
          .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
          .toNumber(),
        payment_method: pendingPaymentData?.payment_method,
        payment_date: pendingPaymentData?.payment_date,
        receipt_no: pendingPaymentData?.receipt_no,
      };
      // console.log("Custom payload", pendingPaymentData)
      editLoanPayments(customPayload, {
        onSuccess: () => {
          toast.success("Successfully edited payment");
          setShowPaymentConfirm(false);
          setPendingPaymentData(null);
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong");
          setShowPaymentConfirm(false);
        },
      });
    }
  };

  /**
   * MEMBERS FILTER
   */
  const [queryMem, setQueryMem] = useState("");
  // This is used for the search query on the form
  const debouncedQueryMem = useDebounce(queryMem, 250); // 250ms delay feels natural
  const filteredMembers =
    debouncedQueryMem === ""
      ? (members || []).filter((m) => m.account_role === "regular-member")
      : members.filter(
          (m) =>
            m.account_role === "regular-member" &&
            `${m.account_number} ${m.f_name} ${m.l_name} ${m.account_role}`
              .toLowerCase()
              .includes(debouncedQueryMem.toLowerCase())
        );

  /**
   * LOAN ACC FILTER
   */
  const [queryLoan, setQueryLoan] = useState("");
  const debouncedQueryLoan = useDebounce(queryLoan, 250); // 250ms delay feels natural
  const loanAcc = useMemo(() => {
    const data = loan_acc_view?.data || []; // Uses the view table version instead of the base table
    return data.filter((loan) => loan.status === "Active"); // Filter to only Active loan accounts
  }, [loan_acc_view]);

  // Get the account number of the selected member
  const selectedMember = members.find(
    (m) => m.account_number === watch("account_number")
  );

  // Then filter the active loan accs base on the selectedMember
  const filteredLoanAcc = useMemo(() => {
    const data = selectedMember
      ? loanAcc.filter(
          (loan) => loan.account_number === selectedMember.account_number
        )
      : [];

    // Then this is used for the search query on the form
    if (debouncedQueryLoan !== "") {
      return data.filter((loan) =>
        `${loan.loan_ref_number} ${loan.loan_id}` // You can add columns here that you wanna search
          .toLowerCase()
          .includes(debouncedQueryLoan.toLowerCase())
      );
    }

    // If no query, return all loans of the selected member
    return data;
  }, [loanAcc, selectedMember, debouncedQueryLoan]);

  // fetch the outstandanding balance base on the filtered member
  const selectedLoanRef = watch("loan_ref_number");

  const loanAccViewData = useMemo(() => {
    if (!selectedLoanRef) return 0;

    const data = loanAcc.find((v) => v.loan_ref_number === selectedLoanRef);
    return data;
  }, [selectedLoanRef, loanAcc]);

  const balance = loanAccViewData?.outstanding_balance || 0;
  const loan_id = loanAccViewData?.loan_id || null;

  /**
   * LOAN PAYMENT SCHEDULE FILTER
   */
  // Schedules for the selected loan
  const { data: loan_sched } = useFetchPaySched({ loanId: loan_id });

  // Compute schedule context:
  // 1. If there are unpaid OVERDUE schedules => aggregate all of them (multi-month catch up)
  // 2. Else fall back to the next unpaid schedule (treated as UPCOMING)
  // If editing, use the schedule_id from the modal data
  const {
    nextSchedule,
    totalPayableAll,
    scheduleMode,
    totalPenalty,
    overdueScheduleCount,
  } = useMemo(() => {
    const loanSchedRaw = loan_sched?.data || [];

    // If editing, grab the schedule by id from modal data from redux
    // and show only that payment schedule details
    if (loanPaymentModal.type === "edit" && payment_redux_data?.schedule_id) {
      const editSchedule = loanSchedRaw.find(
        (s) => s.schedule_id === payment_redux_data.schedule_id
      );
      if (editSchedule) {
        const totalDue = new Decimal(editSchedule.total_due ?? 0);
        const amountPaid = new Decimal(editSchedule.amount_paid ?? 0);
        const feeDue = new Decimal(editSchedule.fee_due ?? 0);
        const remaining = totalDue.minus(amountPaid);
        return {
          list: [editSchedule],
          nextSchedule: editSchedule,
          totalPayableAll: remaining,
          totalPenalty: feeDue,
          overdueScheduleCount: editSchedule.status === "OVERDUE" ? 1 : 0,
          scheduleMode:
            editSchedule.status === "OVERDUE" ? "overdue" : "upcoming",
        };
      }
    }

    // Normal usage (add mode)
    if (!selectedLoanRef || loanSchedRaw.length === 0) {
      return {
        list: [],
        nextSchedule: null,
        totalPayableAll: new Decimal(0),
        totalPenalty: new Decimal(0),
        overdueScheduleCount: 0,
        scheduleMode: null,
      };
    }
    // Unpaid overdue schedules
    const unpaidOverdue = loanSchedRaw
      .filter((s) => !s.paid && s.status === "OVERDUE")
      .sort((a, b) => dayjs(a.due_date).diff(dayjs(b.due_date)));
    if (unpaidOverdue.length > 0) {
      const totalPayableAll = unpaidOverdue.reduce((sum, s) => {
        const totalDue = new Decimal(s.total_due ?? 0);
        const amountPaid = new Decimal(s.amount_paid ?? 0);
        return sum.plus(totalDue.minus(amountPaid));
      }, new Decimal(0));

      const totalPenalty = unpaidOverdue.reduce((sum, s) => {
        const feeDue = new Decimal(s.fee_due ?? 0);
        return sum.plus(feeDue);
      }, new Decimal(0));

      return {
        list: unpaidOverdue,
        nextSchedule: unpaidOverdue[0] ?? null,
        totalPayableAll,
        totalPenalty,
        overdueScheduleCount: unpaidOverdue.length,
        scheduleMode: "overdue",
      };
    }
    // No unpaid overdue schedules: find next unpaid (upcoming) schedule
    const unpaidUpcoming = loanSchedRaw
      .filter((s) => !s.paid) // any unpaid regardless of status
      .sort((a, b) => dayjs(a.due_date).diff(dayjs(b.due_date)));
    if (unpaidUpcoming.length === 0) {
      return {
        list: [],
        nextSchedule: null,
        totalPayableAll: new Decimal(0),
        totalPenalty: new Decimal(0),
        overdueScheduleCount: 0,
        scheduleMode: null,
      };
    }
    // For upcoming we only care about the first schedule's remaining payable
    const first = unpaidUpcoming[0];
    const totalDue = new Decimal(first.total_due ?? 0);
    const amountPaid = new Decimal(first.amount_paid ?? 0);
    const feeDue = new Decimal(first.fee_due ?? 0);
    const remaining = totalDue.minus(amountPaid);
    return {
      list: unpaidUpcoming, // list of all upcoming unpaid schedules not bound to any specific id
      nextSchedule: first,
      totalPayableAll: remaining,
      totalPenalty: feeDue,
      overdueScheduleCount: 0,
      scheduleMode: "upcoming",
    };
  }, [
    selectedLoanRef,
    loan_sched,
    loanPaymentModal.type,
    payment_redux_data?.schedule_id,
  ]);

  // Derived single schedule fields
  const schedId = nextSchedule?.schedule_id ?? null;
  const totalDue = new Decimal(nextSchedule?.total_due ?? 0);
  const feeDue = new Decimal(nextSchedule?.fee_due ?? 0);
  const amountPaid = new Decimal(nextSchedule?.amount_paid ?? 0);

  // Show explicit UPCOMING if mode is upcoming and status isn't already set (or is not OVERDUE/PARTIALLY PAID)
  const paymentStatus =
    scheduleMode === "upcoming"
      ? nextSchedule?.status && nextSchedule.status !== "OVERDUE"
        ? nextSchedule.status
        : "UPCOMING"
      : (nextSchedule?.status ?? "");
  const dueDate = nextSchedule?.due_date ?? null;
  const mosOverdue = Number(nextSchedule?.mos_overdue ?? 0);

  // const isOverdueMode = scheduleMode === 'overdue';
  // const isUpcomingMode = scheduleMode === 'upcoming';

  // Unified payable (either aggregated overdue months or single upcoming remaining)
  // Like all overdue unpaid or next upcoming unpaid schedule is added here
  // Always round monetary results to 2 decimal places
  const totalPayableAllOverdueUnpaidDecimal = new Decimal(
    totalPayableAll ?? 0
  ).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const totalPayableAllOverdueUnpaid =
    totalPayableAllOverdueUnpaidDecimal.toNumber();

  // Penalty (either aggregated overdue fees or single upcoming fee)
  const totalPenaltyOccuredDecimal = new Decimal(
    totalPenalty ?? 0
  ).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const totalPenaltyOccured = totalPenaltyOccuredDecimal.toNumber();

  // counts the overdue payment schedules
  const overPaymentCount = overdueScheduleCount;

  // Only log when we have actual data (when a loan is selected)
  // if (selectedLoanRef && paymentSchedule) {
  //   console.log(`Total Due`, totalDue);
  // }

  const fields = [
    {
      label: "Amount",
      name: "total_amount",
      type: "number",
      autoComplete: "off",
    },
    {
      label: "Payment Method",
      name: "payment_method",
      type: "select",
      autoComplete: "off",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ],
    },
    {
      label: "Payment Date",
      name: "payment_date",
      type: "date",
      autoComplete: "off",
      min: getMinAllowedDate(), // Prevent backdating more than 7 days
    },
  ];

  return (
    <div className="m-3">
      <Toaster position="bottom-left" />
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            isFilterPending={isPending}
            onReset={handleClearFilters}
            dropdowns={[
              {
                label: "All Status",
                value: statusFilter,
                onChange: handleStatusChange,
                options: [
                  { label: "Full", value: "Full" },
                  { label: "Partial", value: "Partial" },
                ],
              },
              {
                label: "All Method",
                value: paymentMethodFilter,
                onChange: handlePaymentMethodChange,
                options: [
                  { label: "Cash", value: "Cash" },
                  { label: "GCash", value: "GCash" },
                  { label: "Bank", value: "Bank" },
                ],
              },
              {
                label: "All Year",
                value: yearFilter,
                onChange: handleYearChange,
                options: yearOptions,
              },
              {
                label: "All Month",
                value: monthFilter,
                onChange: handleMonthChange,
                options: [
                  { label: "January", value: "January" },
                  { label: "February", value: "February" },
                  { label: "March", value: "March" },
                  { label: "April", value: "April" },
                  { label: "May", value: "May" },
                  { label: "June", value: "June" },
                  { label: "July", value: "July" },
                  { label: "August", value: "August" },
                  { label: "September", value: "September" },
                  { label: "October", value: "October" },
                  { label: "November", value: "November" },
                  { label: "December", value: "December" },
                ],
              },
            ]}
          />
          {memberRole !== "board" && (
            <button
              className="btn btn-neutral whitespace-nowrap shadow-lg flex items-center gap-2 px-4 py-2 
                         fixed bottom-10 right-4 z-20 opacity-80 hover:opacity-100
                         lg:static lg:ml-auto lg:self-center lg:opacity-100"
              title="Add payment"
              aria-label="Add Payment"
              type="button"
              onClick={openAddModal}
            >
              <AddCircleIcon />
              Payments
            </button>
          )}
        </div>

        {/* Collapsible Stats Card */}
        <div className="space-y-2">
          <button
            onClick={() => setIsStatsVisible(!isStatsVisible)}
            className="btn btn-sm btn-ghost gap-2"
            type="button"
          >
            {isStatsVisible ? (
              <>
                <ChevronUp size={18} />
                Hide Summary
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                Show Summary
              </>
            )}
          </button>
          {isStatsVisible && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Summary Totals</span>
                <span className="text-xs text-base-content/60">
                  {totalsSubtitle}
                </span>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-3">
                {stats.map((s, i) => (
                  <StatCardV2 key={i} {...s} />
                ))}
              </div>
            </div>
          )}
        </div>

        <DataTableV2
          title="Member Loan Payments"
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={[
            "Payment Ref.",
            "Schedule ID",
            "Loan Ref No.",
            "Account No.",
            "Name",
            "Amount",
            "Status",
            "Date",
            "Payment Method",
          ]}
          filterActive={activeFiltersText !== "Showing all payments"}
          data={loanPayments}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.payment_id || "Not Found";
            const loanRefNo = row?.loan_ref_number || "Not Found";
            const scheduleId = row?.schedule_id || "Not Found";
            const accountNo = row?.account_number || "Not Found";
            const avatarUrl = row?.avatar_url || placeHolderAvatar;
            const fullName = row?.full_name || "Not Found";
            const amount = row?.total_amount || 0;
            const status = row?.status || "Unknown";
            const paymentDate = row?.payment_date
              ? dayjs(row.payment_date).format("MM/DD/YYYY")
              : "Not Found";
            const paymentMethod = row?.payment_method || "Not Found";
            return (
              <tr
                key={id}
                onClick={() => openViewModal(row)}
                className="transition-colors cursor-pointer hover:bg-base-200/70"
              >
                {/* Ref no */}
                <td className="px-4 py-2 text-center font-medium text-xs">
                  {TABLE_PREFIX}_{id}
                </td>

                {/* Schedule ID */}
                <td className="px-4 py-2 text-center font-medium text-xs">
                  #{scheduleId}
                </td>
                {/* Loan ID */}
                <td className="px-4 py-2 text-center font-medium text-xs">
                  {loanRefNo}
                </td>

                {/* Account No. */}
                <td className="px-4 py-2 text-center font-medium text-xs">
                  {accountNo}
                </td>

                {/* Name */}
                <td className="px-4 py-4 text-center">
                  <span className="flex items-center gap-3">
                    {/* avatar for members */}
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10">
                        <img src={avatarUrl} alt={fullName || "Avatar"} />
                      </div>
                    </div>
                    <div className="truncate">
                      {fullName || (
                        <span className="text-gray-400 italic">Not Found</span>
                      )}
                    </div>
                  </span>
                </td>
                {/* Amount */}
                <td className="px-4 py-2 font-semibold text-success text-center">
                  ₱ {display(amount)}
                </td>

                {/* Status */}
                <td className="px-4 py-4 font-semibold text-center">
                  <span
                    className={`font-semibold ${LOAN_PAYMENT_STATUS_COLORS[status]}`}
                  >
                    {status}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-2 text-center">{paymentDate}</td>

                {/* Method */}
                <td className="px-4 py-2 text-center">
                  {paymentMethod ? (
                    <span
                      className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}
                    >
                      {row?.payment_method}
                    </span>
                  ) : (
                    <span> — </span>
                  )}
                </td>
              </tr>
            );
          }}
        />

        <FormModal
          table="Loan Payment"
          open={loanPaymentModal.isOpen}
          close={closeModal}
          action={loanPaymentModal.type === "edit"}
          onSubmit={handleSubmit(handlePaymentSubmit)} // <-- this now stores data
          isPending={isAddPending || isEditPending}
          status={isAddPending || isEditPending}
          deleteAction={() => handleDelete(watch("payment_id"))}
        >
          <div className="pl-1 pr-2 pb-2">
            {/* ACCOUNT SELECTION */}
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 mb-3">
              <h4 className="text-xs font-bold text-gray-600 mb-2">
                Account Selection
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {/* Member Account */}
                <div className="form-control w-full">
                  <label className="label text-xs font-medium text-gray-600 mb-1">
                    Member Account
                  </label>
                  <Controller
                    name="account_number"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Combobox
                          value={
                            members.find(
                              (m) => m.account_number === field.value
                            ) || null
                          }
                          onChange={(member) => {
                            field.onChange(member?.account_number);
                            setValue(
                              "account_number",
                              member?.account_number || ""
                            );
                            setValue("member_id", member?.member_id || null);
                            setValue("loan_ref_number", "");
                            setValue("loan_id", null);
                          }}
                        >
                          <ComboboxInput
                            required
                            className="input input-sm input-bordered w-full"
                            placeholder="Search by Account Number or Name..."
                            displayValue={(member) =>
                              member
                                ? `${member.account_number} - ${member.f_name} ${member.l_name}`.trim()
                                : ""
                            }
                            onChange={(e) => setQueryMem(e.target.value)}
                          />

                          {/* Search option dropdown: account number, avatar, member name, role */}
                          <ComboboxOptions className="absolute z-[800] w-full mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                            {filteredMembers.length === 0 ? (
                              <div className="px-4 py-2 text-base-content/60">
                                No members found.
                              </div>
                            ) : (
                              filteredMembers.map((member) => (
                                <ComboboxOption
                                  key={member.account_number}
                                  value={member}
                                  className={({ focus }) =>
                                    `px-4 py-2 cursor-pointer transition-colors duration-150 ${focus ? "bg-primary/90 text-primary-content" : ""}`
                                  }
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="avatar">
                                      <div className="mask mask-circle w-10 h-10">
                                        <img
                                          src={
                                            member.avatar_url ||
                                            placeHolderAvatar
                                          }
                                          alt={`${member.f_name} ${member.l_name}`}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className="font-mono text-sm font-semibold">
                                        {member.account_number}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm truncate">
                                          {member.f_name} {member.l_name}
                                        </span>
                                        <span className="text-xs italic">
                                          ({member.account_role})
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </ComboboxOption>
                              ))
                            )}
                          </ComboboxOptions>
                        </Combobox>
                      </div>
                    )}
                  />
                </div>

                {/* Loan Account */}
                <div className="form-control w-full">
                  <label className="label text-xs font-medium text-gray-600 mb-1">
                    Loan Account
                  </label>
                  <Controller
                    name="loan_ref_number"
                    control={control}
                    render={({ field }) => {
                      const selectedAccount = watch("account_number");
                      const data = loan_acc_view?.data || [];
                      const selectedMember = data.find(
                        (m) => m.account_number === selectedAccount
                      );
                      // console.log(selectedMember)
                      return (
                        <div className="relative">
                          <Combobox
                            value={
                              filteredLoanAcc.find(
                                (loan) => loan.loan_ref_number === field.value
                              ) || null
                            }
                            onChange={(loan) => {
                              field.onChange(loan?.loan_ref_number);
                              setValue(
                                "loan_ref_number",
                                loan?.loan_ref_number || ""
                              );
                              setValue("loan_id", loan?.loan_id || null);
                            }}
                            disabled={!selectedAccount}
                          >
                            <ComboboxInput
                              required
                              className="input input-sm input-bordered w-full disabled:bg-base-200"
                              placeholder={
                                selectedAccount
                                  ? `Search loan account (e.g., LAPP-12345)`
                                  : "Select a member first"
                              }
                              displayValue={(loan) =>
                                loan?.loan_ref_number || ""
                              }
                              onChange={(e) => setQueryLoan(e.target.value)}
                            />
                            <ComboboxOptions className="absolute z-[800] w-full mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                              {filteredLoanAcc.length === 0 ? (
                                <div className="px-4 py-2 text-base-content/60">
                                  {selectedAccount
                                    ? "No loan accounts found for this member."
                                    : "Select a member first."}
                                </div>
                              ) : (
                                filteredLoanAcc.map((loan) => (
                                  <ComboboxOption
                                    key={loan.loan_ref_number}
                                    value={loan}
                                    className={({ focus }) =>
                                      `px-4 py-2 cursor-pointer transition-colors duration-150 ${
                                        focus
                                          ? "bg-primary text-primary-content"
                                          : "hover:bg-base-200"
                                      }`
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-sm font-semibold">
                                        {loan.loan_ref_number}
                                      </span>
                                      <span>
                                        <span className="text-xs mr-1">
                                          Amount Due:
                                        </span>
                                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1 rounded">
                                          ₱
                                          {selectedMember &&
                                            `${loan?.total_amount_due}`}
                                        </span>
                                      </span>
                                    </div>
                                  </ComboboxOption>
                                ))
                              )}
                            </ComboboxOptions>
                          </Combobox>
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT DETAILS */}
            <div className="bg-white p-2.5 rounded-lg border border-gray-200 mb-3">
              <h4 className="text-xs font-bold text-gray-600 mb-2">
                Payment Details
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Schedule ID
                  </label>
                  <div className="text-sm font-mono font-bold">
                    {schedId ? (
                      `#${schedId}`
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Due Date
                  </label>
                  <div className="text-sm font-semibold">
                    {dueDate || <span className="text-gray-400">-</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  {paymentStatus ? (
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold
                      ${
                        paymentStatus === "OVERDUE"
                          ? "bg-red-50 border-red-300 text-red-800"
                          : paymentStatus === "PARTIALLY PAID"
                            ? "bg-blue-50 border-blue-300 text-blue-800"
                            : "bg-gray-50 border-gray-300 text-gray-700"
                      }`}
                    >
                      <span
                        className={
                          paymentStatus === "OVERDUE"
                            ? "text-red-600"
                            : "text-gray-500"
                        }
                      >
                        ●
                      </span>
                      {paymentStatus}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Outstanding Balance
                  </label>
                  <div className="text-sm font-bold text-amber-700">
                    {balance ? (
                      `₱${display(new Decimal(balance ?? 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber())}`
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2.5 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Monthly Amount
                  </label>
                  <div className="px-2 py-1.5 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm font-bold text-blue-900">
                      ₱
                      {display(
                        totalDue
                          .minus(feeDue)
                          .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
                          .toNumber()
                      )}
                    </div>
                  </div>
                </div>

                {/* If OVERDUE, show months and penalties */}
                {paymentStatus === "OVERDUE" && (
                  <>
                    {/* Display either overdue months or payments missed (if more than 1 overdues) */}
                    {overdueScheduleCount > 1 ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Payments Missed
                        </label>
                        <div className="px-2 py-1.5 bg-red-50 rounded border border-red-200">
                          <div
                            title="Overdue payments for which penalties have occurred"
                            className="text-sm font-bold text-red-900"
                          >
                            {overPaymentCount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Overdue
                        </label>
                        <div className="px-2 py-1.5 bg-red-50 rounded border border-red-200">
                          <div className="text-sm font-bold text-red-900">
                            {mosOverdue.toLocaleString()} mos
                          </div>
                        </div>
                      </div>
                    )}

                    {totalPenaltyOccured > feeDue ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Total Penalty
                        </label>
                        <div className="px-2 py-1.5 bg-red-50 rounded border border-red-200">
                          <div
                            title="Total accumulated penalties from all overdue payments"
                            className="text-sm font-bold text-red-900"
                          >
                            ₱{totalPenaltyOccured}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Penalty
                        </label>
                        <div className="px-2 py-1.5 bg-red-50 rounded border border-red-200">
                          <div className="text-sm font-bold text-red-900">
                            ₱
                            {display(
                              feeDue
                                .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
                                .toNumber()
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* For PARTIALLY PAID */}
                {paymentStatus === "PARTIALLY PAID" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Already Paid
                    </label>
                    <div className="px-2 py-1.5 bg-blue-50 rounded border border-blue-200">
                      <div className="text-sm font-bold text-blue-900">
                        ₱{display(amountPaid.toNumber())}
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Payable */}
                <div
                  className={
                    paymentStatus === "OVERDUE" ||
                    paymentStatus === "PARTIALLY PAID"
                      ? ""
                      : "md:col-span-2"
                  }
                >
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Total Payable
                  </label>
                  <div className="px-2 py-1.5 bg-green-50 rounded border border-green-400">
                    <div className="text-sm font-bold text-green-900">
                      ₱{display(totalPayableAllOverdueUnpaid)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT FORM */}
            <div className="bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-200">
              <h4 className="text-xs font-bold text-gray-600 mb-2">
                Enter Payment
              </h4>

              {fields.map(({ label, name, type, options, autoComplete }) => (
                <div
                  key={name}
                  className="form-control w-full mb-1.5 overflow-visible relative"
                >
                  <label
                    htmlFor={name}
                    className="label text-xs font-medium text-gray-600"
                  >
                    {label}
                  </label>

                  {name === "total_amount" ? (
                    <Controller
                      name="total_amount"
                      control={control}
                      rules={{
                        required: true,
                        validate: (value) => {
                          if (value <= 0)
                            return "Amount cannot be zero or negative";

                          // Skip validation checks when editing an existing payment
                          if (loanPaymentModal.type === "edit") {
                            return true;
                          }

                          const remainingDue =
                            totalPayableAllOverdueUnpaidDecimal;
                          // console.log("Remaining Due: ", remainingDue)
                          const minRequiredAmount = remainingDue
                            .mul(0.3)
                            .toDecimalPlaces(2, Decimal.ROUND_HALF_UP); // 30% of remaining amount
                          const inputValue = new Decimal(
                            value || 0
                          ).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
                          // console.log("Input Value: ", inputValue);

                          if (paymentStatus === "OVERDUE" && mosOverdue > 0) {
                            if (inputValue.lt(remainingDue))
                              return `For OVERDUE payments, amount must cover the full remaining payable of ₱${remainingDue.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                          }
                          if (inputValue.lt(minRequiredAmount))
                            return `Amount must be at least 30% of remaining payable (₱${minRequiredAmount.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
                          if (inputValue.gt(remainingDue))
                            return `Amount cannot exceed total payable of ₱${remainingDue.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                          if (inputValue.gt(new Decimal(balance || 0)))
                            return `Amount cannot exceed outstanding balance of ₱${display(new Decimal(balance || 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber())}`;
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <input
                            id="total_amount"
                            type="number"
                            autoComplete="off"
                            onWheel={(e) => e.target.blur()}
                            value={field.value}
                            placeholder="Enter Payment Amount" //AMOUNT LIMIT TO BE ADDED
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                field.onChange("");
                                return;
                              }
                              const value = new Decimal(raw)
                                .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
                                .toNumber();
                              field.onChange(value < 0 ? 0 : value);
                            }}
                            className={`input input-bordered w-full font-bold ${error ? "input-error border-red-400" : "border-green-400 focus:border-green-600"}`}
                          />
                          {error && (
                            <span className="text-xs text-error mt-1 block">
                              {error.message}
                            </span>
                          )}
                        </>
                      )}
                    />
                  ) : name === "payment_date" ? (
                    <Controller
                      name="payment_date"
                      control={control}
                      rules={{
                        required: "Payment date is required",
                        validate: (value) => {
                          const selectedDate = new Date(value);
                          const minDate = new Date();
                          minDate.setDate(minDate.getDate() - 7); // 7 days grace period
                          minDate.setHours(0, 0, 0, 0);

                          if (selectedDate < minDate) {
                            return "Payment date cannot be more than 7 days in the past";
                          }
                          return true;
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <input
                            id="payment_date"
                            type="date"
                            autoComplete="off"
                            min={getMinAllowedDate()}
                            value={field.value}
                            onChange={field.onChange}
                            className={`input input-bordered w-full ${
                              error ? "input-error border-red-400" : ""
                            }`}
                          />
                          {error && (
                            <span className="text-xs text-error mt-1 block">
                              {error.message}
                            </span>
                          )}
                        </>
                      )}
                    />
                  ) : type === "select" ? (
                    <select
                      id={name}
                      autoComplete={autoComplete}
                      {...register(name, { required: true })}
                      className="select select-bordered w-full"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select {label}
                      </option>
                      {options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : type === "readonly" ? (
                    <input
                      id={name}
                      type="text"
                      {...register(name)}
                      readOnly
                      title="Auto Generated"
                      placeholder="Will be auto-generated"
                      className="input input-bordered w-full bg-gray-100 cursor-not-allowed text-gray-500"
                    />
                  ) : (
                    <input
                      id={name}
                      type={type}
                      autoComplete={autoComplete}
                      {...register(name, { required: true })}
                      className="input input-bordered w-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </FormModal>

        <ReceiptModal
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          payment={viewPaymentData}
        />

        {/* Payment Confirmation Modal */}
        {showPaymentConfirm &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[28rem] max-w-[90vw]">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <WarningIcon className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      {loanPaymentModal.type === "edit"
                        ? "Confirm Payment Modification"
                        : "Confirm Payment Submission"}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {loanPaymentModal.type === "edit"
                        ? "You are about to modify an existing payment record. This action will update the payment schedules and recalculate loan balances. All changes will be logged for audit purposes and cannot be undone."
                        : "You are about to process a new loan payment. Please verify all details are correct as this transaction will immediately update the borrower's payment schedule and outstanding balance. This action cannot be reversed once submitted."}
                    </p>
                    {pendingPaymentData && (
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <h4 className="text-xs font-bold text-gray-700 mb-2">
                          Payment Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500 mr-2">Amount: </span>{" "}
                            <span className="font-bold text-success">
                              ₱{" "}
                              {display(
                                new Decimal(
                                  pendingPaymentData.total_amount || 0
                                )
                                  .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
                                  .toNumber()
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">Method: </span>{" "}
                            <span className="font-semibold">
                              {pendingPaymentData.payment_method}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">Date: </span>{" "}
                            <span className="font-semibold">
                              {dayjs(pendingPaymentData.payment_date).format(
                                "MM/DD/YYYY"
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 mr-1">
                              Loan Ref:{" "}
                            </span>{" "}
                            <span className="font-semibold">
                              {pendingPaymentData.loan_ref_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setShowPaymentConfirm(false)}
                  >
                    Go Back
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white shadow-sm cursor-pointer"
                    onClick={confirmPayment}
                    disabled={isAddPending || isEditPending}
                  >
                    {isAddPending || isEditPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        {loanPaymentModal.type === "edit"
                          ? "Updating Payment..."
                          : "Processing Payment..."}
                      </>
                    ) : loanPaymentModal.type === "edit" ? (
                      "Confirm Payment Update"
                    ) : (
                      "Process Payment"
                    )}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* View Payment Details Modal */}
        {viewPaymentData && (
          <dialog open className="modal overflow-hidden">
            <div className="modal-box max-w-sm md:max-w-2xl w-full flex flex-col max-h-2xl">
              {/* Fixed Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-bold">Payment Details</h3>
                <div
                  className={`badge badge-lg font-semibold ${
                    viewPaymentData.status === "PAID"
                      ? "badge-success"
                      : "badge-info"
                  }`}
                >
                  {viewPaymentData.status}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto overflow-x-hidden flex-1">
                {/* Account Info Section */}
                <div className="bg-base-200 p-3 rounded-lg mb-3">
                  <h4 className="text-xs font-bold text-gray-600 mb-2">
                    Account Information
                  </h4>
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Account Number
                      </label>
                      <div className="text-sm font-semibold">
                        {viewPaymentData.account_number}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Loan Ref Number
                      </label>
                      <div className="text-sm font-mono font-bold">
                        {viewPaymentData.loan_ref_number}
                      </div>
                    </div>
                    <div className="self-center lg:self-end">
                      <button
                        onClick={() => setShowReceipt(true)}
                        className="btn btn-warning max-h-6"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Info Section */}
                <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
                  <h4 className="text-xs font-bold text-gray-600 mb-2">
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-4 gap-2.5 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Schedule ID
                      </label>
                      <div className="text-sm font-mono font-bold">
                        #{viewPaymentData.schedule_id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Payment ID
                      </label>
                      <div className="text-sm font-mono font-bold">
                        LP_{viewPaymentData.payment_id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Payment Date
                      </label>
                      <div className="text-sm font-semibold">
                        {dayjs(viewPaymentData.payment_date).format(
                          "MM/DD/YYYY"
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Payment Method
                      </label>
                      <div className="text-sm font-semibold">
                        {viewPaymentData.payment_method}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment details */}
                <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
                  <h4 className="text-xs font-bold text-gray-600 mb-2">
                    Payment Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Principal</span>
                      <div className="px-2 py-1 bg-blue-50 rounded border border-blue-200 w-28 text-right">
                        <span className="text-sm font-bold text-blue-900">
                          ₱{viewPaymentData.principal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Interest</span>
                      <div className="px-2 py-1 bg-purple-50 rounded border border-purple-200 w-28 text-right">
                        <span className="text-sm font-bold text-purple-900">
                          ₱{viewPaymentData.interest.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fees</span>
                      <div className="px-2 py-1 bg-amber-50 rounded border border-amber-200 w-28 text-right">
                        <span className="text-sm font-bold text-amber-900">
                          ₱{viewPaymentData.fees.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-base-300">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold">
                          Total Amount
                        </span>
                        <div className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-400">
                          <span className="text-lg font-bold text-green-900">
                            ₱{viewPaymentData.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Modal Actions */}
              <div
                className={`flex justify-${memberRole === "treasurer" ? "between" : "end"} pt-4 border-t border-gray-200 mt-2 flex-shrink-0`}
              >
                <div className="modal-action mt-0">
                  {showEditModal && memberRole === "treasurer" && (
                    <button
                      onClick={editModal}
                      className="btn btn-sm btn-primary"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="modal-action mt-0">
                  <button onClick={closeViewModal} className="btn btn-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
            {/* Backdrop enables outside click to close */}
            <form
              method="dialog"
              className="modal-backdrop"
              onSubmit={closeViewModal}
            >
              <button aria-label="Close"></button>
            </form>
          </dialog>
        )}
      </div>
    </div>
  );
}

export default CoopLoansPayments;
