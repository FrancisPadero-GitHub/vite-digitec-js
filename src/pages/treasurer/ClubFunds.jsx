import React, { useState } from 'react'
import { Link } from 'react-router';

// hooks
import { useMembers } from '../../backend/hooks/useFetchMembers';
import { useFetchClubFunds } from './hooks/useFetchClubFunds'
import { useAddClubFunds } from './hooks/useAddClubFunds';
import { useEditClubFunds } from './hooks/useEditClubFunds';
import { useDelete } from './hooks/useDelete';

// components
import FormModal from './modals/FormModal';

function ClubFunds() {
  // useQuery hook to fetch club funds and members
  const { data: members } = useMembers();
  const { data: clubFunds, isLoading, isError, error } = useFetchClubFunds();

  // mutation hooks for adding and editing funds
  const { mutate: mutateAdd } = useAddClubFunds();
  const { mutate: mutateEdit } = useEditClubFunds();
  const { mutate: mutateDelete } = useDelete('club_funds_contributions');

  // form data
  const [formData, setFormData] = useState({
    contribution_id: null,
    member_id: null,
    amount: 0,
    category: "",
    payment_date: "",
    payment_method: "",
    period_covered: "",
    remarks: "",
  }
  );

  const [modalType, setModalType] = useState(null); // "add" | "edit" | null

  /**
   *  input fields for the form
   *  can be extended with options for select fields
   *  example: { label: "Type", name: "type", type: "select", options: ["Food", "Transport"] }
   */

  const fields = [
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
    { label: "Period Covered", name: "period_covered", type: "text" },
    { label: "Remarks", name: "remarks", type: "text" },
  ];

  /**
   * Modal Handlers
   * 
   */
  const openAddModal = () => {
    setFormData({
      contribution_id: null,
      member_id: null,
      amount: 0,
      category: "",
      payment_date: "",
      payment_method: "",
      period_covered: "",
      remarks: "",
    })
    setModalType("add");
  }

  const openEditModal = (selectedRowData) => {
    setFormData(selectedRowData); // preload form with row data
    console.log(selectedRowData)
    setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
  };
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

  const handleDelete = (contribution_id) => {
    console.log("Deleting Club fund:", contribution_id);
    mutateDelete({ table: "club_funds_contributions", column_name: "contribution_id", id: contribution_id }); // hard coded base on what file the modal is imported
    closeModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modalType === "add") {
      mutateAdd(formData);
      console.log("Adding Club funds:", formData);
    } else if (modalType === "edit") {
      mutateEdit(formData);
      console.log("Updating Club funds:", formData);
    }

    closeModal();
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
              onClick={openAddModal}

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
                {clubFunds.map((fund) => (
                  <React.Fragment key={fund.contribution_id}>
                    {/* onClick FN on tr === table row */}
                    <tr
                      onClick={() => openEditModal(fund)}
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
      <FormModal
        open={modalType !== null} // which will be set to true if value is present
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit}
        deleteAction={() => handleDelete(formData.contribution_id)}
      >
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

export default ClubFunds
