import { useState, useTransition, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from "react-router-dom";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useFetchClubFundsView } from '../../backend/hooks/shared/view/useFetchClubFundsView';

// mutation hooks
import { useAddClubFunds } from "../../backend/hooks/treasurer/useAddClubFunds";
import { useEditClubFunds } from "../../backend/hooks/treasurer/useEditClubFunds";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// components
import FormModal from "./modals/FormModal";
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";
import DeleteConfirmationModal from "../shared/modal/DeleteConfirmationModal";

// constants
import { CLUB_CATEGORY_COLORS, PAYMENT_METHOD_COLORS, } from "../../constants/Color";
import placeHolderAvatar from "../../assets/placeholder-avatar.png";

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";
import { display } from "../../constants/numericFormat";

// HELPER FUNCTIONS
// To avoid timezone issues with date inputs, we convert dates to local date strings
function getLocalDateString(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}

// Format date string for month input
function formatForMonthInput(dateString) {
  return dateString?.substring(0, 7) || '';
};

function ClubFunds() {
  // helper
  const today = getLocalDateString(new Date());
  const navigate = useNavigate();

  // data fetch
  const { memberRole } = useMemberRole();
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const { data: club_funds_data, isLoading, isError, error } = useFetchClubFundsView({});

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
        (row.full_name && row.full_name
          .toLowerCase()
          .includes(debouncedSearch
            .toLowerCase())) ||
        row.account_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.category?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory =
        categoryFilter === "" || row.category === categoryFilter;
      const matchesMethod =
        methodFilter === "" || row.payment_method === methodFilter;
      const date = row.payment_date ? new Date(row.payment_date) : null;
      const matchesYear =
        yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);

      // To avoid subtext displaying numbers instead of month names
      // I had to convert the values from the monthFilter to numbers for comparison
      const monthNameToNumber = {
        January: 1, February: 2,
        March: 3, April: 4,
        May: 5, June: 6,
        July: 7, August: 8,
        September: 9, October: 10,
        November: 11, December: 12,
      };
      const filterMonthNumber = monthFilter ? monthNameToNumber[monthFilter] : null;
      const matchesMonth =
        monthFilter === "" || (date && (date.getMonth() + 1) === filterMonthNumber);
      // just a nested return dont be confused
      return (
        matchesSearch &&
        matchesCategory &&
        matchesYear &&
        matchesMonth &&
        matchesMethod
      );
    })
  }, [club_funds_data, debouncedSearch, categoryFilter, methodFilter, yearFilter, monthFilter]);

  // This is used for the combobox selection of members upon searching for account_number
  const [query, setQuery] = useState("");
  // for smoothing out filtering
  const debouncedQuery = useDebounce(query, 250); // 250ms delay feels natural
  const filteredMembers =
    debouncedQuery === ""
      ? (members || []).filter((m) => m.account_role === "regular-member")
      : members.filter((m) =>
        m.account_role === "regular-member" &&
        `${m.account_number} ${m.f_name} ${m.l_name} ${m.account_role}`
          .toLowerCase()
          .includes(debouncedQuery.toLowerCase())
      );

  // Dynamically generate year options for the past 5 years including current year
  // to get rid of the hard coded years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  // just for fancy subtext in line with active filters
  const activeFiltersText = [
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
  }

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
    formState: { isDirty }
  } = useForm({
    defaultValues: defaultFormValues
  });

  // Watch the category field for changes
  const watchedCategory = useWatch({
    control,
    name: "category",
    defaultValue: ""
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
    if (formData.period_start) { formData.period_start = formatForMonthInput(formData.period_start); }
    if (formData.period_end) { formData.period_end = formatForMonthInput(formData.period_end); }

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

  // Delete confirmation modal state & handlers
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const openDeleteModal = (contribution_id) => {
    setDeleteTargetId(contribution_id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      mutateDelete({
        table: "club_funds_contributions",
        column_name: "contribution_id",
        id: deleteTargetId,
      }, {
        onSuccess: () => {
          toast.success("Transaction deleted successfully");
        }
      });
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
      mutateAdd(payload,
        {
          onSuccess: () => {
            toast.success("Club fund contribution added")
            closeModal();
          },
          onError: () => {
            toast.error("Something went wrong")
          }
        }
      );
    } else if (modalType === "edit") {
      mutateEdit(payload,
        {
          onSuccess: () => {
            toast.success("Successfully updated")
            closeModal();
          },
          onError: () => {
            toast.error("Something went wrong");
          }
        }
      );
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
      ]
    },
    { label: "Payment Date", name: "payment_date", type: "date", autoComplete: "off" },
    {
      label: "Payment Method",
      name: "payment_method",
      type: "select",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ]
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
          <div className="flex gap-4 lg:ml-auto justify-between lg:self-center">
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
            return (
              <tr key={id}
                onClick={memberRole !== "board" ? () => openEditModal(row) : undefined}
                className="text-center cursor-pointer hover:bg-base-200/50"
              >
                {/* Ref no. */}
                <td className=" text-center font-medium text-xs">
                  {TABLE_PREFIX}_{id}
                </td>

                {/* Account No */}
                <td className=" text-center font-medium text-xs hover:underline"
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
                          <img
                            src={avatarUrl}
                            alt={fullName}
                          />
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
                <td>
                  {paymentDate}
                </td>

                {/* Payment Method */}
                <td>
                  <span
                    className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}
                  >
                    {paymentMethod}
                  </span>
                </td>
              </tr>
            )
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
        {/* Member Combobox with Controller */}
        <div className="form-control w-full">
          <label className="label text-sm font-semibold mb-2">Member Account</label>
          <Controller
            name="account_number"
            control={control}
            render={({ field }) => (
              <div className="relative">
              <Combobox
                value={members.find((m) => m.account_number === field.value) || null}
                onChange={(member) => field.onChange(member?.account_number)}
              >
                <ComboboxInput
                  required
                  className="input input-bordered w-full"
                  placeholder="Search by Account Number or Name..."
                  displayValue={(member) => (member ? member.account_number : "")}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <ComboboxOptions className="absolute z-[800] w-full mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                  {filteredMembers.length === 0 ? (
                    <div className="px-4 py-2 text-base-content/60">No members found.</div>
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
                            <span className="font-mono text-sm font-semibold">{member.account_number}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-sm truncate">{member.f_name} {member.l_name}</span>
                              <span className="text-xs italic">({member.account_role})</span>
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

        {fields.map(({ label, name, type, options, autoComplete, optional }) => (
          <div key={name} className="form-control w-full mt-2">
            <label htmlFor={name}>
              <span className="label text-sm font-semibold mb-2">{label}
                {optional && <span className="text-base-content/60 text-sm">(optional)</span>}
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
                  validate: (value) => value > 0 || "Amount cannot be zero or negative",
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
                      className={`input input-bordered w-full ${error ? "input-error" : ""
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
        ))}

        {/* if category = Monthly Dues, show period fields (since members can pay in advance) */}
        {watchedCategory === "Monthly Dues" && (
          <div className="flex justify-between gap-4">
            <div className="form-control w-full mt-2">
              <label htmlFor="period_start">
                <span className="label text-sm font-semibold mb-2">Starting Month</span>
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
                <span className="label text-sm font-semibold mb-2">Ending Month</span>
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
    </div>
  );
}
export default ClubFunds;