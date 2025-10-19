import { useState } from "react";
import { Link } from "react-router";
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
import FilterToolbar from "../shared/components/FilterToolbar";

// constants
import { CLUB_CATEGORY_COLORS } from "../../constants/Color";



function ClubExpenses() {
  const { memberRole } = useMemberRole();         // used to hide button to add transaction like a treasurer kay board rani sya view view langs 

  // front end pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data: fundExpensesData, isLoading, isError, error } = useFetchExpenses(page, limit);
  const fundExpensesRaw = fundExpensesData?.data || [];
  const total = fundExpensesData?.count || 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "EXP";

  const fundExpenses = fundExpensesRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}_${row.transaction_id}`;
    const matchesSearch =
      searchTerm === "" ||
      row.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "" || row.category === categoryFilter;

    const date = row.transaction_date ? new Date(row.transaction_date) : null;
    const matchesYear = yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesCategory && matchesYear && matchesMonth;
  });

  const { mutate: mutateAdd } = useAddExpenses();
  const { mutate: mutateEdit } = useEditExpenses();
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
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Club Expenses</h1>
          <div className="flex flex-row items-center gap-3">
            {memberRole !== "board" && (
              <Link
                className="btn btn-neutral whitespace-nowrap"
                onClick={openAddModal}
              >
                + Add Expenses
              </Link>
            )}
          </div>
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
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
              options: [
                { label: "2025", value: "2025" },
                { label: "2024", value: "2024" },
                { label: "2023", value: "2023" },
                { label: "2022", value: "2022" },
                { label: "2021", value: "2021" },
                { label: "2020", value: "2020" },
              ],
            },
            {
              label: "All Month",
              value: monthFilter,
              onChange: setMonthFilter,
              options: [
                { label: "January", value: "1" },
                { label: "February", value: "2" },
                { label: "March", value: "3" },
                { label: "April", value: "4" },
                { label: "May", value: "5" },
                { label: "June", value: "6" },
                { label: "July", value: "7" },
                { label: "August", value: "8" },
                { label: "September", value: "9" },
                { label: "October", value: "10" },
                { label: "November", value: "11" },
                { label: "December", value: "12" },
              ],
            },
          ]}
        />

        <MainDataTable
          headers={["Ref No.", "Title", "Amount", "Category", "Date"]}
          data={fundExpenses}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => (
            <tr
              key={`${TABLE_PREFIX}${row.transaction_id}`}
              className="cursor-pointer hover:bg-base-200/50"
              onClick={memberRole !== "board" ? () => openEditModal(row) : undefined}
            >
              <td className="x-4 py-2 text-center font-medium text-xs">
                {TABLE_PREFIX}_{row.transaction_id?.toLocaleString() || "ID"}
              </td>
              <td className="px-4 py-4 text-center font-medium">{row.title}</td>
              <td className="px-4 py-2 font-semibold text-error text-center">
                ₱ {row.amount?.toLocaleString() || "0"}
              </td>
              <td className="px-4 py-2 text-center">
                <span className={`font-semibold ${CLUB_CATEGORY_COLORS[row.category]}`}>
                  {row.category || "Not Provided"}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                {row.transaction_date
                  ? new Date(row.transaction_date).toLocaleDateString()
                  : "Not Provided"}
              </td>
            </tr>
          )}
        />
      </div>

      <FormModal
        table={"Expenses"}
        open={modalType !== null}
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        deleteAction={() => handleDelete()}
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
