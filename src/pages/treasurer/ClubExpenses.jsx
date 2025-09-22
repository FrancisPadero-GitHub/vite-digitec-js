import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router";

// hooks
import { useAddExpenses } from "./hooks/useAddExpenses";
import { useEditExpenses } from "./hooks/useEditExpenses";
// import { useFetchExpenses } from "./hooks/useFetchExpenses";

import { useFetchExpenses } from "./custom/useFetchExpenses";
import { useDelete } from "./hooks/useDelete";

// components
import FormModal from './modals/FormModal';
import MainDataTable from './components/MainDataTable';

// constants
import { CLUB_CATEGORY_COLORS } from '../../constants/Color';

function ClubExpenses() {
    // Pagination sets a limiter to be rendered to avoid infinite rendering of the whole table
    const [page, setPage] = useState(1);
    // This renders how many rows is being rendered inside the table to avoid infinite renders of all data
    const [limit] = useState(20); // or make it adjustable
  
    /**
     * NOTE: IF YOU WANT THE TABLE TO HAVE A FIXED SIZE AND SCROLLBLE YOU NEED THIS VALUES 
     * 
     * <div className="max-h-50 min-h-[550px]"></div>
     * &
     * const [limit] = useState(20); 
     * 
     * This works well on 1080p large display dko sure ug mo fit ni kay cindy sa inch sa display
     */
  
  // useQuery hook to fetch expenses
  const { data: fundExpensesData, isLoading, isError, error } = useFetchExpenses(page, limit);

  // Pagination sets a limiter to be rendered to avoid infinite rendering of the whole table
  const fundExpenses = fundExpensesData?.data || [];
  const total = fundExpensesData?.count || 0;

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

       <MainDataTable 
          headers={["Ref No.", "Title", "Amount", "Category", "Date", "Description"]}
          data={fundExpenses}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow = {(row) => (
            <tr key={row.transaction_id} className=" cursor-pointer hover:bg-base-200/50"
              onClick={() => openEditModal(row)}
            >
              <td className="text-center">EXP_{row.transaction_id?.toLocaleString() || "ID"}</td>
              <td className="px-4 py-2">{row.title}</td>
              <td className="px-4 py-2 font-semibold text-success">
                ₱ {row.amount?.toLocaleString() || "0"}
              </td>
              <td className="px-4 py-2">
                <span className={`font-semibold ${CLUB_CATEGORY_COLORS[row.category]}`}>
                  {row.category || "Not Provided"}
                </span>
              </td>
              <td className="px-4 py-2">{row.transaction_date ? new Date(row.transaction_date).toLocaleDateString(): "Not Provided"}</td>
              <td className="px-4 py-2">{row.description}</td>
            </tr>
            
          )}
       />

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
