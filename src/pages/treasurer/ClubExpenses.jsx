import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";

// fetch hooks
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useFetchExpenses } from "../../backend/hooks/shared/useFetchExpenses";

// mutation hooks
import { useAddExpenses } from "../../backend/hooks/treasurer/useAddExpenses";
import { useEditExpenses } from "../../backend/hooks/treasurer/useEditExpenses";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// components
import FormModal from "./modals/FormModal";
import MainDataTable from "./components/MainDataTable";
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants
import { CLUB_CATEGORY_COLORS } from "../../constants/Color";
import { display } from "../../constants/numericFormat";


function ClubExpenses() {
  const { memberRole } = useMemberRole();

  // front end pagination
  // const [page, setPage] = useState(1);
  // const [limit] = useState(20);

  const { data: fundExpensesData, isLoading, isError, error } = useFetchExpenses({});
  const fundExpensesRaw = fundExpensesData?.data || [];
  // const total = fundExpensesData?.count || 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "EXP";
  const fundExpenses = fundExpensesRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}_${row?.transaction_id || ""}`;
    const matchesSearch =
      searchTerm === "" ||
      row.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || row.category === categoryFilter;
    const date = row.transaction_date ? new Date(row.transaction_date) : null;
    const matchesYear = yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
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

    return matchesSearch && matchesCategory && matchesYear && matchesMonth;
  });

  // Dynamically generate year options for the past 5 years and next 5 years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  const activeFiltersText = [
    searchTerm ? `Search: "${searchTerm}"` : null,
    categoryFilter ? `Category: ${categoryFilter}` : null,
    yearFilter ? `Year: ${yearFilter}` : null,
    monthFilter ? `Month: ${monthFilter}` : null,
  ]
    .filter(Boolean)
    .join(" - ") || "Showing all expenses";

  // clear fitlters handler
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setYearFilter("");
    setMonthFilter("");
  }


  const { mutate: mutateAdd, isPending: isAddPending } = useAddExpenses();
  const { mutate: mutateEdit, isPending: isEditPending } = useEditExpenses();
  const { mutate: mutateDelete } = useDelete("club_funds_expenses");

  const [modalType, setModalType] = useState(null); // "add" | "edit" | null

  const defaultValues = {
    transaction_id: null,
    title: "",
    category: "",
    description: "",
    amount: 0,
    transaction_date: "",
  }

  // ✅ React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm({
    defaultValues
  });

  // ✅ Modal Handlers
  const openAddModal = () => {
    reset(defaultValues);
    setModalType("add");
  };

  const openEditModal = (selectedRowData) => {
    reset(selectedRowData);
    setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
    reset();
  };

  const handleDelete = (transaction_id) => {
    mutateDelete({
      table: "club_funds_expenses",
      column_name: "transaction_id",
      id: transaction_id,
    });
    closeModal();
  };

  // ✅ Form submission through RHF
  const onSubmit = (data) => {
    // Prevent double submission
    if (isAddPending || isEditPending) {
      return;
    }

    const parsedData = { ...data, amount: Number(data.amount) };

    if (modalType === "add") {
      mutateAdd(parsedData, 
        {
          onSuccess: () => {
            toast.success("Expense transaction added")
            closeModal();
          },
          onError: () => {
            toast.error("Something went wrong")
          }
        });
    } else if (modalType === "edit") {
      mutateEdit(parsedData,
        {
          onSuccess: () => {
            toast.success("Successfully updated")
            closeModal();
          },
          onError: () => {
            toast.error("Something went wrong")
          }
        }
      );
    }
  };

  const fields = [
    { label: "Title", name: "title", type: "text" },
    { label: "Amount", name: "amount", type: "number" },
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
    { label: "Date", name: "transaction_date", type: "date" },
    { label: "Description", name: "description", type: "text" },
  ];

  return (
    <div>
      <Toaster position="bottom-left" />
      <div className="space-y-4"> 
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onReset={handleClearFilters}
            dropdowns={[
              {
                label: "All Category",
                value: categoryFilter,
                onChange: setCategoryFilter,
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
                onChange: setYearFilter,
                options: yearOptions,
              },
              {
                label: "All Month",
                value: monthFilter,
                onChange: setMonthFilter,
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


          <div className="flex flex-row items-center gap-3">
            {memberRole !== "board" && (
              <button
                className="btn btn-neutral whitespace-nowrap"
                onClick={openAddModal}
              >
                + Add Expenses
              </button>
            )}
          </div>
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
            const amount = row?.amount || 0;
            return (
              <tr
                key={`${TABLE_PREFIX}${row.transaction_id}`}
                className="cursor-pointer hover:bg-base-200/50"
                onClick={memberRole !== "board" ? () => openEditModal(row) : undefined}
              >
                <td className="px-4 py-2 text-center font-medium text-xs">
                  {TABLE_PREFIX}_{row?.transaction_id.toLocaleString() || "ID"}
                </td>
                <td className="px-4 py-4 text-center font-medium">{row?.title}</td>
                <td className="px-4 py-2 font-semibold text-error text-center">
                  ₱ {display(amount)}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`font-semibold ${CLUB_CATEGORY_COLORS[row?.category]}`}>
                    {row?.category || "Not Provided"}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  {row?.transaction_date
                    ? new Date(row?.transaction_date).toLocaleDateString()
                    : "Not Provided"}
                </td>
              </tr>
            )
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
        status={isAddPending || isEditPending}
        deleteAction={() => handleDelete(control._formValues.transaction_id)}
      >
        {fields.map(({ label, name, type, options }) => (
          <div key={name} className="form-control w-full mt-2">
            <label htmlFor={name} className="label mb-1">
              <span className="label-text font-medium text-gray-700">{label}</span>
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
                      autoComplete="off"
                      value={field.value}
                      placeholder="Enter Amount"
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
                {...register(name, { required: true })}
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>Select {label}</option>
                {options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}</option>
                ))}
              </select>
            ) : name === "description" ? (
              <textarea
                id={name}
                rows={4}
                {...register(name, { required: true })}
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
              />
            )}
          </div>
        ))}

      </FormModal>
    </div>
  );
}

export default ClubExpenses;
