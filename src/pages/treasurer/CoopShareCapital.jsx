import React, { useState } from 'react'
import SearchIcon from "@mui/icons-material/Search";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Link } from 'react-router';

// Hooks
import { useMembers } from '../../backend/hooks/useFetchMembers';
// import { useFetchCoopContributions } from './hooks/useFetchCoopContributions'; // Old Fetch contributions 
import { useFetchCoopContributions } from './custom/useFetchCoop'; // implemented pagination

import { useAddCoopContributions } from './hooks/useAddCoopContributions';
import { useEditCoopContributions } from './hooks/useEditCoopContributions';
import { useDelete } from './hooks/useDelete';

// components
import FormModal from './modals/FormModal';
import MainDataTable from './components/MainDataTable';

import { CAPITAL_CATEGORY_COLORS } from '../../constants/Color';


/**
 * 
 * The size of table inside is configurable in here MainDataTable
 * 
 */

function CoopShareCapital() {

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

  // useQuery hook to fetch coop funds and members
  const { data: members } = useMembers();
  const { data: coopData, isLoading, isError, error } = useFetchCoopContributions(page, limit);

  // Pagination sets a limiter to be rendered to avoid infinite rendering of the whole table
  const coop = coopData?.data || [];
  const total = coopData?.count || 0;

  // mutation hooks for adding and editing funds
  const { mutate: mutateAdd } = useAddCoopContributions();
  const { mutate: mutateEdit } = useEditCoopContributions();
  const { mutate: mutateDelete } = useDelete('coop_cbu_contributions');

  // form data
  const [formData, setFormData] = useState({
    coop_contri_id: null,
    member_id: null,
    source: "Member Contribution", // given default value for it 
    category: "",
    amount: 0,
    contribution_date: "",
    remarks: "",
  })

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

  const fields = [
    { label: "Amount", name: "amount", type: "number" },
    { label: "Payment Category", name: "category", type: "select", options: ['Initial', 'Monthly'] },
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
      source: "Member Contribution", // given default value for it 
      category: "",
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
          <h1 className="text-2xl font-bold" >Coop Share Capital</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={openAddModal}

            >
              + Add Contribution
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

        <MainDataTable
          title="Coop Contributions"
          linkPath="/coop/contributions"
          headers={["Ref No.", "Name", "Amount", "Source", "Payment Category", "Date", "Remarks"]}
          data={coop}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            const matchedMember = members?.find(
              (member) => member.member_id === row.member_id
            );
            const isDisabled = !matchedMember;
            return (
              <tr
                key={row.coop_contri_id}
                onClick={!isDisabled ? () => openEditModal(row) : undefined}
                className={`transition-colors ${!isDisabled
                    ? "cursor-pointer hover:bg-base-200/70"
                    : "cursor-not-allowed opacity-80 bg-base-100/70"
                  }`}
              >
                <td className="px-4 py-2 font-medium">{row.coop_contri_id}</td>
                <td className="px-4 py-2">
                  <span className="flex items-center gap-2">
                    {matchedMember
                      ? `${matchedMember.f_name ?? ""} ${matchedMember.m_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
                      : "System"}
                    {isDisabled && (
                      <div className="tooltip tooltip-top" data-tip="System Generated">
                        <span className="badge badge-sm badge-ghost">?</span>
                      </div>
                    )}
                  </span>
                </td>
                <td className="px-4 py-2 font-semibold text-success">
                  ₱ {row.amount?.toLocaleString() || "0"}
                </td>
                <td className="px-4 py-2">
                  {row.source || (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {row.category ? (
                    <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[row.category]}`}>
                      {row.category} 
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {row.contribution_date
                    ? new Date(row.contribution_date).toLocaleDateString()
                    : <span className="text-gray-400 italic">Not Provided</span>}
                </td>
                <td className="px-4 py-2">
                  {row.remarks || (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td>
              </tr>
            );
          }}
       />

      
      </div>

      <FormModal
        open={modalType !== null}
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit}
        deleteAction={() => handleDelete(formData.coop_contri_id)}
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
            <label htmlFor={name}>
              <span className="label text-sm font-semibold mb-2">
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

export default CoopShareCapital
