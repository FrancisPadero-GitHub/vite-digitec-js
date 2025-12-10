import { useState, useTransition, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  AccountBalanceWallet,
  ReceiptLong,
  CreditCard,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useFetchClubFundsView } from "../../backend/hooks/shared/view/useFetchClubFundsView";

// mutation hooks
import { useAddClubFunds } from "../../backend/hooks/treasurer/useAddClubFunds";
import { useEditClubFunds } from "../../backend/hooks/treasurer/useEditClubFunds";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// components
import FormModal from "./modals/FormModal";
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";
import DeleteConfirmationModal from "../shared/modal/DeleteConfirmationModal";
import StatCardV2 from "../shared/components/StatCardV2";
import ClubFundsReceiptModal from "./modals/ClubFundsReceiptModal";

// constants
import {
  CLUB_CATEGORY_COLORS,
  PAYMENT_METHOD_COLORS,
} from "../../constants/Color";
import placeHolderAvatar from "../../assets/placeholder-avatar.png";
import { useFetchTotal } from "../../backend/hooks/shared/useFetchTotal";
import { calcGrowth } from "../shared/utils/CurrentVSPrevCalculator";

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";
import { display } from "../../constants/numericFormat";
import { getMinAllowedDate, getLocalDateString } from "../board/helpers/utils";

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

// Format date string for month input
function formatForMonthInput(dateString) {
  return dateString?.substring(0, 7) || "";
}

