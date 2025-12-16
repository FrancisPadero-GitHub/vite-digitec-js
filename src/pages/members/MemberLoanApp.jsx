import { useState, useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { HandCoins } from "lucide-react";
// import { useNavigate } from "react-router-dom";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Toaster, toast } from "react-hot-toast";

// fetch hooks
import { useFetchLoanProducts } from "../../backend/hooks/shared/useFetchLoanProduct";
import { useFetchLoanApp } from "../../backend/hooks/shared/useFetchLoanApp";
import { useFetchLoanAcc } from "../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchProfile } from "../../backend/hooks/member/useFetchProfile";
import { useFetchCoop } from "../../backend/hooks/shared/useFetchCoop";

// mutation hooks
import { useAddLoanApp } from "../../backend/hooks/member/useAddLoanApp";
import { useEditLoanApp } from "../../backend/hooks/member/useEditLoanApp";
import { useCancelLoanApp } from "../../backend/hooks/member/useCancelLoanApp";

// components
import MembersFormModal from "./modal/MembersFormModal";
import FilterToolbar from "../shared/components/FilterToolbar";
import DataTableV2 from "../shared/components/DataTableV2";
import LoanApplicationInfo from "./components/LoanApplicationInfo";

// component hook
import { usePrompt } from "../shared/components/usePrompt";

// constants
import {
  LOAN_APPLICATION_STATUS_COLORS,
  LOAN_PRODUCT_COLORS,
} from "../../constants/Color";
import calcLoanSchedDiminishing from "../../constants/calcLoanSchedDiminishing";
import calcLoanSchedFlat from "../../constants/calcLoanSchedFlat";
import { useShareCapitalLoanable } from "../../constants/Calculation";

// utils
import { display } from "../../constants/numericFormat";
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";
import getYearsMonthsDaysDifference from "../../constants/DateCalculation";

// Restriction
import useLoanRestriction from "../../backend/hooks/member/utils/useRestriction";

/**
 * if loanAppsNo is more than 2 pending and active (ONLY DISABLES BUTTON)
 * if loanAccFind returns true  (ONLY DISABLES BUTTON)
 *
 * if tenure is under 1 year                (DISABLES ACCESS TO UI)
 * if age is under 18 years                 (DISABLES ACCESS TO UI)
 * if myShares is less than or equals 5000  (DISABLES ACCESS TO UI)
 *
 * PS: TO CONFIGURE THIS PAGE THIS CONDITIONS MUST BE MET FIRST
 */

function MemberLoanApp() {
  // const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const { showPrompt } = usePrompt(); // custom toaster
  const { hasRestriction, requirements } = useLoanRestriction();
  const { data: loanProducts } = useFetchLoanProducts();

  const { data: myProfile } = useFetchProfile();
  const memberInfo = myProfile || {};

  const { data: coopData } = useFetchCoop({ useLoggedInMember: true });
  const coopContributions = coopData?.data || [];

  const {
    data: memberLoanAppRaw,
    isLoading,
    isError,
    error,
  } = useFetchLoanApp({ useLoggedInMember: true });
  const loanAppRaw = memberLoanAppRaw?.data || [];

  // mutation hooks
  const { mutate: mutateAdd, isPending: isAddPending } = useAddLoanApp();
  const { mutate: mutateEdit, isPending: isEditPending } = useEditLoanApp();
  const { mutate: mutateCancel, isPending: isCancelPending } =
    useCancelLoanApp();

  const { data: loanAccRaw } = useFetchLoanAcc({ useLoggedInMember: true });
  const loanAcc = loanAccRaw?.data || [];

  const mergedLoanAccounts = loanAppRaw.map((baseRow) => {
    const viewRow = loanProducts?.find(
      (v) => v.product_id === baseRow.product_id
    );

    return {
      ...baseRow,
      ...viewRow,
    };
  });

  /**
   * Stuffs that will be used below
   */

  // Filtered Table base on the filter toolbar
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
  const handleStatusChange = (value) => {
    startTransition(() => {
      setStatusFilter(value);
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

  const TABLE_PREFIX = "LAPP_";
  const memberLoanApplications = useMemo(() => {
    return mergedLoanAccounts.filter((row) => {
      const generatedId = `${TABLE_PREFIX}${row.application_id}`;

      const matchesSearch =
        debouncedSearch === "" ||
        row.amount?.toString().includes(debouncedSearch) ||
        row.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.status?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = statusFilter === "" || row.status === statusFilter;
      const date = row.application_date ? new Date(row.application_date) : null;
      const matchesYear =
        yearFilter === "" ||
        (date && date.getFullYear().toString() === yearFilter);

      // To avoid subtext displaying numbers instead of month names
      // I had to convert the values from the monthFilter to numbers for comparison
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
      const filterMonthNumber = monthFilter
        ? monthNameToNumber[monthFilter]
        : null;
      const matchesMonth =
        monthFilter === "" ||
        (date && date.getMonth() + 1 === filterMonthNumber);

      return matchesSearch && matchesStatus && matchesYear && matchesMonth;
    });
  }, [
    mergedLoanAccounts,
    debouncedSearch,
    statusFilter,
    yearFilter,
    monthFilter,
  ]);

  // Dynamically generate year options for the past 5 years including current year
  // to get rid of the hard coded years
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
      yearFilter ? `${yearFilter}` : null,
      monthFilter ? `${monthFilter}` : null,
    ]
      .filter(Boolean)
      .join(" - ") || "Showing all loan applications";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setYearFilter("");
    setMonthFilter("");
  };

  const defaultValues = {
    application_id: null,
    /** loan_product
     * This does not exists in DB but used for the modal to show the name of the loan product
     * also used to find the name that matches it to assign the product_id
     *   */
    loan_product: "",
    amount: "",
    purpose: "",
    loan_term: "",
    status: "",
    application_date: today,

    // front end only fields can be added here
    product_id: null,
    interest_method: "",

    total_interest: 0,
    service_fee: 0,
    monthly_payment: 0,
    total_amount_due: 0,
  };

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues,
  });

  /**
   * Grab the application_id in loan application then checks it if it exists on loan accounts
   * used to conditionally render disabled inputs and selects and status on form modal
   */
  const [loanStatus, setLoanStatus] = useState(false);

  // Modal Handlers
  const [modalType, setModalType] = useState(null);
  const [isLoanInfoModalOpen, setIsLoanInfoModalOpen] = useState(false);

  const openAddModal = () => {
    // Count restrictions for loan applications and accounts
    const pendingAppsCount = loanAppRaw.filter(
      // loan applications status check
      (app) => app.status === "Pending"
    ).length;

    const activeLoansCount =
      loanAcc?.filter(
        // loan applications status check
        (loan) => loan.status === "Active"
      ).length || 0;

    const defaultedLoansCount =
      loanAcc?.filter(
        // loan accounts status check
        (loan) => loan.status === "Defaulted"
      ).length || 0;

    // Restriction parameters
    if (pendingAppsCount >= 2) {
      showPrompt(
        "info",
        `You have reached the maximum limit of 2 pending applications (${pendingAppsCount}/2)`
      );
    } else if (activeLoansCount >= 2) {
      showPrompt(
        "info",
        `You have reached the maximum limit of 2 active loans (${activeLoansCount}/2)`
      );
    } else if (defaultedLoansCount > 0) {
      showPrompt("info", "Please settle your defaulted loans first");
      // navigate("/regular-member/coop-loans/loan-accounts")
    } else {
      reset(defaultValues);
      setModalType("add");
    }
  };

  // Edit modal handler
  const openEditModal = (row) => {
    if (!row.product_id) {
      toast.error("Cannot load data missing product id");
      console.error("Cannot load data missing product id");
      return;
    }

    const matchedProduct = loanProducts?.find(
      (product) => product.product_id === row.product_id
    );
    reset({
      application_id: row.application_id,
      product_id: row.product_id,
      loan_product: matchedProduct?.name || "",
      amount: row.amount || 0,
      purpose: row.purpose || "",
      loan_term: row.loan_term || 0,
      application_date: row.application_date || today,
      status: row.status || "Pending",
    });

    // returns true or false if the application has already approved and existing in loan accounts
    // setLoanStatus(loanAcc?.some(
    //   (loan) => loan.application_id === watch("application_id")))

    // to disable the form if the app is already Denied not being able to update or delete
    // setLoanStatus(row.status === "Denied" || row.status === "Approved")

    const appFound = loanAcc?.some(
      (loan) => loan.application_id === watch("application_id")
    );

    // Disable editing if status is not pending/if it exists in loan accounts
    if (row.status !== "Pending" || appFound) {
      setLoanStatus(true);
    }

    setModalType("edit");
  };

  const closeModal = () => {
    /**
     * This reset does two crucial things
     * first it resets the values
     * second it retriggers my useEffect for loan calculation cause the dependencies are based on watch values
     */
    reset(defaultValues);
    setLoanStatus(false);
    setModalType(null);
  };

  // cancel prompt handler
  // Add state for confirmation modal
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [pendingCancelData, setPendingCancelData] = useState(null);

  // Updated Cancel handler
  const handleCancel = (data) => {
    closeModal();
    openCancelConfirmation(data);
  };

  // Cancel confirmation modal handlers
  const openCancelConfirmation = (data) => {
    setPendingCancelData(data);
    setShowCancelConfirmation(true);
  };

  const closeCancelConfirmation = () => {
    // reopen the edit modal with the previous data
    openEditModal(pendingCancelData);
    setShowCancelConfirmation(false);
  };

  const confirmCancel = () => {
    if (!pendingCancelData) return;

    const payload = {
      application_id: pendingCancelData.application_id,
      status: "Cancelled",
    };
    // console.log(payload)
    mutateCancel(payload, {
      onSuccess: () => {
        toast.success("Cancelled loan application successfully!");
        closeCancelConfirmation();
        closeModal();
      },
      onError: () => {
        toast.error("Something went wrong!");
        closeCancelConfirmation();
      },
    });
  };

  // Submit handler (add/edit)
  const onSubmit = (data) => {
    if (isAddPending || isEditPending) {
      return;
    }

    /**
     * Matches the name of the data.loan_product TO THE NAME of the product.name
     * this is very inefficient in so many ways
     *
     * Might do a fix later but this one will do for now
     */
    const selectedProduct = loanProducts?.find(
      (product) => product.name === data.loan_product
    );
    // custom payload because of this shit above lol
    const payload = {
      ...data,
      product_id: selectedProduct?.product_id || null,
    };

    if (modalType === "add") {
      mutateAdd(payload, {
        onSuccess: () => {
          // console.log("Front-end data", payload )
          toast.success("Submitted loan application successfully!");
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong!");
        },
      });
    } else {
      mutateEdit(payload, {
        onSuccess: () => {
          toast.success("Updated loan application successfully!");
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong!");
        },
      });
    }
    // console.log(data)
  };

  /**
   * Loan Product Eligibility check
   */

  const loanProductAccess = myProfile?.is_eligible_for_other_loans; // boolean true or false default is false
  const productCode = "S_CAP_LOANS"; // this is the only code or product that they can use if not eligible for other loans

  // Filter loan products based on eligibility
  const filteredLoanProducts = useMemo(() => {
    if (!loanProducts) return [];
    // If member has access to other loans show all, otherwise restrict to the feature-only code
    if (loanProductAccess) return loanProducts;
    return loanProducts.filter((p) => p.product_code === productCode);
  }, [loanProducts, loanProductAccess, productCode]);

  // Calculate total share capital
  const totalShareCapital = useMemo(() => {
    return coopContributions.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [coopContributions]);

  // Call the hook at top level to get loanable amount
  const { totalLoanable, percentage } =
    useShareCapitalLoanable(totalShareCapital);

  /**
   * Loan calculator
   *
   */

  /**
   * Finds the selected loan product from the loan products list
   * fetches the loan product info base on the selectedProduct
   */

  const selectedLoanProduct = watch("loan_product");
  const selectedProduct = useMemo(() => {
    return loanProducts?.find((p) => p.name === selectedLoanProduct);
  }, [loanProducts, selectedLoanProduct]);
  const isSpecialProduct = selectedProduct?.product_code === productCode;

  const principalValue = watch("amount");
  const loanTermValue = watch("loan_term");
  const interestRateValue = selectedProduct ? selectedProduct.interest_rate : 0;
  const interestMethod = selectedProduct ? selectedProduct.interest_method : "";
  const serviceFeeValue = selectedProduct ? selectedProduct.service_fee : 0;

  // detects the changes of principal then calculate on the go
  const [isCalculating, setIsCalculating] = useState(false);

  const calculatedLoan = useMemo(() => {
    // don't proceed if no principal value
    if (!principalValue || principalValue <= 0) return null;

    let totalPayable = 0;
    let totalInterest = 0;
    let totalServiceFee = 0;
    let totalMonthlyPayment = 0;

    if (interestMethod === "flat") {
      const result = calcLoanSchedFlat({
        interestRate: Number(interestRateValue),
        principal: Number(principalValue),
        termMonths: Number(loanTermValue),
        serviceFeeRate: Number(serviceFeeValue),
      });
      totalPayable = result.totalPayable;
      totalInterest = result.totalInterest;
      totalServiceFee = result.serviceFee;
      totalMonthlyPayment = result.monthlyPayment;
    } else if (interestMethod === "diminishing") {
      const result = calcLoanSchedDiminishing({
        interestRate: Number(interestRateValue),
        principal: Number(principalValue),
        termMonths: Number(loanTermValue),
        serviceFeeRate: Number(serviceFeeValue),
      });
      totalPayable = result.totalPayable;
      totalInterest = result.totalInterest;
      totalServiceFee = result.serviceFee;
      totalMonthlyPayment = result.monthlyPayment;
    } else {
      return null;
    }
    return {
      totalPayable,
      totalInterest,
      totalServiceFee,
      totalMonthlyPayment,
    };
  }, [
    principalValue,
    interestMethod,
    interestRateValue,
    loanTermValue,
    serviceFeeValue,
  ]);

  /**
   * Use effects
   */

  /**
   * Use Effects
   */

  // Auto-fill amount with totalLoanable if special product selected
  useEffect(() => {
    if (!selectedProduct) return;
    // Only auto-fill for the restricted product code
    if (selectedProduct.product_code === productCode) {
      const currentAmount = watch("amount");
      // Fill only if empty or zero to avoid overwriting user edits
      if (!currentAmount || Number(currentAmount) === 0) {
        setValue("amount", Number(totalLoanable));
      }
    }
  }, [selectedProduct, productCode, totalLoanable, setValue, watch]);

  // For auto calculation effect
  useEffect(() => {
    // update the calculated values to the form if changed
    // only proceed if there is a calculated loan
    if (!calculatedLoan) return;
    setIsCalculating(false);

    // function useMemo above returns these values
    const {
      totalPayable,
      totalInterest,
      totalServiceFee,
      totalMonthlyPayment,
    } = calculatedLoan;

    const currentTotal = watch("total_amount_due");
    const currentInterest = watch("total_interest");
    const currentFee = watch("service_fee");
    const currentMonthlyPayment = watch("monthly_payment");

    if (
      currentTotal !== totalPayable ||
      currentInterest !== totalInterest ||
      currentFee !== totalServiceFee ||
      currentMonthlyPayment !== totalMonthlyPayment
    ) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        setValue("total_amount_due", totalPayable);
        setValue("total_interest", totalInterest);
        setValue("service_fee", totalServiceFee);
        setValue("monthly_payment", totalMonthlyPayment);
        setIsCalculating(false);
      }, 250); // debounce time 250ms for smooth update and not jittery

      return () => clearTimeout(timer);
    }
    // The eslint-disable comment is to avoid warning for not including setValue and watchh in the dependency array
    // This is stable do not remove the dependency calculatedLoan
  }, [calculatedLoan]);

  const fields = [
    {
      label: "Loan Product",
      name: "loan_product",
      type: "select",
      required: true,
      dynamicOptions:
        filteredLoanProducts?.map((p) => ({
          label: p.name,
          // We store the loan product name as the value since selection logic matches by name
          value: p.name,
        })) || [],
    },
    {
      label: "Amount",
      name: "amount",
      type: "number",
      required: true,
      disabled: loanStatus || !selectedLoanProduct, // || isSpecialProduct - lock amount if special auto-filled product
      validation: {
        min: selectedProduct?.min_amount || 0,
        max:
          selectedProduct?.max_amount === 0
            ? totalLoanable
            : selectedProduct?.max_amount || 99999,
      },
      placeholder: selectedProduct
        ? selectedProduct?.max_amount === 0
          ? `Enter between ₱${selectedProduct.min_amount} - ₱${totalLoanable}`
          : `Enter between ₱${selectedProduct.min_amount} - ₱${selectedProduct.max_amount}`
        : "Select a loan product first",
    },
    {
      label: "Term",
      name: "loan_term",
      type: "select",
      required: true,
      dynamicOptions: selectedProduct
        ? [
            {
              label: `${selectedProduct.min_term_months} months`,
              value: selectedProduct.min_term_months,
            },
            { label: "4 months", value: 4 },
            { label: "6 months", value: 6 },
            {
              label: `${selectedProduct.max_term_months} months`,
              value: selectedProduct.max_term_months,
            },
          ]
        : [],
    },
    // Only include application date if modalType is edit
    ...(modalType === "edit"
      ? [
          {
            label: "Application Date",
            name: "application_date",
            type: "date",
            required: true,
          },
        ]
      : []),
    {
      label: "Purpose",
      name: "purpose",
      type: "textarea",
      required: false,
      placeholder: "Optional",
    },
  ];

  // --- Loan Eligibility Display ---
  if (hasRestriction) {
    // Membership duration
    const { years: tenure, months: tenureMonths } =
      getYearsMonthsDaysDifference(memberInfo?.joined_date);
    // Age
    const { years: memberAge, months: memberAgeMonths } =
      getYearsMonthsDaysDifference(memberInfo?.birthday);

    const eligibilityInfo = [
      {
        label: "Tenure",
        value:
          tenure < 1
            ? `${tenureMonths} ${tenureMonths > 1 ? "months" : "month"}`
            : `${tenure} ${tenure > 1 ? "years" : "year"}`,
        passed: tenure >= requirements.minTenure,
        rule: `${requirements.minTenure} ${requirements.minTenure > 1 ? "years" : "year"} required`,
      },
      {
        label: "Age",
        value:
          memberAge < 1
            ? `${memberAgeMonths} ${memberAgeMonths > 1 ? "months" : "month"} old`
            : `${memberAge} ${memberAge > 1 ? "years" : "year"} old`,
        passed: memberAge >= requirements.minAge,
        rule: `${requirements.minAge} years minimum`,
      },
      {
        label: "Share Capital",
        value: `₱${totalShareCapital.toLocaleString()}`,
        passed: totalShareCapital >= requirements.minShareCapital,
        rule: `₱${requirements.minShareCapital.toLocaleString()} minimum`,
      },
    ];
    return (
      <div className="flex items-start justify-center py-8 min-h-screen px-4">
        <div className="w-full mx-0 sm:mx-6 max-w-3xl p-3 sm:p-4 md:p-6 text-center bg-red-50 rounded-xl border border-red-200 shadow-sm">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-red-600">
            You are not eligible for loan applications
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 mt-2">
            Please contact the administrator or board members for assistance.
          </p>
          {/* Loan Eligibility display here */}
          <div className="mt-4 sm:mt-6 w-full max-w-2xl mx-auto text-left">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3">
                Eligibility Requirements
              </h3>
              <ul className="text-xs sm:text-sm space-y-2 sm:space-y-3">
                {eligibilityInfo.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 pb-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          item.passed ? "text-green-600" : "text-red-600"
                        }
                      >
                        {item.passed ? "✔️" : "❌"}
                      </span>
                      <span className="font-medium">{item.label}:</span>
                      <span
                        className={`font-semibold ${item.passed ? "text-green-700" : "text-red-700"}`}
                      >
                        {item.value}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 sm:ml-auto">
                      ({item.rule})
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 sm:mt-4 text-center">
                {eligibilityInfo.every((item) => item.passed) ? (
                  <span className="badge badge-success text-xs sm:text-sm">
                    Eligible
                  </span>
                ) : (
                  <span className="badge badge-error text-xs sm:text-sm">
                    Not Eligible
                  </span>
                )}
              </div>
              <label
                className="label text-xs font-medium text-base-content/90 cursor-pointer underline hover:text-blue-600 transition-colors"
                onClick={() => setIsLoanInfoModalOpen(true)}
              >
                Loan Application Info
              </label>
            </div>
          </div>
        </div>
        <LoanApplicationInfo
          isOpen={isLoanInfoModalOpen}
          onClose={() => setIsLoanInfoModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="m-3">
      <Toaster position="bottom-left" />
      <div className="space-y-2">
        {/* Put a restriction here if a certain criteria is not met */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
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
                  { label: "Pending", value: "Pending" },
                  { label: "On Review", value: "On Review" },
                  { label: "Approved", value: "Approved" },
                  { label: "Denied", value: "Denied" },
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
          <button
            className="btn btn-neutral whitespace-nowrap shadow-lg flex items-center gap-2 px-4 py-2 
                  fixed bottom-10 right-4 z-20 opacity-80 hover:opacity-100
                  lg:static lg:ml-auto lg:self-center lg:opacity-100"
            onClick={openAddModal}
            aria-label="Apply for loan"
          >
            <HandCoins />
            Apply for Loan
          </button>
        </div>

        <DataTableV2
          title={"My Loan Applications"}
          filterActive={activeFiltersText !== "Showing all loan applications"}
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={[
            "Ref No.",
            "Loan Product",
            "Amount",
            "Term",
            "Application Date",
            "Status",
          ]}
          data={memberLoanApplications}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const matchedLoanProduct = loanProducts?.find(
              (product_id) => product_id.product_id === row.product_id
            );
            const loanProductName = matchedLoanProduct?.name;

            const id = row?.application_id || "Not Found";
            const amount = row?.amount || 0;
            const term = row?.loan_term || "Not Found";
            const applicationDate = row?.application_date
              ? new Date(row.application_date).toLocaleDateString()
              : "Not Found";
            const status = row?.status || "Not Found";

            return (
              <tr
                key={`${row.application_id}`}
                className="cursor-pointer hover:bg-base-200/50 text-center"
                onClick={() => openEditModal(row)}
              >
                {/* Payment Ref. */}
                <td className="font-medium text-xs">
                  {TABLE_PREFIX}
                  {id}
                </td>

                <td>
                  {loanProductName ? (
                    <span
                      className={`font-semibold ${LOAN_PRODUCT_COLORS[loanProductName]}`}
                    >
                      {loanProductName}
                    </span>
                  ) : (
                    <span className="font-semibold text-error">
                      Not Provided
                    </span>
                  )}
                </td>

                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {display(amount)}
                </td>

                {/* Term */}
                <td>{term} Months</td>

                {/* Term */}
                <td>{applicationDate}</td>

                {/* Status */}
                <td>
                  {status ? (
                    <span
                      className={`badge font-semibold ${LOAN_APPLICATION_STATUS_COLORS[status]}`}
                    >
                      {status}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">
                      Not Provided
                    </span>
                  )}
                </td>
              </tr>
            );
          }}
        />

        <MembersFormModal
          title={"Loan Application"}
          open={modalType !== null}
          close={closeModal}
          status={loanStatus}
          action={modalType === "edit"}
          isAnyChanges={!isDirty} // only enable submit if there are changes
          onSubmit={handleSubmit(onSubmit)}
          isPending={isAddPending || isEditPending || isCancelPending}
          // This is for canceling the approved loan application not deleting
          cancelAction={() => handleCancel(getValues())} // pass all form data
        >
          <div className="pr-2">
            {fields.map((field) => {
              // Loan Product
              if (field.name === "loan_product") {
                return (
                  <div
                    key={field.name}
                    className="bg-base-100 p-3 rounded-lg border-2 border-gray-200 mb-3"
                  >
                    <div className="form-control w-full">
                      <div className="flex justify-between mb-2">
                        <label className="label text-xs font-medium text-base-content/70 mb-1">
                          {field.label}
                          <span className="text-error"> *</span>
                        </label>
                        <label
                          className="label text-xs font-medium text-base-content/90 cursor-pointer underline hover:text-blue-600 transition-colors"
                          onClick={() => setIsLoanInfoModalOpen(true)}
                        >
                          Loan Application Info
                        </label>
                      </div>

                      {loanStatus ? (
                        <div className="input input-bordered w-full bg-base-100 flex items-center">
                          {field.dynamicOptions?.find(
                            (opt) => opt.value === watch(field.name)
                          )?.label || "Select Loan Product"}
                        </div>
                      ) : (
                        <select
                          {...register(field.name, {
                            required: field.required,
                          })}
                          className="select select-bordered w-full"
                        >
                          <option value="" disabled>
                            Select Loan Product
                          </option>
                          {field.dynamicOptions?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors[field.name] && (
                        <p className="text-error text-xs mt-1">
                          Please select a loan product
                        </p>
                      )}
                    </div>

                    {/* Show loan product terms (interest, penalty, service, loan range) when selected */}
                    {selectedProduct &&
                      (isSpecialProduct ? (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-300">
                          <h5 className="text-xs font-semibold text-green-700 mb-2">
                            Share Capital Loan Summary
                          </h5>
                          <div className="text-xs space-y-3">
                            <div className="flex justify-between">
                              <span className="text-green-700">
                                Total Share Capital:
                              </span>
                              <span className="font-semibold">
                                ₱{totalShareCapital.toLocaleString() || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">
                                Loanable (%):
                              </span>
                              <span className="font-semibold">
                                {Number(percentage) || 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">
                                Max Loanable Amount:
                              </span>
                              <span className="font-bold text-green-800">
                                ₱{Number(totalLoanable).toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] mt-2 text-green-600">
                            Amount field is capped based on current share
                            capital eligibility % and your coop balance.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 sm:p-4 bg-base-100 rounded-lg border border-gray-200">
                          <h5 className="text-xs sm:text-sm font-semibold text-base-content/70 mb-3">
                            Loan Terms & Conditions
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-y-2 text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-base-content/70">
                                Interest Rate:
                              </span>
                              <span className="font-semibold text-blue-700">
                                {selectedProduct.interest_rate}%
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-base-content/70">
                                Type:
                              </span>
                              <span className="font-semibold">
                                {selectedProduct.interest_method}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-base-content/70">
                                Penalty Rate:
                              </span>
                              <span className="font-semibold text-red-500">
                                {selectedProduct.penalty_rate}%
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-base-content/70">
                                Repayment Frequency:
                              </span>
                              <span className="font-semibold">
                                {selectedProduct.repayment_freq}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-base-content/70">
                                Service Fee:
                              </span>
                              <span className="font-semibold text-purple-700">
                                {selectedProduct.service_fee}%
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="text-base-content/70">
                                Loan Entitlement:
                              </span>
                              <span className="font-bold text-green-700">
                                ₱{selectedProduct.min_amount?.toLocaleString()}{" "}
                                - ₱
                                {selectedProduct.max_amount?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              }
              // Application details (amount, term, date)
              if (field.name === "amount") {
                const hasAmount = watch("amount");
                const termField = fields?.find((f) => f.name === "loan_term");
                const dateField = fields?.find(
                  (f) => f.name === "application_date"
                );

                return (
                  <div
                    key="application-details"
                    className="bg-base-100 p-3 rounded-lg border border-gray-200 mb-3"
                  >
                    {/* Amount */}
                    <div className="mb-3">
                      <label className="label text-xs font-medium text-base-content/70 mb-1">
                        {field.label} Requested
                        <span className="text-error"> *</span>
                      </label>
                      {loanStatus ? (
                        <div className="input input-bordered w-full bg-base-100 flex items-center">
                          ₱{Number(watch("amount")).toLocaleString()}
                        </div>
                      ) : (
                        <input
                          type="number"
                          {...register(field.name, {
                            required: field.required,
                            min: field.validation?.min,
                            max: field.validation?.max,
                          })}
                          onWheel={(e) => e.target.blur()}
                          disabled={field.disabled}
                          placeholder={field.placeholder}
                          className={`input input-bordered w-full transition-all duration-200 ${
                            hasAmount ? "font-bold text-xl" : "text-sm"
                          } ${
                            field.disabled
                              ? "bg-base-100"
                              : errors[field.name]
                                ? "border-red-400"
                                : hasAmount
                                  ? "border-green-400"
                                  : "border-gray-300"
                          }`}
                        />
                      )}
                      {errors[field.name] && (
                        <p className="text-error text-xs mt-1">
                          Amount must be between ₱
                          {field.validation?.min.toLocaleString()} and ₱
                          {selectedProduct?.max_amount === 0
                            ? totalLoanable?.toLocaleString()
                            : field.validation?.max?.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Term and Date Grid */}
                    <div
                      className={`grid grid-cols-1 gap-3 ${dateField && modalType === "edit" ? "md:grid-cols-2" : ""}`}
                    >
                      {termField && (
                        <div>
                          <label className="label text-xs font-medium text-base-content/70 mb-1">
                            Term (Months)<span className="text-error"> *</span>
                          </label>
                          {loanStatus ? (
                            <div className="input input-bordered w-full bg-base-100 flex items-center">
                              {termField.dynamicOptions?.find(
                                (opt) => opt.value === watch(termField.name)
                              )?.label || "—"}
                            </div>
                          ) : (
                            <select
                              {...register(termField.name, {
                                required: termField.required,
                              })}
                              disabled={!selectedLoanProduct}
                              className="select select-bordered w-full"
                            >
                              <option value="" disabled>
                                Select Term
                              </option>
                              {termField.dynamicOptions?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}
                          {errors[termField.name] && (
                            <p className="text-error text-xs mt-1">Required</p>
                          )}
                        </div>
                      )}

                      {/* Application Date (when modal is in edit mode) */}
                      {dateField && modalType === "edit" && (
                        <div>
                          <label className="label text-xs font-medium text-base-content/70 mb-1">
                            {dateField.label}
                          </label>
                          <div className="input input-bordered w-full bg-base-100 flex items-center">
                            {watch(dateField.name)
                              ? new Date(
                                  watch(dateField.name)
                                ).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Computed Values Grid - responsive single row on wide screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 mt-4">
                      {/* Service fee */}
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Service Fee
                        </label>
                        <div
                          className={`relative px-3 py-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-300 ${isCalculating ? "opacity-50" : ""}`}
                        >
                          <div className="text-lg md:text-xl font-bold text-purple-900 truncate">
                            ₱{display(watch("service_fee")) || "0.00"}
                          </div>
                          {isCalculating && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 animate-spin">
                              <AiOutlineLoading3Quarters size={18} />
                            </span>
                          )}
                        </div>
                        <input
                          type="hidden"
                          {...register("service_fee", { required: true })}
                        />
                      </div>

                      {/* Total interest */}
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Total Interest
                        </label>
                        <div
                          className={`relative px-3 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-300 ${isCalculating ? "opacity-50" : ""}`}
                        >
                          <div className="text-lg md:text-xl font-bold text-blue-900 truncate">
                            ₱{display(watch("total_interest")) || "0.00"}
                          </div>
                          {isCalculating && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 animate-spin">
                              <AiOutlineLoading3Quarters size={18} />
                            </span>
                          )}
                        </div>
                        <input
                          type="hidden"
                          {...register("total_interest", { required: true })}
                        />
                      </div>

                      {/* Monthly amount due */}
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Monthly Due
                        </label>
                        <div
                          className={`relative px-3 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-300 ${isCalculating ? "opacity-50" : ""}`}
                        >
                          <div className="text-lg md:text-xl font-bold text-emerald-900 truncate">
                            ₱{display(watch("monthly_payment")) || "0.00"}
                          </div>
                          {isCalculating && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 animate-spin">
                              <AiOutlineLoading3Quarters size={18} />
                            </span>
                          )}
                        </div>
                        <input
                          type="hidden"
                          {...register("monthly_payment", { required: true })}
                        />
                      </div>

                      {/* Total amount due */}
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Total Amount Due
                        </label>
                        <div
                          className={`relative px-3 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-300 ${isCalculating ? "opacity-50" : ""}`}
                        >
                          <div className="text-lg md:text-xl font-bold truncate">
                            ₱
                            {watch("total_amount_due")
                              ? parseFloat(
                                  watch("total_amount_due")
                                ).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "0.00"}
                          </div>
                          {isCalculating && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 animate-spin">
                              <AiOutlineLoading3Quarters size={18} />
                            </span>
                          )}
                        </div>
                        <input
                          type="hidden"
                          {...register("total_amount_due", { required: true })}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              if (field.name === "purpose") {
                return (
                  <div
                    key={field.name}
                    className="bg-base-100 p-3 rounded-lg border border-gray-200"
                  >
                    <h4 className="text-xs font-semibold text-base-content/70 mb-2">
                      Loan Purpose
                    </h4>
                    <input
                      {...register(field.name, { required: field.required })}
                      readOnly={loanStatus}
                      placeholder={field.placeholder}
                      className={`input input-bordered w-full ${loanStatus ? "bg-base-100" : ""}`}
                    />
                    {errors[field.name] && (
                      <p className="text-error text-xs mt-1">
                        Please provide a purpose for this loan
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </MembersFormModal>

        {/* Place this once inside the component’s return, e.g. near other modals */}
        <LoanApplicationInfo
          isOpen={isLoanInfoModalOpen}
          onClose={() => setIsLoanInfoModalOpen(false)}
        />

        {/* Cancel Confirmation Modal */}

        {showCancelConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Cancel Loan Application
                </h3>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Are you sure you want to cancel this loan application?
                  </p>
                  <p className="text-red-600 font-semibold text-sm mt-2">
                    ⚠️ This action cannot be undone.
                  </p>
                </div>

                {pendingCancelData && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Application ID:</span>
                      <span className="font-semibold">
                        LAPP_{pendingCancelData.application_id}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-600">
                        ₱{Number(pendingCancelData.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeCancelConfirmation}
                  disabled={isCancelPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  No, Keep It
                </button>
                <button
                  type="button"
                  onClick={confirmCancel}
                  disabled={isCancelPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCancelPending ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Yes, Cancel Application
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberLoanApp;
