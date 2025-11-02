import { useState, Fragment } from "react";
import { useForm, Controller } from "react-hook-form";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";

import { Toaster, toast } from "react-hot-toast";

// Context


// Fetch Hooks
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useFetchCoop } from "../../backend/hooks/shared/useFetchCoop";

// Mutation Hooks
import { useAddCoopContributions } from "../../backend/hooks/treasurer/useAddCoopContributions";
import { useEditCoopContributions } from "../../backend/hooks/treasurer/useEditCoopContributions";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// Components
import FormModal from "./modals/FormModal";
import MainDataTable from "./components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// Constants
import { CAPITAL_CATEGORY_COLORS, PAYMENT_METHOD_COLORS } from "../../constants/Color";
import defaultAvatar from "../../assets/placeholder-avatar.png";

function CoopShareCapital() {
  const placeHolderAvatar = defaultAvatar;
  const { memberRole } = useMemberRole(); // used to hide button to add transaction like a treasurer kay board rani sya view view langs

  // front end pagination
  const [page, setPage] = useState(1);                    
  const [limit] = useState(20);

  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const { data: coopData, isLoading, isError, error } = useFetchCoop({});
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
    const member = members?.find(
      (m) => m.account_number === row.account_number
    );
    const account_number = row?.account_number || "";
    const fullName = member
      ? `${member.f_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";
    const generatedId = `${TABLE_PREFIX}_${row?.coop_contri_id || ""}`;

    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());
     
    const matchesSource =
      sourceFilter === "" || row.source === sourceFilter;

    const matchesCategory =
      categoryFilter === "" || row.category === categoryFilter;

    const matchesMethod =
      paymentMethodFilter === "" || row.payment_method === paymentMethodFilter;

    const date = row.payment_date ? new Date(row.payment_date) : null;
    const matchesYear =
      yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesYear &&
      matchesMonth &&
      matchesMethod &&
      matchesSource
    );
  });

  // helper to format numbers
  const display = (num) =>
    Number(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) ?? "0.00";

  const { mutate: mutateAdd, isPending: isAddPending } = useAddCoopContributions();
  const { mutate: mutateEdit, isPending: isEditPending } = useEditCoopContributions();
  const { mutate: mutateDelete } = useDelete("coop_cbu_contributions");

  const [modalType, setModalType] = useState(null);
  const [query, setQuery] = useState("");

  // This is used for the combobox selection of members upon searching for account_number
  const filteredMembers =
    query === ""
      ? members || []
      : members.filter((m) =>
        `${m.account_number} ${m.f_name} ${m.l_name} ${m.account_role}`
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
    // Prevent double submission
    if (isAddPending || isEditPending) {
      return;
    }

    // console.log(`coop test`, data )
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
            <button className="btn btn-neutral whitespace-nowrap" onClick={openAddModal}>
              + Add Contribution
            </button>
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

            const amount = row?.amount || 0;
            const matchedMember = members.find((member) => member?.account_number === row?.account_number);
            const isDisabled = !matchedMember;
            const fullName = matchedMember ? `${matchedMember?.f_name} ${matchedMember?.l_name}`.trim() : "System";
            return (
              <tr
                key={`${TABLE_PREFIX}${row?.coop_contri_id}` }
                onClick={!isDisabled && memberRole !== "board" ? () => openEditModal(row) : undefined}
                className={`transition-colors ${!isDisabled ? "cursor-pointer hover:bg-base-200/70" : "cursor-not-allowed opacity-90 bg-base-100/70"}`}
              >
                <td className="px-4 py-2 text-center font-medium text-xs">{TABLE_PREFIX}_{row?.coop_contri_id}</td>
                <td className="px-4 py-2 text-center font-medium text-xs">{matchedMember?.account_number || "System"}</td>
                
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
                    <Fragment>
                      {/* avatar for members */}
                      <div className="avatar">
                        <div className="mask mask-circle w-10 h-10">
                          <img
                            src={
                              matchedMember?.avatar_url || placeHolderAvatar
                            }
                            alt={fullName}
                          />
                        </div>
                      </div>

                      <span className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]">{fullName}</span>
                        {isDisabled && (
                          <div className="tooltip tooltip-top" data-tip="System Generated">
                            <span className="badge badge-sm badge-ghost">?</span>
                          </div>
                        )}
                      </span>


                    </Fragment>
                  </span>
                </td>

                <td className="px-4 py-2 font-semibold text-success text-center">₱ {display(amount)}</td>
                <td className="px-4 py-2 text-center">
                  {row?.category ? (
                    <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[row?.category]}`}>{row?.category}</span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">{row?.contribution_date ? new Date(row?.contribution_date).toLocaleDateString() : <span className="text-gray-400 italic">Not Provided</span>}</td>
                <td className="px-4 py-2 text-center">
                  {row?.payment_method ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row?.payment_method]}`}>{row?.payment_method}</span>
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
        isPending={isAddPending || isEditPending}
        status={isAddPending || isEditPending}
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
                        <div className="relative flex items-center justify-between">
                          <span className="font-mono text-sm">{member.account_number}</span>

                          <span className="absolute left-1/2 -translate-x-1/2 text-center truncate text-sm">
                            {member.account_role}
                          </span>

                          <span className="truncate text-sm">
                            {member.f_name} {member.m_name} {member.l_name}
                          </span>
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

            {name === "amount" ? (
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: true,
                  min: {
                    value: 1,
                    message: "Amount must be greater than 0",
                  },
                  validate: (value) => value > 0 || "Amount cannot be zero or negative",
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <input
                      id="amount"
                      type="number"
                      autoComplete="off"
                      value={field.value}
                      placeholder="Enter Amount"
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          field.onChange(""); // allow clearing
                          return;
                        }

                        const value = Number(raw);
                        field.onChange(value < 0 ? 0 : value);
                      }}
                      className={`input input-bordered w-full ${error ? "input-error" : ""
                        }`}
                    />
                    {error && (
                      <span className="text-sm text-error mt-1 block">
                        {error.message}
                      </span>
                    )}
                  </>
                )}
              />
            ) : type === "select" ? (
              <select
                id={name}
                autoComplete={autoComplete}
                {...register(name, { required: true })}
                className="select select-bordered w-full"
              >
                <option value="" disabled>
                  Select {label}
                </option>
                {options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
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