function ClubFunds() {
  // helper
  const today = getLocalDateString(new Date());
  const navigate = useNavigate();

  // data fetch
  const { memberRole } = useMemberRole();
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const {
    data: club_funds_data,
    isLoading,
    isError,
    error,
  } = useFetchClubFundsView({});

  // mutation hooks

  const { mutate: mutateAdd, isPending: isAddPending } = useAddClubFunds();
  const { mutate: mutateEdit, isPending: isEditPending } = useEditClubFunds();
  const { mutate: mutateDelete } = useDelete("club_fund_contributions");

  /**
   *  Search and filter for the filterbar
   */
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
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
  const handleCategoryChange = (value) => {
    startTransition(() => {
      setCategoryFilter(value);
    });
  };
  const handleMethodChange = (value) => {
    startTransition(() => {
      setMethodFilter(value);
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
  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250);

  const TABLE_PREFIX = "CFC";
  const clubFunds = useMemo(() => {
    /**
     * you might be asking why not just use club_funds_data?.data directly?
     * the reason is that useMemo will only recompute the filtered data when
     * one of its dependencies change (club_funds_data, debouncedSearch, categoryFilter, methodFilter, yearFilter, monthFilter)
     * this optimizes performance by avoiding unnecessary recalculations on every render
     * especially when dealing with large datasets.
     */
    const clubFundsRaw = club_funds_data?.data || [];
    return clubFundsRaw.filter((row) => {
      const generatedId = `${TABLE_PREFIX}_${row?.contribution_id || ""}`;
      const matchesSearch =
        debouncedSearch === "" ||
        (row.full_name &&
          row.full_name
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())) ||
        row.account_number
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        row.category?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory =
        categoryFilter === "" || row.category === categoryFilter;
      const matchesMethod =
        methodFilter === "" || row.payment_method === methodFilter;
      const date = row.payment_date ? new Date(row.payment_date) : null;
      const matchesYear =
        yearFilter === "" ||
        (date && date.getFullYear().toString() === yearFilter);

      const filterMonthNumber = monthFilter
        ? monthNameToNumber[monthFilter]
        : null;
      const matchesMonth =
        monthFilter === "" ||
        (date && date.getMonth() + 1 === filterMonthNumber);
      // just a nested return dont be confused
      return (
        matchesSearch &&
        matchesCategory &&
        matchesYear &&
        matchesMonth &&
        matchesMethod
      );
    });
  }, [
    club_funds_data,
    debouncedSearch,
    categoryFilter,
    methodFilter,
    yearFilter,
    monthFilter,
  ]);

  // Derived filters for totals (driven by toolbar year/month)
  const monthForTotals = monthFilter ? monthNameToNumber[monthFilter] : null;
  const yearForTotals = yearFilter ? Number(yearFilter) : null;
  const currentYear = new Date().getFullYear();
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
    key: `clubfunds-summary-current-${totalsSubtitle}`,
  });

  const {
    data: prevSummary,
    isLoading: loadingPrev,
    isError: isPrevError,
    error: prevErrorMessage,
  } = useFetchTotal({
    rpcFn: "get_funds_summary",
    month: prevPeriod.month,
    year: prevPeriod.year,
    key: `clubfunds-summary-prev-${totalsSubtitle}`,
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
        statName: "Club Fund Balance",
        amount: Number(c.club_balance ?? 0),
        growthPercent: calcGrowth(c.club_balance, p.club_balance),
        iconBgColor: "bg-emerald-500",
        icon: <AccountBalanceWallet />,
        subtitle: totalsSubtitle,
        loading: loadingTotals,
        error: errorTotals,
        errorMessage: errorMessageTotals,
      },
      {
        statName: "Club Expenses",
        amount: Number(c.club_total_expenses ?? 0),
        type: "expenses",
        growthPercent: calcGrowth(c.club_total_expenses, p.club_total_expenses),
        iconBgColor: "bg-rose-500",
        icon: <ReceiptLong />,
        subtitle: totalsSubtitle,
        loading: loadingTotals,
        error: errorTotals,
        errorMessage: errorMessageTotals,
      },
      {
        statName: "Overall Total Cash",
        amount: Number(c.overall_total_cash ?? 0),
        growthPercent: calcGrowth(c.overall_total_cash, p.overall_total_cash),
        iconBgColor: "bg-indigo-500",
        icon: <CreditCard />,
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

  // This is used for the combobox selection of members upon searching for account_number
  const [query, setQuery] = useState("");
  // for smoothing out filtering
  const debouncedQuery = useDebounce(query, 250); // 250ms delay feels natural
  const filteredMembers =
    debouncedQuery === ""
      ? (members || []).filter((m) => m.account_role === "regular-member")
      : members.filter(
          (m) =>
            m.account_role === "regular-member" &&
            `${m.account_number} ${m.f_name} ${m.l_name} ${m.account_role}`
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase())
        );

  // Dynamically generate year options for the past 5 years including current year
  // to get rid of the hard coded years
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  // just for fancy subtext in line with active filters
  const activeFiltersText =
    [
      debouncedSearch ? `Search: "${debouncedSearch}"` : null,
      categoryFilter ? `${categoryFilter}` : null,
      methodFilter ? `${methodFilter}` : null,
      yearFilter ? `${yearFilter}` : null,
      monthFilter ? `${monthFilter}` : null,
    ]
      .filter(Boolean)
      .join(" - ") || "Showing all contributions";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setYearFilter("");
    setMonthFilter("");
    setMethodFilter("");
  };

  // extract default form values to reuse in modal resets and in rhf initialization
  const defaultFormValues = {
    contribution_id: null,
    account_number: null,
    amount: 0,
    category: "",
    payment_date: today,
    payment_method: "",
    remarks: "",
    period_start: "",
    period_end: "",
  };

  // react hook form
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { isDirty },
  } = useForm({
    defaultValues: defaultFormValues,
  });

  // Watch the category field for changes
  const watchedCategory = useWatch({
    control,
    name: "category",
    defaultValue: "",
  });

  /**
   * Modal handlers
   */
  const [modalType, setModalType] = useState(null);
  const openAddModal = () => {
    reset(defaultFormValues); // used here and in closeModal (because if not, it retains last row's edited values)
    setModalType("add");
  };

  const openEditModal = (selectedRowData) => {
    // Format data for period fields for month inputs
    let formData = { ...selectedRowData };

    // Convert period fields to (YYYY-MM)
    if (formData.period_start) {
      formData.period_start = formatForMonthInput(formData.period_start);
    }
    if (formData.period_end) {
      formData.period_end = formatForMonthInput(formData.period_end);
    }

    reset(formData);
    setModalType("edit");
  };

  const openProfile = (memberId) => {
    if (memberId) {
      navigate(`/${memberRole}/member-profile/${memberId}`);
    } else {
      toast.error("Member ID not found");
    }
  };

  const closeModal = () => {
    reset(defaultFormValues);
    setModalType(null);
  };

  const openViewModal = (data) => {
    setViewContributionData(data);
  };

  const closeViewModal = () => {
    setViewContributionData(null);
  };

  // Delete confirmation modal state & handlers
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // View modal state
  const [viewContributionData, setViewContributionData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const openDeleteModal = (contribution_id) => {
    setDeleteTargetId(contribution_id);
    setIsDeleteModalOpen(true);
  };

  const [isStatsVisible, setIsStatsVisible] = useState(true);

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      mutateDelete(
        {
          table: "club_funds_contributions",
          column_name: "contribution_id",
          id: deleteTargetId,
        },
        {
          onSuccess: () => {
            toast.success("Transaction deleted successfully");
          },
        }
      );
      closeDeleteModal();
      closeModal();
    }
  };

  const onSubmit = (data) => {
    // Prevent double submission
    if (isAddPending || isEditPending) {
      return;
    }

    // Normalize month inputs; now (YYYY-MM-01)
    const payload = {
      ...data,
      period_start: data.period_start ? `${data.period_start}-01` : null,
      period_end: data.period_end ? `${data.period_end}-01` : null,
    };

    if (modalType === "add") {
      mutateAdd(payload, {
        onSuccess: () => {
          toast.success("Club fund contribution added");
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      });
    } else if (modalType === "edit") {
      mutateEdit(payload, {
        onSuccess: () => {
          toast.success("Successfully updated");
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      });
    }
  };

  const fields = [
    { label: "Amount", name: "amount", type: "number", autoComplete: "off" },
    {
      label: "Category",
      name: "category",
      type: "select",
      options: [
        { label: "GMM", value: "GMM" },
        { label: "Monthly Dues", value: "Monthly Dues" },
        { label: "Activities", value: "Activities" },
        { label: "Community Service", value: "Community Service" },
        { label: "Alalayang Agila", value: "Alalayang Agila" },
        { label: "Others", value: "Others" },
      ],
    },
    {
      label: "Payment Date",
      name: "payment_date",
      type: "date",
      autoComplete: "off",
    },
    {
      label: "Payment Method",
      name: "payment_method",
      type: "select",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ],
    },
    { label: "Remarks", name: "remarks", type: "text", optional: true },
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
                label: "All Category",
                value: categoryFilter,
                onChange: handleCategoryChange,
                options: [
                  { label: "Monthly Dues", value: "Monthly Dues" },
                  { label: "Activities", value: "Activities" },
                  { label: "Alalayang Agila", value: "Alalayang Agila" },
                  { label: "Community Service", value: "Community Service" },
                  { label: "Others", value: "Others" },
                ],
              },
              {
                label: "All Method",
                value: methodFilter,
                onChange: handleMethodChange,
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
          <div className="flex gap-2 lg:ml-auto justify-between lg:self-center">
            <button
              className="btn btn-neutral whitespace-nowrap shadow-lg flex items-center gap-2 px-4 py-2 
                         fixed bottom-25 right-4 z-20 opacity-80 hover:opacity-100
                         lg:static lg:ml-auto lg:self-center lg:opacity-100"
              title="Manage Monthly Dues"
              aria-label="Manage Monthly Dues"
              type="button"
              onClick={() => navigate(`/${memberRole}/monthly-dues`)}
            >
              <CalendarMonthIcon />
              Monthly Dues
            </button>
            {memberRole !== "board" && (
              <button
                className="btn btn-neutral whitespace-nowrap shadow-lg flex items-center gap-2 px-4 py-2 
                           fixed bottom-10 right-4 z-20 opacity-80 hover:opacity-100
                           lg:static lg:ml-auto lg:self-center lg:opacity-100"
                title="Add contribution"
                aria-label="Add Contribution"
                type="button"
                onClick={openAddModal}
              >
                <AddCircleIcon />
                Fund Contribution
              </button>
            )}
          </div>
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
          title="Club Funds Contributions"
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={[
            "Ref No.",
            "Account No.",
            "Name",
            "Amount",
            "Category",
            "Date",
            "Method",
            "Receipt No.",
          ]}
          filterActive={activeFiltersText !== "Showing all contributions"}
          data={clubFunds}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.contribution_id || "Not Found";
            const memberId = row?.member_id || null;
            const accountNo = row?.account_number || "Not Found";
            const fullName = row?.full_name || "Not Found";
            const avatarUrl = row?.avatar_url || placeHolderAvatar;
            const amount = row?.amount || 0;
            const clubCategory = row?.category || "Not Found";
            const paymentDate = row?.payment_date
              ? new Date(row.payment_date).toLocaleDateString()
              : "Not Found";
            const paymentMethod = row?.payment_method || "Not Found";
            const receiptNo = row?.receipt_no || "--";
            return (
              <tr
                key={id}
                onClick={() => openViewModal(row)}
                className="text-center cursor-pointer hover:bg-base-200/50"
              >
                {/* Ref no. */}
                <td className=" text-center font-medium text-xs">
                  {TABLE_PREFIX}_{id}
                </td>

                {/* Account No */}
                <td
                  className=" text-center font-medium text-xs hover:underline"
                  // you can only navigate if memberId is available
                  onClick={() => openProfile(memberId)}
                >
                  {accountNo}
                </td>
                {/* Full name and avatar */}
                <td>
                  <span className="flex items-center gap-3">
                    <>
                      {/* Avatar */}
                      <div className="avatar">
                        <div className="mask mask-circle w-10 h-10">
                          <img src={avatarUrl} alt={fullName} />
                        </div>
                      </div>
                      {/* Full name */}
                      <span className="truncate">{fullName}</span>
                    </>
                  </span>
                </td>
                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {display(amount)}
                </td>
                {/* Category */}
                <td>
                  <span
                    className={`font-semibold ${CLUB_CATEGORY_COLORS[clubCategory]}`}
                  >
                    {clubCategory}
                  </span>
                </td>
                {/* Payment Date */}
                <td>{paymentDate}</td>

                {/* Payment Method */}
                <td>
                  <span
                    className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}
                  >
                    {paymentMethod}
                  </span>
                </td>
                {/* Receipt No */}
                <td className=" text-center font-medium text-xs hover:underline">
                  {receiptNo}
                </td>
              </tr>
            );
          }}
        />
      </div>

      <FormModal
        table={"Club Funds"}
        open={modalType !== null}
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        isPending={isAddPending || isEditPending}
        status={isAddPending || isEditPending || !isDirty}
        deleteAction={() => openDeleteModal(getValues("contribution_id"))}
      >
        <div className="pl-1 pr-2 pb-2">
          {/* Member Combobox with Controller */}
          <div className="form-control w-full">
            <label className="label text-sm font-semibold mb-2">
              Member Account
            </label>
            <Controller
              name="account_number"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Combobox
                    value={
                      members.find((m) => m.account_number === field.value) ||
                      null
                    }
                    onChange={(member) =>
                      field.onChange(member?.account_number)
                    }
                  >
                    <ComboboxInput
                      required
                      className="input input-bordered w-full"
                      placeholder="Search by Account Number or Name..."
                      displayValue={(member) =>
                        member ? member.account_number : ""
                      }
                      onChange={(e) => setQuery(e.target.value)}
                    />
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
                                    src={member.avatar_url || placeHolderAvatar}
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

          {fields.map(
            ({ label, name, type, options, autoComplete, optional }) => (
              <div key={name} className="form-control w-full mt-2">
                <label htmlFor={name}>
                  <span className="label text-sm font-semibold mb-2">
                    {label}
                    {optional && (
                      <span className="text-base-content/60 text-sm">
                        (optional)
                      </span>
                    )}
                  </span>
                </label>

                {name === "amount" ? (
                  <Controller
                    name="amount"
                    control={control}
                    rules={{
                      required: true,
                      min: {
                        value: 1,
                        message: "Amount must be greater than 0",
                      },
                      validate: (value) =>
                        value > 0 || "Amount cannot be zero or negative",
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <input
                          id="amount"
                          type="number"
                          autoComplete={autoComplete}
                          value={field.value}
                          placeholder="Enter Amount"
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              field.onChange(""); // allow clearing
                              return;
                            }

                            const value = Number(raw);
                            field.onChange(value < 0 ? 0 : value);
                          }}
                          className={`input input-bordered w-full ${
                            error ? "input-error" : ""
                          }`}
                        />
                        {error && (
                          <span className="text-sm text-error mt-1 block">
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
                        if (modalType === "add") {
                          const selectedDate = new Date(value);
                          const minDate = new Date();
                          minDate.setDate(minDate.getDate() - 3);
                          minDate.setHours(0, 0, 0, 0);
                          if (selectedDate < minDate) {
                            return "Payment date cannot be more than 3 days in the past";
                          }
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
                          readOnly={modalType === "edit"}
                          min={
                            modalType === "add"
                              ? getMinAllowedDate()
                              : undefined
                          }
                          value={field.value}
                          onChange={field.onChange}
                          className={`input input-bordered w-full ${
                            error ? "input-error border-red-400" : ""
                          }`}
                        />
                        {error && (
                          <span className="text-sm text-error mt-1 block">
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
                    {...register(name, { required: name !== "remarks" })}
                    className="select select-bordered w-full"
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
                ) : (
                  <input
                    id={name}
                    autoComplete={autoComplete}
                    type={type}
                    {...register(name, { required: name !== "remarks" })}
                    className="input input-bordered w-full"
                  />
                )}
              </div>
            )
          )}

          {/* if category = Monthly Dues, show period fields (since members can pay in advance) */}
          {watchedCategory === "Monthly Dues" && (
            <div className="flex justify-between gap-4">
              <div className="form-control w-full mt-2">
                <label htmlFor="period_start">
                  <span className="label text-sm font-semibold mb-2">
                    Starting Month
                  </span>
                </label>
                <input
                  id="period_start"
                  type="month"
                  {...register("period_start", { required: true })}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control w-full mt-2">
                <label htmlFor="period_end">
                  <span className="label text-sm font-semibold mb-2">
                    Ending Month
                  </span>
                </label>
                <input
                  id="period_end"
                  type="month"
                  {...register("period_end", { required: true })}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
          )}
        </div>
      </FormModal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Contribution"
        message="Are you sure you want to delete this contribution? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={false}
      />

      {/* Receipt Modal */}
      <ClubFundsReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        contribution={viewContributionData}
      />

      {/* View Contribution Details Modal */}
      {viewContributionData && (
        <dialog open className="modal overflow-hidden">
          <div className="modal-box max-w-sm md:max-w-2xl w-full flex flex-col max-h-2xl">
            {/* Fixed Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-bold">
                Club Fund Contribution Details
              </h3>
              <div
                className={`badge badge-lg font-semibold ${
                  viewContributionData.category === "GMM"
                    ? "badge-info"
                    : viewContributionData.category === "Monthly Dues"
                      ? "badge-success"
                      : viewContributionData.category === "Activities"
                        ? "badge-warning"
                        : viewContributionData.category === "Community Service"
                          ? "badge-primary"
                          : viewContributionData.category === "Alalayang Agila"
                            ? "badge-accent"
                            : "badge-ghost"
                }`}
              >
                {viewContributionData.category}
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
                      {viewContributionData.account_number}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Member Name
                    </label>
                    <div className="text-sm font-mono font-bold">
                      {viewContributionData.full_name}
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

              {/* Contribution Info Section */}
              <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
                <h4 className="text-xs font-bold text-gray-600 mb-2">
                  Contribution Information
                </h4>
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Contribution ID
                    </label>
                    <div className="text-sm font-mono font-bold">
                      CFC_{viewContributionData.contribution_id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Receipt No.
                    </label>
                    <div className="text-sm font-mono font-bold">
                      {viewContributionData.receipt_no || "--"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Payment Date
                    </label>
                    <div className="text-sm font-semibold">
                      {new Date(
                        viewContributionData.payment_date
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Payment Method
                    </label>
                    <div className="text-sm font-semibold">
                      {viewContributionData.payment_method}
                    </div>
                  </div>
                </div>
                {viewContributionData.remarks && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Remarks
                    </label>
                    <div className="text-sm text-gray-700">
                      {viewContributionData.remarks}
                    </div>
                  </div>
                )}
                {viewContributionData.period_start &&
                  viewContributionData.period_end && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Coverage Period
                      </label>
                      <div className="text-sm font-semibold">
                        {viewContributionData.period_start} to{" "}
                        {viewContributionData.period_end}
                      </div>
                    </div>
                  )}
              </div>

              {/* Amount Details */}
              <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
                <h4 className="text-xs font-bold text-gray-600 mb-2">Amount</h4>
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold">Total Amount</span>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-400">
                      <span className="text-lg font-bold text-green-900">
                        ₱{display(viewContributionData.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Modal Actions */}
            <div
              className={`flex justify-${
                memberRole === "treasurer" ? "between" : "end"
              } pt-4 border-t border-gray-200 mt-2 flex-shrink-0`}
            >
              <div className="modal-action mt-0">
                {memberRole === "treasurer" && (
                  <button
                    onClick={() => {
                      closeViewModal();
                      openEditModal(viewContributionData);
                    }}
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
  );
}
export default ClubFunds;
