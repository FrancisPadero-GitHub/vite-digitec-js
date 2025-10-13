import React, { useState } from 'react'
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Link } from 'react-router';

// Hooks
import { useMembers } from '../../backend/hooks/useFetchMembers';
import { useFetchCoopContributions } from './custom/useFetchCoop'; // implemented pagination

import { useAddCoopContributions } from './hooks/useAddCoopContributions';
import { useEditCoopContributions } from './hooks/useEditCoopContributions';
import { useDelete } from './hooks/useDelete';

// components
import FormModal from './modals/FormModal';
import MainDataTable from './components/MainDataTable';
import FilterToolbar from '../shared/components/FilterToolbar';

// constants
import { CAPITAL_CATEGORY_COLORS, PAYMENT_METHOD_COLORS } from '../../constants/Color';

/**
 * 
 * The size of table inside is configurable in here MainDataTable component
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
 
  const total = coopData?.count || 0;
  const coopRaw = coopData?.data || [];

  // Apply filters

  /**
   * 
   * CURRENT LIMITATION
   * 
   * it only search rows that is being paginated with the value of (20)
   * means that rows that is not paginated within that is not included on the filter
   * 
   */

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [categoryFilter, setCategoryFilter] = useState(""); // Payment category filter
  const [sourceFilter, setSourceFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "SCC"; // You can change this per table, this for the the unique table ID but this is not included in the database
  const coop = coopRaw.filter((row) => {
    const member = members?.find((m) => m.member_id === row.member_id);
    const fullName = member
      ? `${member.f_name} ${member.m_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";

    const generatedId = `${TABLE_PREFIX}_${row.coop_contri_id}`;

    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      row.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase()); // <-- ID match

    const matchesCategory =
      categoryFilter === "" || row.category === categoryFilter;

    const matchesSource =
      sourceFilter === "" || row.source === sourceFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === "" || row.payment_method === paymentMethodFilter;

    const date = row.contribution_date ? new Date(row.contribution_date) : null;
    const matchesYear =
      yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesCategory && matchesYear && matchesMonth && matchesSource && matchesPaymentMethod;
  });

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
    payment_method: "",
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
    { label: "Payment Method", name: "payment_method", type: "select", options: ['Cash', 'Gcash', 'Bank'] },
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
      payment_method: "",
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
          <h1 className="text-2xl font-bold" >Share Capital / Coop Contribution</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={openAddModal}

            >
              + Add Contribution
            </Link>
          </div>
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "Source",
              value: sourceFilter,
              onChange: setSourceFilter,
              options: [
                { label: "All", value: "" },  // will be used also for the disabled label of the dropdown
                { label: "Member Contribution", value: "Member Contribution" },
                { label: "System", value: "system" },

              ],
            },
            {
              label: "Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: "All", value: "" }, // will be used also for the disabled label of the dropdown
                { label: "Initial", value: "Initial" },
                { label: "Monthly", value: "Monthly" },
                { label: "System", value: "System" },
              ],
            },
            {
              label: "Method",
              value: paymentMethodFilter,
              onChange: setPaymentMethodFilter,
              options: [
                { label: "All", value: "" }, // will be used also for the disabled label of the dropdown
                { label: "Cash", value: "Cash" },
                { label: "GCash", value: "GCash" },
                { label: "Bank", value: "Bank" },
              ],
            },
            {
              label: "Year",
              value: yearFilter,
              onChange: setYearFilter,
              options: [
                { label: "All", value: "" },
                { label: "2025", value: "2025" },
                { label: "2024", value: "2024" },
                { label: "2023", value: "2023" },
                { label: "2022", value: "2022" },
                { label: "2021", value: "2021" },
                { label: "2020", value: "2020" },
              ],
            },
            {
              label: "Month",
              value: monthFilter,
              onChange: setMonthFilter,
              options: [
                { label: "All", value: "" },
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
          headers={["Ref No.", "Name", "Amount", "Payment Category", "Date", "Payment Method"]}
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
            const isDisabled = !matchedMember; // this is for the modifier if the system is the one that made the transactions

            const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "System";
            return (
              <tr
                key={`${TABLE_PREFIX}${row.coop_contri_id}`}
                onClick={!isDisabled ? () => openEditModal(row) : undefined}
                className={`transition-colors ${!isDisabled
                    ? "cursor-pointer hover:bg-base-200/70"
                    : "cursor-not-allowed opacity-80 bg-base-100/70"
                  }`}
              >
                <td className="px-4 py-2 text-center font-medium text-xs">SCC_{row.coop_contri_id}</td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
                    {matchedMember ? (
                      <>
                        {/* avatar for members */}
                        <div className="avatar">
                          <div className="mask mask-circle w-10 h-10">
                            <img
                              src={
                                matchedMember.avatar_url || `https://i.pravatar.cc/40?u=${matchedMember.id || matchedMember.l_name}`
                              }
                              alt={fullName}
                            />
                          </div>
                        </div>
                        <div className="truncate">{fullName || <span className="text-gray-400 italic">Not Provided</span>}</div>
                      </>
                    ) : (
                      <>
                        {/* system-generated row */}
                        <div className="text-gray-800 italic">{fullName}</div>
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-2 font-semibold text-success text-center">
                  ₱ {row.amount?.toLocaleString() || "0"}
                </td>
                {/* <td className="px-4 py-2">
                  {row.source || (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td> */}
                <td className="px-4 py-2 text-center">
                  {row.category ? (
                    <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[row.category]}`}>
                      {row.category} 
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {row.contribution_date
                    ? new Date(row.contribution_date).toLocaleDateString()
                    : <span className="text-gray-400 italic">Not Provided</span>}
                </td>
                <td className="px-4 py-2 text-center">
                  {row.payment_method ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row.payment_method]}`}>
                      {row.payment_method}
                    </span>
                  ) : (
                    <span> — </span>
                  )}
                </td>
                {/* <td className="px-4 py-2">
                  {row.remarks || (
                    <span className="text-gray-400 italic">Not Provided</span>
                  )}
                </td> */}
              </tr>
            );
          }}
       />
      </div>

      <FormModal
        table={"Share Capital"}
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
