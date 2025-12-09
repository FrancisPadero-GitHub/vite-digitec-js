import { useState, useTransition, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  AccountBalanceWallet,
  ReceiptLong,
  CreditCard,
} from "@mui/icons-material";

// fetch hooks
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useFetchExpenses } from "../../backend/hooks/shared/useFetchExpenses";

// mutation hooks
import { useAddExpenses } from "../../backend/hooks/treasurer/useAddExpenses";
import { useEditExpenses } from "../../backend/hooks/treasurer/useEditExpenses";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// components
import FormModal from "./modals/FormModal";
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";
import DeleteConfirmationModal from "../shared/modal/DeleteConfirmationModal";
import StatCardV2 from "../shared/components/StatCardV2";

// constants
import { CLUB_CATEGORY_COLORS } from "../../constants/Color";
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

function ClubExpenses() {
  // date helper
  const today = getLocalDateString(new Date());

  // data fetch
  const { memberRole } = useMemberRole();
  const {
    data: fund_expenses_data,
    isLoading,
    isError,
    error,
  } = useFetchExpenses({});

  // mutation hooks
  const { mutate: mutateAdd, isPending: isAddPending } = useAddExpenses();
  const { mutate: mutateEdit, isPending: isEditPending } = useEditExpenses();
  const { mutate: mutateDelete } = useDelete("club_funds_expenses");

  /**
   *  Search and filter for the filterbar
   */
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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

  const TABLE_PREFIX = "EXP";
  const fundExpenses = useMemo(() => {
    /**
     * you might be asking why not just use club_funds_data?.data directly?
     * the reason is that useMemo will only recompute the filtered data when
     * one of its dependencies change (club_funds_data, debouncedSearch, categoryFilter, methodFilter, yearFilter, monthFilter)
     * this optimizes performance by avoiding unnecessary recalculations on every render
     * especially when dealing with large datasets.
     */
    const fundExpensesRaw = fund_expenses_data?.data || [];
    return fundExpensesRaw.filter((row) => {
      const generatedId = `${TABLE_PREFIX}_${row?.transaction_id || ""}`;
      const matchesSearch =
        debouncedSearch === "" ||
        row.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.description
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory =
        categoryFilter === "" || row.category === categoryFilter;
      const date = row.transaction_date ? new Date(row.transaction_date) : null;
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
      return matchesSearch && matchesCategory && matchesYear && matchesMonth;
    });
  }, [
    fund_expenses_data,
    debouncedSearch,
    categoryFilter,
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
    key: `clubexpenses-summary-current-${totalsSubtitle}`,
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
    key: `clubexpenses-summary-prev-${totalsSubtitle}`,
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

  // Dynamically generate year options for the past 5 years and current year
  // to get rid of the hard coded years
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  const activeFiltersText =
    [
      debouncedSearch ? `Search: "${debouncedSearch}"` : null,
      categoryFilter ? `${categoryFilter}` : null,
      yearFilter ? `${yearFilter}` : null,
      monthFilter ? `${monthFilter}` : null,
    ]
      .filter(Boolean)
      .join(" - ") || "Showing all expenses";

  // clear fitlters handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setYearFilter("");
    setMonthFilter("");
  };

  // extract default form values to reuse in modal resets and in rhf initialization
  const defaultFormValues = {
    transaction_id: null,
    title: "",
    category: "",
    description: "",
    amount: 0,
    transaction_date: today,
  };

  // React Hook Form
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

  /**
   *  Modal Handlers
   */
  const [modalType, setModalType] = useState(null);
  const openAddModal = () => {
    reset(defaultFormValues); // used here and in closeModal (because if not, it retains last row's edited values)
    setModalType("add");
  };

  const openEditModal = (selectedRowData) => {
    reset(selectedRowData);
    setModalType("edit");
  };

  const closeModal = () => {
    reset(defaultFormValues);
    setModalType(null);
  };

  // Delete confirmation modal state & handlers
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const openDeleteModal = (transaction_id) => {
    setDeleteTargetId(transaction_id);
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
          table: "club_funds_expenses",
          column_name: "transaction_id",
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

  // Form submission through RHF
  const onSubmit = (data) => {
    // Prevent double submission
    if (isAddPending || isEditPending) {
      return;
    }

    const parsedData = { ...data, amount: Number(data.amount) };

    if (modalType === "add") {
      mutateAdd(parsedData, {
        onSuccess: () => {
          toast.success("Expense transaction added");
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      });
    } else if (modalType === "edit") {
      mutateEdit(parsedData, {
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
    { label: "Title", name: "title", type: "text", autoComplete: "off" },
    { label: "Amount", name: "amount", type: "number", autoComplete: "off" },
    {
      label: "Category",
      name: "category",
      type: "select",
      options: [
        { label: "GMM", value: "GMM" },
        { label: "Activities", value: "Activities" },
        { label: "Community Service", value: "Community Service" },
        { label: "Alalayang Agila", value: "Alalayang Agila" },
        { label: "Others", value: "Others" },
      ],
    },
    { label: "Date", name: "transaction_date", type: "date" },
    { label: "Description", name: "description", type: "text", optional: true },
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
                  { label: "GMM", value: "GMM" },
                  { label: "Activities", value: "Activities" },
                  { label: "Alalayang Agila", value: "Alalayang Agila" },
                  { label: "Community Service", value: "Community Service" },
                  { label: "Others", value: "Others" },
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
              title="Add Expenses"
              aria-label="Add Expenses"
              type="button"
              onClick={openAddModal}
            >
              <AddCircleIcon />
              Expenses
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
          title="Club Expenses"
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={["Ref No.", "Title", "Amount", "Category", "Date"]}
          filterActive={activeFiltersText !== "Showing all expenses"}
          data={fundExpenses}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.transaction_id || "Not Found";
            const title = row?.title || "Not Found";
            const amount = row?.amount || 0;
            const category = row?.category || "Not Found";
            const transactionDate = row?.transaction_date
              ? new Date(row.transaction_date).toLocaleDateString()
              : "Not Found";
            return (
              <tr
                key={id}
                onClick={
                  memberRole !== "board" ? () => openEditModal(row) : undefined
                }
                className="text-center cursor-pointer hover:bg-base-200/50"
              >
                {/* Ref no. */}
                <td className=" text-center font-medium text-xs">
                  {TABLE_PREFIX}_{id}
                </td>
                {/* Title */}
                <td className=" text-center font-medium">{title}</td>
                {/* Amount */}
                <td className=" font-semibold text-error">
                  ₱ {display(amount)}
                </td>
                {/* Category */}
                <td>
                  <span
                    className={`font-semibold ${CLUB_CATEGORY_COLORS[category]}`}
                  >
                    {category}
                  </span>
                </td>
                {/* Transaction Date */}
                <td>{transactionDate}</td>
              </tr>
            );
          }}
        />
      </div>

      <FormModal
        table={"Expenses"}
        open={modalType !== null}
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        isPending={isAddPending || isEditPending}
        status={isAddPending || isEditPending || !isDirty}
        deleteAction={() => openDeleteModal(getValues("transaction_id"))}
      >
        <div className="pl-1 pr-2 pb-2">
          {fields.map(
            ({ label, name, type, options, autoComplete, optional }) => (
              <div key={name} className="form-control w-full mt-2">
                <label htmlFor={name} className="label mb-1">
                  <span className="label-text font-medium text-gray-700">
                    {label}
                  </span>
                  {optional && (
                    <span className="text-base-content/60 text-sm">
                      (optional)
                    </span>
                  )}
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
                ) : name === "transaction_date" ? (
                  <Controller
                    name="transaction_date"
                    control={control}
                    rules={{
                      required: "Transaction date is required",
                      validate: (value) => {
                        const selectedDate = new Date(value);
                        const minDate = new Date();
                        minDate.setDate(minDate.getDate() - 3);
                        minDate.setHours(0, 0, 0, 0);
                        if (selectedDate < minDate) {
                          return "Transaction date cannot be more than 3 days in the past";
                        }
                        return true;
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <input
                          id="transaction_date"
                          type="date"
                          min={getMinAllowedDate()}
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
                    {...register(name, { required: true })}
                    className="select select-bordered w-full"
                    required
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
                ) : name === "description" ? (
                  <textarea
                    id={name}
                    rows={4}
                    {...register(name, { required: false })}
                    className="textarea textarea-bordered w-full"
                    placeholder={`Enter ${label}`}
                  ></textarea>
                ) : (
                  <input
                    id={name}
                    type={type}
                    {...register(name, { required: true })}
                    className="input input-bordered w-full"
                    placeholder={`Enter ${label}`}
                    autoComplete={autoComplete}
                  />
                )}
              </div>
            )
          )}
        </div>
      </FormModal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={false}
      />
    </div>
  );
}

export default ClubExpenses;
