import React, { useState } from 'react'
import SearchIcon from "@mui/icons-material/Search";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'; // for the searchable dropdown below for members
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
    period_start: "",
    period_end: "",
    remarks: "",
  });

  /**
   * This is for the member search for the modal
   */
  const [query, setQuery] = useState("");
  const filteredMembers =
    query === ""
      ? members || []
      : members?.filter((m) =>
        `${m.f_name} ${m.l_name} ${m.email}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) || [];


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
      options: ["GMM", "Monthly Dues", "Activities", "Alalayang Agila", "Community Service", "Others"] 
    },

    { label: "Payment Date", name: "payment_date", type: "date" },
    {
      label: "Payment Method",
      name: "payment_method",
      type: "select",
      options: ["GCash", "Cash"],
    },
    { label: "Period Start", name: "period_start", type: "date" },
    { label: "Period End", name: "period_end", type: "date" },

    { label: "Remarks", name: "remarks", type: "text" },
  ];

  /**
   * Modal Handlers
   * 
   */
  const openAddModal = () => {
    // Reset form data to initial state
    setFormData({
      contribution_id: null,
      member_id: null,
      amount: 0,
      category: "",
      payment_date: "",
      payment_method: "",
      period_start: "",
      period_end: "",
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
    mutateDelete({ table: "club_funds_contributions", column_name: "contribution_id", id: contribution_id });
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
          <h1 className="text-2xl font-bold">Club Funds</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={openAddModal}

            >
              + Add Transaction
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

        <section className="space-y-4">
          <div className="overflow-x-auto border border-base-content/5 bg-base-100/90 rounded-2xl shadow-md">
            <table className="table">
              <thead>
                <tr className="bg-base-200/30 text-left">

                  <th>#</th>
                  <th>Name</th>
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
                    <tr
                      onClick={() => openEditModal(fund)}
                      className="cursor-pointer hover:bg-base-200/70 transition-colors"
                    >
                      {/* Contribution ID */}
                      <td className="px-4 py-2 font-medium">{fund.contribution_id}</td>

                      {/* Member Name */}
                      <td className="px-4 py-2">
                        {(() => {
                          const matchedMember = members?.find(
                            (member) => member.member_id === fund.member_id
                          );
                          if (!matchedMember) return <span className="italic">Not Provided</span>;

                          return (
                            <span className="flex items-center gap-2">
                              {`${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-2 font-semibold text-success">
                       
                        
                          ₱ {fund.amount?.toLocaleString() || "0"}
                        
                      </td>

                      {/* Category */}
                      <td className="px-4 py-2">{fund.category || "Not Provided"}</td>

                      {/* Payment Date */}
                      <td className="px-4 py-2">
                        {fund.payment_date ? (
                          <span>{new Date(fund.payment_date).toLocaleDateString()}</span>
                        ) : (
                          <span className="italic">Not Provided</span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-2">
                        {fund.payment_method ? (
                          <span
                            className={`badge font-semibold ${fund.payment_method === "Cash"
                              ? "badge-success"
                              : "badge-info"
                              }`}
                          >
                            {fund.payment_method}
                          </span>
                        ) : (
                          <span className="italic">Not Provided</span>
                        )}
                      </td>

                      {/* Period Covered */}
                      <td className="px-4 py-2">
                        {fund.period_start && fund.period_end ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
                            {new Date(fund.period_start).toLocaleDateString()} –{" "}
                            {new Date(fund.period_end).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="italic">Not Provided</span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="px-4 py-2">{fund.remarks || "Not Provided"}</td>
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
          <label className="label text-sm font-semibold">Member</label>
          <div className="relative">
            <Combobox
              value={members.find((m) => m.member_id === formData.member_id) || null}
              onChange={(member) =>
                handleChange({ target: { name: "member_id", value: member?.member_id } })
              }
            >
              <ComboboxInput
                required
                className="input input-bordered w-full"
                placeholder="Search or select member..."
                displayValue={(member) =>
                  member ? `${member.f_name} ${member.l_name} (${member.email})` : ""
                }
                onChange={(e) => setQuery(e.target.value)}
              />
              <ComboboxOptions className="absolute z-[999] w-full mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                {filteredMembers.length === 0 ? (
                  <div className="px-4 py-2 text-base-content/60">No members found.</div>
                ) : (
                  filteredMembers.map((member) => (
                    <ComboboxOption
                      key={member.member_id}
                      value={member}
                      className={({ focus }) =>
                        `px-4 py-2 cursor-pointer transition-colors duration-150 ${focus ? "bg-primary text-primary-content" : "hover:bg-base-200"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        {/* AVATAR WILL BE IMPLMENTED LATER */}
                        {/* <img
                          src={member.avatar}
                          className="w-7 h-7 rounded-full border border-base-300"
                          alt="avatar"
                        /> */}
                        <span className="truncate">
                          {member.f_name} {member.l_name} ({member.email})
                        </span>
                      </div>
                    </ComboboxOption>
                  ))
                )}
              </ComboboxOptions>
            </Combobox>
          </div>
        </div>

        {fields.map(({ label, name, type, options }) => (
          <div key={name} className="form-control w-full mt-2">
            <label htmlFor={name} className="label mb-1">
              <span className="label-text font-medium">
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
  )
}

export default ClubFunds
