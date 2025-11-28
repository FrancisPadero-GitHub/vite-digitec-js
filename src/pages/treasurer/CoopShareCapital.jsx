import { useState, useTransition, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";


// Fetch Hooks
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchCoopView } from "../../backend/hooks/shared/view/useFetchCoopView";

// Mutation Hooks
import { useAddCoopContributions } from "../../backend/hooks/treasurer/useAddCoopContributions";
import { useEditCoopContributions } from "../../backend/hooks/treasurer/useEditCoopContributions";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// Components
import FormModal from "./modals/FormModal";
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";
import DeleteConfirmationModal from "../shared/modal/DeleteConfirmationModal";

// Constants
import { CAPITAL_CATEGORY_COLORS, PAYMENT_METHOD_COLORS } from "../../constants/Color";
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
};

function CoopShareCapital() {
  // helper
  const today = getLocalDateString(new Date());
  const navigate = useNavigate();

  // data fetch
  const { memberRole } = useMemberRole(); // used to hide button to add transaction like a treasurer kay board rani sya view view langs
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const { data: coop_data, isLoading, isError, error } = useFetchCoopView({});

  // mutation hooks
  const { mutate: mutateAdd, isPending: isAddPending } = useAddCoopContributions();
  const { mutate: mutateEdit, isPending: isEditPending } = useEditCoopContributions();
  const { mutate: mutateDelete } = useDelete("coop_share_capital_contributions");

  /**
   *  Search and filter for the filterbar
   */
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
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
  const handleCategoryChange = (value) => {
    startTransition(() => {
      setCategoryFilter(value);
    });
  };
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

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250);

  const TABLE_PREFIX = "SCC";
  const coop = useMemo(() => {
    const coopRaw = coop_data?.data || [];
    return coopRaw.filter((row) => {
      const generatedId = `${TABLE_PREFIX}_${row?.coop_contri_id || ""}`;
      const matchesSearch =
        debouncedSearch === "" ||
        (row.full_name && row.full_name
          .toLowerCase()
          .includes(debouncedSearch
            .toLowerCase())) ||
        row.account_number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        row.category?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesSource =
        sourceFilter === "" || row.source === sourceFilter;
      const matchesCategory =
        categoryFilter === "" || row.category === categoryFilter;
      const matchesMethod =
        paymentMethodFilter === "" || row.payment_method === paymentMethodFilter;
      const date = row.contribution_date ? new Date(row.contribution_date) : null;
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

      return (
        matchesSearch &&
        matchesCategory &&
        matchesYear &&
        matchesMonth &&
        matchesMethod &&
        matchesSource
      );
    })
  }, [coop_data, debouncedSearch, categoryFilter, yearFilter, monthFilter, paymentMethodFilter, sourceFilter]);

  // This is used for the combobox selection of members upon searching for account_number
  const [query, setQuery] = useState("");
  // for smoothing out filtering
  const debouncedQuery = useDebounce(query, 250); // 250ms delay feels natural
  // This is used for the combobox selection of members upon searching for account_number
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
    sourceFilter ? `${sourceFilter}` : null,
    categoryFilter ? `${categoryFilter}` : null,
    paymentMethodFilter ? `${paymentMethodFilter}` : null,
    yearFilter ? `${yearFilter}` : null,
    monthFilter ? `${monthFilter}` : null,
  ]
    .filter(Boolean)
    .join(" - ") || "Showing all contributions";


  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setSourceFilter("");
    setPaymentMethodFilter("");
    setCategoryFilter("");
    setYearFilter("");
    setMonthFilter("");

  }

  // extract default form values to reuse in modal resets and in rhf initialization
  const defaultFormValues = {
    coop_contri_id: null,
    account_number: null,
    source: "Member Contribution",
    category: "Monthly",
    amount: 0,
    contribution_date: today,
    payment_method: "",
    remarks: "",
  };

  // react hook form
  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { isDirty }
  } = useForm({
    defaultValues: defaultFormValues
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
    reset(selectedRowData);
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const openDeleteModal = (coop_contri_id) => {
    setDeleteTargetId(coop_contri_id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      mutateDelete({
        table: "coop_cbu_contributions",
        column_name: "coop_contri_id",
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

    console.log(`coop test`, data )
    if (modalType === "add") {
      mutateAdd(data,
        {
          onSuccess: () => {
            toast.success("Coop contribution added")
            closeModal();
          },
          onError: () => {
            toast.error("Something went wrong")
          }
        }
      );
    } else if (modalType === "edit") {
      mutateEdit(data,
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
      label: "Payment Category", name: "category", type: "select",
      options: [
        { label: "Monthly", value: "Monthly" },
        { label: "Initial", value: "Initial" }
      ]
    },
    { label: "Date", name: "contribution_date", type: "date", autoComplete: "date" },
    {
      label: "Payment Method", name: "payment_method", type: "select", autoComplete: "off",
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
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
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
                  { label: "Initial", value: "Initial" },
                  { label: "Monthly", value: "Monthly" },
                  { label: "System", value: "System" },
                ]
              },
              {
                label: "All Method",
                value: paymentMethodFilter,
                onChange: handlePaymentMethodChange,
                options: [
                  { label: "Cash", value: "Cash" },
                  { label: "GCash", value: "GCash" },
                  { label: "Bank", value: "Bank" }
                ]
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
              className="btn btn-neutral whitespace-nowrap lg:ml-auto self-end lg:self-center"
              title="Add contribution"
              aria-label="Add Contribution"
              type="button"
              onClick={openAddModal}
            >
              <AddCircleIcon />
              Coop Contribution
            </button>
            )}
        </div>

        <DataTableV2
          title="Coop Share Capital Contributions"
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={[
            "Ref No.",
            "Account No.",
            "Name",
            "Amount",
            "Category",
            "Date",
            "Method"
          ]}
          filterActive={activeFiltersText !== "Showing all contributions"}
          data={coop}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.coop_contri_id || "Not Found";
            const memberId = row?.member_id || null;
            const accountNo = row?.account_number || "System";
            const avatarUrl = row?.avatar_url || placeHolderAvatar;
            const fullName = row?.full_name || "Not Found";
            const amount = row?.amount || 0;
            const paymentCategory = row?.category;
            const contributionDate = row?.contribution_date
              ? new Date(row.contribution_date).toLocaleDateString()
              : "Not Found";
            const paymentMethod = row?.payment_method || "Not Found";
            const isDisabled = !row?.full_name; // condition (you can adjust logic)
            return (
              <tr key={id}
                onClick={memberRole !== "board" ? () => openEditModal(row) : undefined}
                className={`text-center ${isDisabled ?
                  "opacity-90" : "cursor-pointer hover:bg-base-200/50"}`}
              >
                {/* Ref no. */}
                <td className=" text-center font-medium text-xs">
                  {TABLE_PREFIX}_{id}
                </td>
                {/* Account No */}
                <td className=" text-center font-medium text-xs hover:underline"
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
                      <span className="flex items-center gap-2">
                        <span className="truncate">{fullName}</span>
                        {isDisabled && (
                          <div className="tooltip tooltip-top" data-tip="System Generated">
                            <span className="badge badge-sm badge-ghost">?</span>
                          </div>
                        )}
                      </span>
                    </>
                  </span>
                </td>
                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {display(amount)}
                </td>
                {/* Payment Category */}
                <td>
                  {paymentCategory ? (
                    <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[paymentCategory]}`}>
                      {paymentCategory}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Found</span>
                  )}
                </td>
                {/* Contribution Date */}
                <td>
                  {contributionDate}
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
        table="Share Capital"
        open={modalType !== null}
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        isPending={isAddPending || isEditPending}
        status={isAddPending || isEditPending || !isDirty}
        deleteAction={() => openDeleteModal(control._formValues.coop_contri_id)}
      >
        <div className="form-control w-full">
          <label className="label text-sm font-semibold mb-2">Member Account</label>
          <Controller
            name="account_number"
            control={control}
            render={({ field }) => (
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
                <ComboboxOptions className="absolute z-[800] w-[93%] mt-1 rounded-lg bg-base-100 shadow-lg max-h-[50vh] overflow-auto border border-base-200">
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
            )}
          />
        </div>

        {fields.map(({ label, name, type, options, autoComplete, optional }) => (
          <div key={name} className="form-control w-full mt-2">
            <label htmlFor={name}>
              <span className="label text-sm font-semibold mb-2">
                {label}
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
                      className={`input input-bordered w-full ${error ? "input-error" : ""}`}
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
      </FormModal>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Contribution"
        message="Are you sure you want to delete this coop share capital contribution? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={false}
      />
    </div>
  );
}

export default CoopShareCapital;
