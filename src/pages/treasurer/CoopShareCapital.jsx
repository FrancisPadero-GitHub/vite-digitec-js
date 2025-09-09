import React, { useState } from 'react'
import { Link } from 'react-router';
import { useMembers } from '../../backend/hooks/useFetchMembers';
import { useFetchCoopContributions } from './hooks/useFetchCoopContributions';
import { useAddCoopContributions } from './hooks/useAddCoopContributions';

function CoopShareCapital() {
  const { mutate } = useAddCoopContributions();
  const { data: members } = useMembers();
  const { data: coop, isLoading, isError, error } = useFetchCoopContributions();

  const [selectedRow, setSelectedRow] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    member_id: null,
    source: "",
    amount: 0,
    contribution_date: "",
    remarks: "",
  })

  const fields = [
    { label: "Amount", name: "amount", type: "number" },
    { label: "Source", name: "source", type: "text" },
    { label: "Date", name: "contribution_date", type: "date" },
    { label: "Remarks", name: "remarks", type: "text" },
  ]

  const openSelectedRowModal = (contribution) => {
    setSelectedRow(contribution);
    setEditModalOpen(true);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    console.log("Expenses Form data", formData)
    setFormData("");
  }

  if (isLoading) return <div>Loading Coop Contributions...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold" >Coop Share Capital Page</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={() => setAddModalOpen(true)}

            >
              + Add Contribution
            </Link>
          </div>
        </div>
        <section className="space-y-4">
          <div className="overflow-x-auto border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
            <table className="table">
              <thead>
                <tr className="bg-base-200/30 text-left">
                  <td>#</td>
                  <td>Member Name</td>
                  <td>Amount</td>
                  <td>Source</td>
                  <td>Date</td>
                  <td>Remarks</td>
                </tr>
              </thead>
              <tbody>
                {coop.map((contribution) => (
                  <React.Fragment key={contribution.coop_contri_id}>
                    <tr
                      onClick={() => openSelectedRowModal(contribution)}
                      className="cursor-pointer hover:bg-base-200/50"
                    >
                      <td>{contribution.coop_contri_id}</td>
                      <td>
                        {(() => {
                          const matchedMember = members?.find(
                            (member) => member.member_id === contribution.member_id);
                          if (!matchedMember) return "System";
                          return `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim();
                        })()}

                      </td>
                      <td>₱ {contribution.amount?.toLocaleString() || "0"}</td>
                      <td>{contribution.source || "Not Provided"}</td>
                      <td>{contribution.contribution_date ? new Date(contribution.contribution_date).toLocaleDateString() : "Not Provided"}</td>
                      <td>{contribution.remarks || "Not Provided"}</td>
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
            <h4 className="text-2xl font-bold text-gray-800 mb-6">
             Contribution Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">#</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.coop_contri_id || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium text-gray-900">
                  {(() => {
                    const matchedMember = members?.find(
                      (member) => member.member_id === selectedRow.member_id);
                    if (!matchedMember) return "System";
                    return `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim();
                  })()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.amount || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Source</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.source || "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.contribution_date ? new Date(selectedRow.contribution_date).toLocaleDateString() : "Not Provided"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Remarks</p>
                <p className="font-medium text-gray-900">
                  {selectedRow.remarks}
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
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md p-6 transform transition-all scale-100 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add Contribution
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">

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

export default CoopShareCapital
