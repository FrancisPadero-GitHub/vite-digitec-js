import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router";

// hooks
import { useAddExpenses } from "./hooks/useAddExpenses";
import { useEditExpenses } from "./hooks/useEditExpenses";
import { useFetchExpenses } from "./hooks/useFetchExpenses";
import { useDelete } from "./hooks/useDelete";

// components
import FormModal from "./modals/FormModal";

function ClubExpenses() {
  // useQuery hook to fetch expenses
  const { data: fundExpenses, isLoading, isError, error } = useFetchExpenses();

  // mutation hooks for adding and editing expenses
  const { mutate: mutateAdd } = useAddExpenses();
  const { mutate: mutateEdit } = useEditExpenses();
  const { mutate: mutateDelete } = useDelete('club_funds_expenses');

  // Form default values
  const [formData, setFormData] = useState({
    transaction_id: null,
    title: "",
    category: "",
    description: "",
    amount: 0,
    transaction_date: "",
  });

  const [modalType, setModalType] = useState(null); // "add" | "edit" | null

  /**
   *  input fields for the form
   *  can be extended with options for select fields
   *  example: { label: "Type", name: "type", type: "select", options: ["Food", "Transport"] }
   */
  const fields = [
    { label: "Title", name: "title", type: "text" },
    { label: "Amount", name: "amount", type: "number" },
    { label: "Category", name: "category", type: "select", options: ["GMM", "Monthly Dues", "Activities", "Alalayang Agila", "Community Service", "Others"] },
    { label: "Description", name: "description", type: "text" },
    { label: "Date", name: "transaction_date", type: "date" },
  ];


  /**
   * Modal Handlers
   */
  const openAddModal = () => {
    // resets form if it was previously used for editing
    setFormData({
      transaction_id: null,
      title: "",
      category: "",
      description: "",
      amount: 0,
      transaction_date: "",
    });
    setModalType("add");
  };

  const openEditModal = (selectedRowData) => {
    setFormData(selectedRowData); // preload form with row data
    setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
  };

  /**
    * Form Handlers
    */
  const handleChange = (e) => {
    const { name, value } = e.target;
    /**
      * Sets the form data but it checks first if the value correctly corresponds to the value like
      * if membership_fee is indeed a value which is a number then proceeds to assign that value to
      * formData
      */
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleDelete = (transaction_id) => {
    mutateDelete({ table: "club_funds_expenses", column_name: "transaction_id", id: transaction_id }); // hard coded base on what file the modal is imported
    closeModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modalType === "add") {
      mutateAdd(formData);
      console.log("Adding Expense:", formData);
    } else if (modalType === "edit") {
      mutateEdit(formData);
      console.log("Updating Expense:", formData);
    }

    closeModal();
  };

  if (isLoading) return <div>Loading Club Expenses...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Club Expenses</h1>
          <div className="flex flex-row items-center gap-3">
            <button className="btn btn-outline">Export as CSV</button>
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={openAddModal}
            >
              + Add Expenses
            </Link>
          </div>
        </div>
        {/** Toolbar functionality to be implemented */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="input input-bordered flex items-center bg-base-100 md:w-64">
            {/* <SearchIcon className="text-base-content/50" /> */}
            <SearchIcon className="text-base-content/50" />
            <input
              type="text"
              placeholder="Search..."
              className="grow"

            />
          </label>

          <select

            className="select select-bordered w-40"


          >
            <option> Type </option>
            <option> 2 </option>
          </select>


          <select

            className="select select-bordered w-40"

          >
            <option> Year </option>
            <option> 2 </option>
          </select>

          <select

            className="select select-bordered w-40"

          >
            <option> Month </option>
            <option> 2 </option>
          </select>
        </div>



        {/** 
         *  Expenses Table
         * 
         */}
        <section className="space-y-4">
          <div className="overflow-x-auto border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
            <table className="table">
              <thead>
                <tr className="bg-base-200/30 text-left">
                  {/* {fields.map(({ label }) => (
                    <th key={label}>{label}</th>
                  ))} */}
                  <th>#</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {fundExpenses.map((expenses) => (
                  <tr
                    key={expenses.transaction_id}
                    onClick={() => openEditModal(expenses)}
                    className="cursor-pointer hover:bg-base-200/50"
                  >
                    <td>{expenses.transaction_id}</td>
                    <td>{expenses.title || "Not Provided"}</td>
                    <td className="px-4 py-2 font-semibold text-success">
                      ₱ {expenses.amount?.toLocaleString() || "0"}
                    </td>
                    <td>{expenses.category || "Not Provided"}</td>
                    <td>{expenses.description || "Not Provided"}</td>
                    <td>
                      {expenses.transaction_date
                        ? new Date(expenses.transaction_date).toLocaleDateString()
                        : "Not Provided"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Footer functionality to be implemented*/}
            <div className="flex justify-between items-center p-4 border-t border-base-content/5">
              <div className="text-sm text-base-content/70">
                Showing 1 to 3 of 3 entries
              </div>
              <div className="join">
                <button className="join-item btn btn-sm" disabled>
                  «
                </button>
                <button className="join-item btn btn-sm">Page 1 of 1</button>
                <button className="join-item btn btn-sm" disabled>
                  »
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/** 
       * Form Modal Declaration
       * 
       * */}

      <FormModal
        open={modalType !== null} // which will be set to true if value is present
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit}
        deleteAction={() => handleDelete(formData.transaction_id)}
      >
        {fields.map(({ label, name, type, options }) => (
          <div key={name} className="form-control w-full mt-2">
            <label htmlFor={name} className="label mb-1">
              <span className="label-text font-medium text-gray-700">
                {label}
              </span>
            </label>

            {type === "select" ? (
              <select
                id={name}
                name={name}
                value={formData[name] || ""}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="" className="label" disabled>Select {label}</option>
                {options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={name}
                type={type}
                name={name}
                value={formData[name] || ""}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            )}
          </div>
        ))}
      </FormModal>
    </div>
  );
}

export default ClubExpenses;
