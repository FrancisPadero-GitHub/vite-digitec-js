import React, { useState } from 'react'
import Select from "react-select"; // for the searchable dropdown below for members
import { Link } from 'react-router';

// Hooks
import { useMembers } from '../../backend/hooks/useFetchMembers';
import { useFetchCoopContributions } from './hooks/useFetchCoopContributions';
import { useAddCoopContributions } from './hooks/useAddCoopContributions';
import { useEditCoopContributions } from './hooks/useEditCoopContributions';
import { useDelete } from './hooks/useDelete';

// components
import FormModal from './modals/FormModal';

function CoopShareCapital() {

  // useQuery hook to fetch coop funds and members
  const { data: members } = useMembers();
  const { data: coop, isLoading, isError, error } = useFetchCoopContributions();


  // mutation hooks for adding and editing funds
  const { mutate: mutateAdd } = useAddCoopContributions();
  const { mutate: mutateEdit } = useEditCoopContributions();
  const { mutate: mutateDelete } = useDelete('coop_cbu_contributions');

  // form data
  const [formData, setFormData] = useState({
    coop_contri_id: null,
    member_id: null,
    source: "",
    amount: 0,
    contribution_date: "",
    remarks: "",
  })

  const [modalType, setModalType] = useState(null); // "add" | "edit" | null

  const fields = [
    { label: "Amount", name: "amount", type: "number" },
    { label: "Source", name: "source", type: "text" },
    { label: "Date", name: "contribution_date", type: "date" },
    { label: "Remarks", name: "remarks", type: "text" },
  ]

  /**
   * Modal Handlers
   * 
   */
  const openAddModal = () => {
    // Reset form data to initial state
    setFormData({
      coop_contri_id: null,
      member_id: null,
      source: "",
      amount: 0,
      contribution_date: "",
      remarks: "",
    })
    setModalType("add");
  }

  const openEditModal = (selectedRowData) => {
    setFormData(selectedRowData); // preload form with selected row data
    console.log(selectedRowData)
    setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
  };

  const handleChange = (e) => {
    /**
  * Sets the form data but it checks first if the value correctly corresponds to the value like
  * if membership_fee is indeed a value which is a number then proceeds to assign that value to
  * formData
  */
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["amount"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleDelete = (coop_contri_id) => {
    console.log("Deleting Coop contribution:", coop_contri_id);
    mutateDelete({ table: "coop_cbu_contributions", column_name: "coop_contri_id", id: coop_contri_id });
    closeModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modalType === "add") {
      mutateAdd(formData);
      console.log("Adding Coop contribution:", formData);
    } else if (modalType === "edit") {
      mutateEdit(formData);
      console.log("Updating Coop contribution:", formData);
    }

    closeModal();
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
              onClick={openAddModal}

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
                  <td>Name</td>
                  <td>Amount</td>
                  <td>Source</td>
                  <td>Date</td>
                  <td>Remarks</td>
                </tr>
              </thead>
              <tbody>
                {coop.map((contribution) => {
                  const matchedMember = members?.find(
                    (member) => member.member_id === contribution.member_id
                  );

                  const isDisabled = !matchedMember; // true if no member found

                  return (
                    <React.Fragment key={contribution.coop_contri_id}>
                      <tr
                        onClick={!isDisabled ? () => openEditModal(contribution) : undefined}
                        className={`${!isDisabled ? "cursor-pointer hover:bg-base-200/50" : "cursor-not-allowed opacity-50"}`}
                      >
                        <td>{contribution.coop_contri_id}</td>
                        <td className="relative group">
                          {matchedMember
                            ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
                            : "System"}

                          {/* Tooltip for system-generated contributions and is disabled */}
                          {isDisabled && (
                            <span className="hidden group-hover:inline ml-2 bg-green-800 text-white text-xs rounded px-2 py-0.5 shadow">
                              System Generated
                            </span>
                          )}
                          
                        </td>

                        <td>₱ {contribution.amount?.toLocaleString() || "0"}</td>
                        <td>{contribution.source || "Not Provided"}</td>
                        <td>
                          {contribution.contribution_date
                            ? new Date(contribution.contribution_date).toLocaleDateString()
                            : "Not Provided"}
                        </td>
                        <td>{contribution.remarks || "Not Provided"}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}

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
      <FormModal
        open={modalType !== null}
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit}
        deleteAction={() => handleDelete(formData.coop_contri_id)}
      >
        {/* MIGHT USE LATER: THIS IS THE OLD DROPDOWN SELECT FOR MEMBERS */}
        {/* <div className="form-control w-full">
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
        </div> */}

        {/* Member Select dropdown and search component from react-select */}
        <Select
          options={members?.map((m) => ({
            value: m.member_id,
            label: `${m.f_name} ${m.l_name} (${m.email})`,
          }))}
          value={members?.find((m) => m.member_id === formData.member_id) ? {
            value: formData.member_id,
            label: `${members.find((m) => m.member_id === formData.member_id)?.f_name} 
            ${members.find((m) => m.member_id === formData.member_id)?.l_name}`
          } : null}
          onChange={(option) =>
            handleChange({ target: { name: "member_id", value: option?.value } })
          }
          placeholder="Search or select member..."
          className="w-full"
        />

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

      </FormModal>

    </div>
  )
}

export default CoopShareCapital
