import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Link } from "react-router";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";
import { useMemberRole } from "../../backend/context/useMemberRole";
import { useFetchClubFunds } from "../../backend/hooks/shared/useFetchClubFunds";

// mutation hooks
import { useAddClubFunds } from "../../backend/hooks/treasurer/useAddClubFunds";
import { useEditClubFunds } from "../../backend/hooks/treasurer/useEditClubFunds";
import { useDelete } from "../../backend/hooks/shared/useDelete";

// components
import FormModal from "./modals/FormModal";
import MainDataTable from "./components/MainDataTable";
import FilterToolbar from "../shared/components/FilterToolbar";

// constants
import {
  CLUB_CATEGORY_COLORS,
  PAYMENT_METHOD_COLORS,
} from "../../constants/Color";
import defaultAvatar from "../../assets/placeholder-avatar.png";

function ClubFunds() {
    const placeHolderAvatar = defaultAvatar;
  const { memberRole } = useMemberRole();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
  const { data: clubFundsData, isLoading, isError, error } = useFetchClubFunds({});

  const clubFundsRaw = clubFundsData?.data || [];
  const total = clubFundsData?.count || 0;

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [methodFilter, setmethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "CFC";
  const clubFunds = clubFundsRaw.filter((row) => {
    const member = members?.find(
      (m) => m.account_number === row.account_number
    );
    const account_number = row?.account_number || "";
    const fullName = member
      ? `${member.f_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";
    const generatedId = `${TABLE_PREFIX}_${row?.contribution_id || ""}`;

    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || row.category === categoryFilter;

    const matchesMethod =
      methodFilter === "" || row.payment_method === methodFilter;

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
      matchesMethod
    );
  });

  // helper to format numbers
  const display = (num) =>
    Number(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) ?? "0.00";

  // mutations
  const { mutate: mutateAdd } = useAddClubFunds();
  const { mutate: mutateEdit } = useEditClubFunds();
  const { mutate: mutateDelete } = useDelete("club_funds_contributions");

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
    contribution_id: null,
    account_number: null,
    amount: 0,
    category: "",
    payment_date: "",
    payment_method: "",
    period_start: "",
    period_end: "",
    remarks: "",
  }

  // react hook form
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues
  });


  const openAddModal = () => {
    reset(defaultValues); 
    setModalType("add");
  };

  const openEditModal = (selectedRowData) => {
    reset(selectedRowData); // preload RHF values
    setModalType("edit");
  };

  const closeModal = () => setModalType(null);


  const handleDelete = (contribution_id) => {
    mutateDelete({
      table: "club_funds_contributions",
      column_name: "contribution_id",
      id: contribution_id,
    });
    closeModal();
  };

  const onSubmit = (data) => {
    if (modalType === "add") {
      mutateAdd(data,
        {onSuccess: () => {
            toast.success("Club fund contribution added")
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
    { label: "Amount", name: "amount", type: "number" },
    {
      label: "Category",
      name: "category",
      type: "select",
      options: [
        { label: "GMM", value: "GMM" },
        { label: "Monthly Dues", value: "Monthly Dues" },
        { label: "Activities", value: "Activities" },
        { label: "Community Service", value: "Community Service" },
        { label: "Alalayang Agila", value: "Alalayang Agila" },
        { label: "Others", value: "Others" },
      ]
    },
    { label: "Payment Date", name: "payment_date", type: "date" },
    {
      label: "Payment Method",
      name: "payment_method",
      type: "select",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ]
    },
    { label: "Period Start", name: "period_start", type: "date" },
    { label: "Period End", name: "period_end", type: "date" },
    { label: "Remarks", name: "remarks", type: "text" },
  ];


  return (
    <div>
      <Toaster position="bottom-left"/>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Club Funds Contribution</h1>
          {memberRole !== "board" && (
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={openAddModal}
            >
              + Add Transaction
            </Link>
          )}
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "All Method",
              value: methodFilter,
              onChange: setmethodFilter,
              options: [
                { label: "Cash", value: "Cash" },
                { label: "GCash", value: "GCash" },
                { label: "Bank", value: "Bank" },
              ],
            },
            {
              label: "All Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: "Monthly Dues", value: "Monthly Dues" },
                { label: "Activities", value: "Activities" },
                { label: "Alalayang Agila", value: "Alalayang Agila" },
                { label: "Community Service", value: "Community Service" },
                { label: "Others", value: "Others" },
              ],
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
              ],
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
            "Category",
            "Date",
            "Method",
            "Period Covered",
          ]}
          data={clubFunds}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            const amount = row?.amount || 0;
            const matchedMember = members?.find(
              (member) => member?.account_number === row?.account_number
            );
            const fullName = matchedMember
              ? `${matchedMember?.f_name ?? ""} ${matchedMember?.l_name ?? ""}`.trim()
              : "Not Found";

            return (
              <tr
                key={`${TABLE_PREFIX}${row?.contribution_id}`}
                onClick={
                  memberRole !== "board" ? () => openEditModal(row) : undefined
                }
                className="transition-colors cursor-pointer hover:bg-base-200/70"
              >
                <td className="px-4 py-2 text-center font-medium text-xs">
                  {TABLE_PREFIX}_{row?.contribution_id}
                </td>
                <td className="px-4 py-2 text-center font-medium text-xs">
                  {matchedMember?.account_number || "Not Found"}
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
                    {matchedMember ? (
                      <>
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
                  ₱ {display(amount)}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`font-semibold ${CLUB_CATEGORY_COLORS[row?.category]}`}
                  >
                    {row?.category || "Not Provided"}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  {row?.payment_date ? (
                    <span>{new Date(row?.payment_date).toLocaleDateString()}</span>
                  ) : (
                    <span className="italic">Not Provided</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {row?.payment_date ? (
                    <span
                      className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row?.payment_method]}`}
                    >
                      {row?.payment_method}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">
                      Not Provided
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {row?.period_start && row?.period_end ? (
                    <span className="text-xs">
                      {new Date(row.period_start).toLocaleDateString()} -<br />
                      {new Date(row.period_end).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="italic">Not Provided</span>
                  )}
                </td>
              </tr>
            );
          }}
        />
      </div>

      <FormModal
        table={"Club Funds"}
        open={modalType !== null}
        close={closeModal}
        action={modalType === "edit"}
        onSubmit={handleSubmit(onSubmit)}
        deleteAction={() =>
          handleDelete(control._formValues.contribution_id)
        }
      >
        {/* Member Combobox with Controller */}
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

export default ClubFunds;
