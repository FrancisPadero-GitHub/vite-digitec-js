import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { Link } from "react-router";
import { Toaster, toast } from "react-hot-toast";

// Context
import { useMemberRole } from "../../backend/context/useMemberRole";

// Fetch Hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchCoop } from "../../backend/hooks/shared/useFetchCoop";
import { useAddCoopContributions } from "../../backend/hooks/treasurer/useAddCoopContributions";
import { useEditCoopContributions } from "../../backend/hooks/treasurer/useEditCoopContributions";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// Components
import FormModal from "./modals/FormModal";
import MainDataTable from "./components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// Constants
import { CAPITAL_CATEGORY_COLORS, PAYMENT_METHOD_COLORS } from "../../constants/Color";

function CoopShareCapital() {
  const { memberRole } = useMemberRole();         // used to hide button to add transaction like a treasurer kay board rani sya view view langs

  // front end pagination
  const [page, setPage] = useState(1);                    
  const [limit] = useState(20);

  const { data: members_data } = useMembers();
  const members = members_data?.data || [];
  
  const { data: coopData, isLoading, isError, error } = useFetchCoop({ page, limit });
  const total = coopData?.count || 0;
  const coopRaw = coopData?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "SCC";
  const coop = coopRaw.filter((row) => {
    const member = members.find((m) => m.account_number === row.account_number);
    const account_number = row.account_number;
    const fullName = member
      ? `${member.f_name} ${member.m_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";

    const generatedId = `${TABLE_PREFIX}_${row.coop_contri_id}`;
    const date = row.contribution_date ? new Date(row.contribution_date) : null;

    return (
      (searchTerm === "" ||
        fullName.includes(searchTerm.toLowerCase()) ||
        account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        generatedId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "" || row.category === categoryFilter) &&
      (sourceFilter === "" || row.source === sourceFilter) &&
      (paymentMethodFilter === "" || row.payment_method === paymentMethodFilter) &&
      (yearFilter === "" || (date && date.getFullYear().toString() === yearFilter)) &&
      (monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter))
    );
  });

  const { mutate: mutateAdd } = useAddCoopContributions();
  const { mutate: mutateEdit } = useEditCoopContributions();
  const { mutate: mutateDelete } = useDelete("coop_cbu_contributions");

  const [modalType, setModalType] = useState(null);
  const [query, setQuery] = useState("");

  const filteredMembers =
    query === ""
      ? members || []
      : members.filter((m) =>
        `${m.account_number} ${m.f_name} ${m.l_name} ${m.email}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );

  const defaultValues = {
    coop_contri_id: null,
    account_number: null,
    source: "Member Contribution",
    category: "",
    amount: 0,
    contribution_date: "",
    payment_method: "",
    remarks: "",
  };

  const { handleSubmit, reset, control, register} = useForm({
    defaultValues,
  });

  const openAddModal = () => {
    reset(defaultValues);
    setModalType("add");
  };

  const openEditModal = (rowData) => {
    reset(rowData);
    setModalType("edit");
  };

  const closeModal = () => setModalType(null);

  const handleDelete = (coop_contri_id) => {
    mutateDelete({ table: "coop_cbu_contributions", column_name: "coop_contri_id", id: coop_contri_id });
    closeModal();
  };

  const onSubmit = (data) => {
    if (modalType === "add") {
      mutateAdd(data,
        {onSuccess: () => {
            toast.success("Coop contribution added")
            closeModal();
        }, 
          onError: () => {
            toast.error("Something went wrong")
          }
        }
      );
    } else if (modalType === "edit") {
      mutateEdit(data,
        {onSuccess: () => {
          toast.success("Successfully updated")
          closeModal();
        },
          onError: () => {
            toast.error("Something went wrong");
          }
      }
      );
    }
  };

  const fields = [
    { label: "Amount", name: "amount", type: "number", autoComplete: "off" },
    { label: "Payment Category", name: "category", type: "select", 
      options: [
        {label: "Monthly", value: "Monthly"},
        {label: "Initial", value: "Initial"}
      ]},
    { label: "Date", name: "contribution_date", type: "date", autoComplete: "date" },
    { label: "Payment Method", name: "payment_method", type: "select", autoComplete: "off",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ]},
    { label: "Remarks", name: "remarks", type: "text", autoComplete: "off" },
  ];

  return (
    <div>
      <Toaster position="bottom-left"/>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Share Capital / Coop Contribution</h1>
          {memberRole !== "board" && (
            <Link className="btn btn-neutral whitespace-nowrap" onClick={openAddModal}>
              + Add Contribution
            </Link>
          )}
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            { 
              label: "All Source", 
              value: sourceFilter, 
              onChange: setSourceFilter, 
              options: [
                { label: "Member", value: "Member Contribution" }, 
                { label: "System", value: "system" }
              ]
            },
            { 
              label: "All Category", 
              value: categoryFilter, 
              onChange: setCategoryFilter, 
              options: [
                { label: "Initial", value: "Initial" }, 
                { label: "Monthly", value: "Monthly" }, 
                { label: "System", value: "System" },
              ]
            },
            {
              label: "All Method", 
              value: paymentMethodFilter, 
              onChange: setPaymentMethodFilter, 
              options: [
                { label: "Cash", value: "Cash" }, 
                { label: "GCash", value: "GCash" }, 
                { label: "Bank", value: "Bank" }
              ] 
            },
            { 
              label: "All Year", 
              value: yearFilter, 
              onChange: setYearFilter, 
              options: [
                { label: "2025", value: "2025" },
                { label: "2024", value: "2024" },
                { label: "2023", value: "2023" },
                { label: "2022", value: "2022" },
                { label: "2021", value: "2021" },
                { label: "2020", value: "2020" },
              ] 
            },
            { 
              label: "All Month", 
              value: monthFilter, 
              onChange: setMonthFilter, 
              options: [
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
          headers={[
            "Ref No.",
            "Account No.", 
            "Name",
            "Amount", 
            "Payment Category", 
            "Date", 
            "Payment Method"
          ]}
          data={coop}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            const matchedMember = members.find((member) => member.account_number === row.account_number);
            const isDisabled = !matchedMember;
            const fullName = matchedMember ? `${matchedMember.f_name} ${matchedMember.l_name}`.trim() : "System";

            return (
              <tr
                key={`${TABLE_PREFIX}${row.coop_contri_id}`}
                onClick={!isDisabled && memberRole !== "board" ? () => openEditModal(row) : undefined}
                className={`transition-colors ${!isDisabled ? "cursor-pointer hover:bg-base-200/70" : "cursor-not-allowed opacity-80 bg-base-100/70"}`}
              >
                <td className="px-4 py-2 text-center font-medium text-xs">{TABLE_PREFIX}_{row.coop_contri_id}</td>
                <td className="px-4 py-2 text-center font-medium text-xs">{matchedMember?.account_number || "Something went wrong"}</td>
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
                <td className="px-4 py-2 font-semibold text-success text-center">₱ {row.amount?.toLocaleString() || "0"}</td>
                <td className="px-4 py-2 text-center">
                  {row.category ? (
                    <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[row.category]}`}>{row.category}</span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">{row.contribution_date ? new Date(row.contribution_date).toLocaleDateString() : <span className="text-gray-400 italic">Not Provided</span>}</td>
                <td className="px-4 py-2 text-center">
                  {row.payment_method ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row.payment_method]}`}>{row.payment_method}</span>
                  ) : (
                    <span> — </span>
                  )}
                </td>
              </tr>
            );
          }}
        />
      </div>

      <FormModal
        table="Share Capital"
        open={modalType !== null}
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        deleteAction={() => handleDelete(control._formValues.coop_contri_id)}
      >
        <div className="form-control w-full">
          <label className="label text-sm font-semibold mb-2">Member Account</label>
          <Controller
            name="account_number"
            control={control}
            render={({ field }) => (
              <Combobox
                value={members.find((m) => m.account_number === field.value) || null}
                onChange={(member) => field.onChange(member?.account_number)}
              >
                <ComboboxInput
                  required
                  className="input input-bordered w-full"
                  placeholder="Search by Account Number or Name..."
                  displayValue={(member) => (member ? member.account_number : "")}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <ComboboxOptions className="absolute z-[800] w-[93%] mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                  {filteredMembers.length === 0 ? (
                    <div className="px-4 py-2 text-base-content/60">No members found.</div>
                  ) : (
                    filteredMembers.map((member) => (
                      <ComboboxOption
                        key={member.account_number}
                        value={member}
                        className={({ focus }) =>
                          `px-4 py-2 cursor-pointer transition-colors duration-150 ${focus ? "bg-primary text-primary-content" : "hover:bg-base-200"
                          }`
                        }
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{member.account_number}</span>
                          <span className="truncate text-sm">{member.f_name} {member.m_name} {member.l_name}</span>
                        </div>
                      </ComboboxOption>
                    ))
                  )}
                </ComboboxOptions>
              </Combobox>
            )}
          />
        </div>

        {fields.map(({ label, name, type, options, autoComplete }) => (
          <div key={name} className="form-control w-full mt-2">
            <label htmlFor={name}>
              <span className="label text-sm font-semibold mb-2">{label}</span>
            </label>
            {type === "select" ? (
              <select
                id={name}
                autoComplete={autoComplete}
                {...register(name, { required: true })}
                className="select select-bordered w-full"
              >
                <option value="" disabled>Select {label}</option>
                {options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                id={name}
                autoComplete={autoComplete}
                type={type}
                {...register(name, { required: true })}
                className="input input-bordered w-full"
              />
            )}
          </div>
        ))}
      </FormModal>
    </div>
  );
}

export default CoopShareCapital;
