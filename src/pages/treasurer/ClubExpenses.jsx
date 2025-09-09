import React, { useState } from 'react'
import { useFetchExpenses } from './hooks/useFetchExpenses'
import { Link } from 'react-router';
import { useAddExpenses } from './hooks/useAddExpenses';

function ClubExpenses() {
  const { data: fundExpenses, isLoading, isError, error } = useFetchExpenses();
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    description: "",
    amount: 0,
    transaction_date: "",
  })

  const fields = [
    { label: "Amount", name: "amount", type: "number" },
    { label: "Type", name: "type", type: "text" },
    { label: "Category", name: "category", type: "text" },
    { label: "Description", name: "description", type: "text" },
    { label: "Date", name: "transaction_date", type: "date" },
  ]

  const { mutate } = useAddExpenses();

  const [selectedRow, setSelectedRow] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const openSelectedRowModal = (transaction) => {
    setSelectedRow(transaction);
    setEditModalOpen(true);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    /**
      * Sets the form data but it checks first if the value correctly corresponds to the value like
      * if membership_fee is indeed a value which is a number then proceeds to assign that value to
      * formData
      */
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["amount"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAddModalOpen(false);
    mutate(formData); // add expenses
    console.log("Club Expenses Form data", formData)
    setFormData("");
  }


  // This should be almost always be the bottom code just above return
  if (isLoading) return <div>Loading Club Expenses...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Club Expenses Page</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={() => setAddModalOpen(true)}

            >
              + Add Expenses
            </Link>
          </div>
        </div>
        <section className="space-y-4">
          <div className="overflow-x-auto border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
            <table className="table">
              <thead>
                <tr className="bg-base-200/30 text-left">

                  <th>#</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>

                </tr>
              </thead>
              <tbody>
                {fundExpenses.map((expenses) => (
                  <React.Fragment key={expenses.transaction_id}>
                    <tr
                      onClick={() => openSelectedRowModal(expenses)}
                      className="cursor-pointer hover:bg-base-200/50"
                    >
                      <td>{expenses.transaction_id || "Not Provided"}</td>
                      <td>{expenses.type || "Not Provided"}</td>
                      <td>₱ {expenses.amount?.toLocaleString() || "0"}</td>
                      <td>{expenses.category || "Not Provided"}</td>
                      <td>{expenses.description || "Not Provided"}</td>
                      <td>{expenses.transaction_date ? new Date(expenses.transaction_date).toLocaleDateString() : "Not Provided"}</td>

                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            {/* Footer */}
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
       * Expanded information or edit expenses modal
       * 
      */}
      {editModalOpen && selectedRow && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Expenses Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Transaction id</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.transaction_id || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.type || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.category || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Description</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.description || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-gray-900">
                  ₱ {selectedRow.amount?.toLocaleString() || "0"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Transaction Date</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.transaction_date ? new Date(selectedRow.transaction_date).toLocaleDateString() : "Not Provided"}
                </p>
              </div>

            </div>

            <div className="mt-6 flex justify-start">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/**
       * Add expenses transaction modal
       * 
       * 
      */}
      {addModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          {/* Modal container with animation */}
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-6 transform transition-all scale-100 animate-fadeIn">
            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add Transaction
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Loop through the array of hardcoded fields */}
              {fields.map(({ label, name, type, options }) => (
                <div key={name} className="form-control w-full">
                  <label htmlFor={name} className="label mb-1">
                    <span className="label-text font-medium text-gray-700">{label}</span>
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
                      <option value="">-- Select {label} --</option>
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

              {/* Footer buttons */}
              <div className="flex justify-between gap-3 pt-4 ">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setAddModalOpen(false)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-success px-8"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




    </div>
  )
}

export default ClubExpenses
