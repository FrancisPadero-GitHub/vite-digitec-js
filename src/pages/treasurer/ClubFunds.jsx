import React, { useState } from 'react'
import { Link } from 'react-router';
import { useFetchClubFunds } from './hooks/useFetchClubFunds'
import { useMembers } from '../../backend/hooks/useFetchMembers';
import { useAddClubFunds } from './hooks/useAddClubFunds';

function ClubFunds() {
  const { data: funds, isLoading, isError, error } = useFetchClubFunds();
  const { mutate } = useAddClubFunds(); // activate the mutateFn which activates the query inside
  const { data: members } = useMembers();

  // form data
  const [formData, setFormData] = useState({
    member_id: null,
    amount: 0,
    category: "",
    payment_date: "",
    payment_method: "",
    period_covered: "",
    remarks: "",
  }
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  // This is named edit but it is information modal for now
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);

  const openSelectedFundModal = (fund) => {
    setSelectedFund(fund);
    setEditModalOpen(true);
  };

  // const openAddTransactionModal = () => {
  //   setAddModalOpen(true);
  // }



  const fundFields = [
    { label: "Amount", name: "amount", type: "number" },
    {
      label: "Category",
      name: "category",
      type: "select",
      options: ["Monthly Dues", "GMMM payments", "Fund Raising", "Donations"]
    },
    { label: "Payment Date", name: "payment_date", type: "date" },
    {
      label: "Payment Method",
      name: "payment_method",
      type: "select",
      options: ["Gcash", "Cash"],
    },
    { label: "Payment Covered", name: "payment_convered", type: "text" },
    { label: "Remarks", name: "remarks", type: "text" },
  ];

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
    mutate(formData);
    console.log("Form data", formData)
    setFormData("");
  }

  // This should be almost always be the bottom code just above return
  if (isLoading) return <div>Loading Club Funds...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Club Funds page</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={() => setAddModalOpen(true)}

            >
              + Add Transaction
            </Link>
          </div>
        </div>
        <section className="space-y-4">
          <div className="overflow-x-auto border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
            <table className="table">
              <thead>
                <tr className="bg-base-200/30 text-left">

                  <th>#</th>
                  <th>Member Name</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Payment Date</th>
                  <th>Payment Method</th>
                  <th>Period Covered</th>
                  <th>Remarks</th>

                </tr>
              </thead>

              <tbody>
                {funds.map((fund) => (
                  <React.Fragment key={fund.contribution_id}>
                    {/* onClick FN on tr === table row */}
                    <tr 
                      onClick={() => openSelectedFundModal(fund)}
                      className="cursor-pointer hover:bg-base-200/50"
                    >
                      <td>{fund.contribution_id}</td>
                      <td>
                        {/**
                         * Immediately Invoked Function Expression (IIFE)
                         * 
                         * (()=>{...}) ()
                         * 
                         * first () is an expression then followed by a arrow function
                         * then the last () is to execute this EXPRESSION FUNCTION.... fuck me unsa maneh
                         * 
                         *  */}
                        {(() => {
                          const matchedMember = members?.find(
                            (member) => member.member_id === fund.member_id
                          );
                          if (!matchedMember) return "Not Provided";

                          return `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim();
                        })()}
                      </td>
                      <td>₱ {fund.amount?.toLocaleString() || "0"}</td>
                      <td>{fund.category || "Not Provided"}</td>
                      <td>{fund.payment_date ? new Date(fund.payment_date).toLocaleDateString() : "Not Provided"}</td>
                      <td className={`badge badge-soft font-semibold ${fund.payment_method === "Cash" ? "badge-success" : "badge-info"}`}>{fund.payment_method || "Not Provided"}</td>
                      <td>{fund.period_covered || "Not Provided"}</td>
                      <td>{fund.remarks || "Not Provided"}</td>
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
       * 
       *  MODAL FOR FUND INFORMATION
       * 
       *  this is named editModalOpen cause it will be changed later on to edit.
       * 
       * */}
      {editModalOpen && selectedFund && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Member Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Contribution Number</p>
                <p className="font-medium text-gray-900">
                  {selectedFund.contribution_id}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Name</p>
                <p className="font-medium text-gray-900">
                  {/* Finds members name according to the selected fund id */}
                  {(() => {
                    const matchedMember = members?.find(
                      (member) => member.member_id === selectedFund.member_id
                    );
                    return matchedMember
                      ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`
                      : "Not Provided";
                  })()}
                </p>
              </div>


              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-gray-900">
                  {selectedFund.amount || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium text-gray-900">
                  {selectedFund.category || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Payment Date</p>
                <p className="font-medium text-gray-900">
                  {selectedFund.payment_date || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-900">
                  {selectedFund.payment_method || "Not Provided"}
                </p>
              </div>

              <div >
                <p className="text-gray-500">Period Covered</p>
                <p className="font-medium text-gray-900">
                  {selectedFund.period_covered || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Remarks</p>
                <p className="font-medium text-gray-900">
                  {selectedFund.remarks || "Not Provided"}
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


      {/* ADD TRANSACTION MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          {/* Modal container with animation */}
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-6 transform transition-all scale-100 animate-fadeIn">
            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add Transaction
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dynamically render the member inputs */}
              {/* Member Select (special case) */}
              <div className="form-control w-full">
                <label htmlFor="member_id" className="label mb-1">
                  <span className="label-text font-medium text-gray-700">Member</span>
                </label>
                <select
                  id="member_id"
                  name="member_id"
                  value={formData.member_id || ""}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">-- Select Member --</option>
                  {members?.map((m) => (
                    <option key={m.member_id} value={m.member_id}>
                      {m.f_name} {m.l_name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Loop through the array of hardcoded fields */}
              {fundFields.map(({ label, name, type, options }) => (
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

export default ClubFunds
