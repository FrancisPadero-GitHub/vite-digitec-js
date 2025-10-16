import {useState, useMemo} from 'react'
import dayjs from 'dayjs';
import { Link } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";

// fetch hooks
import { useMembers } from '../../backend/hooks/shared/useFetchMembers';
import { useFetchLoanPayments } from '../../backend/hooks/shared/useFetchPayments';
import { useFetchLoanAcc } from '../../backend/hooks/shared/useFetchLoanAcc';


// mutation hooks
import { useDelete } from '../../backend/hooks/shared/useDelete';
import { useAddLoanPayments } from '../../backend/hooks/treasurer/useAddPayments';


// components
import FilterToolbar from '../shared/components/FilterToolbar';
import MainDataTable from './components/MainDataTable';
import FormModal from './modals/FormModal';

// constants
import { PAYMENT_METHOD_COLORS } from '../../constants/Color';


function CoopLoansPayments() {
  const { data: loan_acc_data, } = useFetchLoanAcc({});
  const loanApps = loan_acc_data?.data || [];

  const { data: members_data } = useMembers();
  const members = members_data?.data || [];
  // Filter members based on query
  const [query, setQuery] = useState("");
  const filteredMembers =
    query === ""
      ? members
      : members.filter((m) =>
        `${m.f_name} ${m.m_name} ${m.l_name} ${m.email}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: loanPaymentsData, isLoading, isError, error } = useFetchLoanPayments(page, limit);
  const loanPaymentsRaw = loanPaymentsData?.data || [];
  const total = loanPaymentsData?.count || 0;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [categoryFilter, setCategoryFilter] = useState(""); // Payment category filter
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "LP"; // You can change this per table, this for the the unique table ID but this is not included in the database
  const loanPayments = loanPaymentsRaw.filter((row) => {
    const member = members?.find((m) => m.member_id === row.member_id);
    const fullName = member
      ? `${member.f_name} ${member.m_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";

    const generatedId = `${TABLE_PREFIX}_${row.payment_id}`;

    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      row.receipt_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.payment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase()); // <-- ID match

    const matchesCategory =
      categoryFilter === "" || row.payment_type === categoryFilter;


    const matchesPaymentMethod =
      paymentMethodFilter === "" || row.payment_method === paymentMethodFilter;

    const date = row.contribution_date ? new Date(row.contribution_date) : null;
    const matchesYear =
      yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesCategory && matchesYear && matchesMonth && matchesPaymentMethod;
  });

  const { mutate: mutateDelete } = useDelete('loan_payments');

  // React hook forms 
  const {mutate: addLoanPayments} = useAddLoanPayments();
  const today = new Date().toISOString().split("T")[0];
  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      payment_id: "",
      loan_id:  "", // or Account_number
      payer_id: "",
      amount: "",
      payment_method: "",
      payment_date: today,
      receipt_no: "",
      payment_type: "",
    },
  });


  
  /**
   * 
   * TEMPORARY WORK AROUND
   * 
   * sets the loan_id automatically if a member is selected and has a loan acc that is active 
   */

  // Watch the dependencies
  const payerId = watch("payer_id");
  const loanId = watch("loan_id");
  const paymentDate = watch("payment_date");

  // Compute receipt_no whenever dependencies change
  useMemo(() => {
    if (loanId && payerId && paymentDate) {
      setValue(
        "receipt_no",
        `L${loanId}-P${payerId}-D${dayjs(paymentDate).format("YYYYMMDD")}`
      );
    } else {
      setValue("receipt_no", "");
    }
  }, [loanId, payerId, paymentDate, setValue]);



  // Modal Controls
  const [modalType, setModalType] = useState(null); // "add" | "edit" | null

  const openAddModal = () => {
    reset({
      loan_id: "",
      payer_id: "",
      amount: "",
      payment_method: "",
      payment_date: today,
      receipt_no: "",
      payment_type: "",
    })
    setModalType("add");
  }
  const openEditModal = (data) => {
    console.log(data)
    // setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
  };

  // Handlers
  const handleDelete = (payment_id) => {
    // console.log("Deleting Coop contribution:", payment_id);
    mutateDelete({ table: "loan_payments", column_name: "payment_id", id: payment_id });
    closeModal();
  };

  const onSubmit = (data) => {
    addLoanPayments(data)
    console.log("Form data:", data);
    closeModal();
  }

  if (isLoading) return <div>Loading Loan Payments...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold" >Member Loan Payments</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="btn btn-neutral whitespace-nowrap"
              onClick={openAddModal}

            >
              + Add Payments
            </Link>
          </div>
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: "All", value: "" }, // will be used also for the disabled label of the dropdown
                { label: "Full", value: "Full" },
                { label: "Partial", value: "Partial" }
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
          headers={["Ref No.", "Loan ID", "Name", "Amount", "Payment Method", "Type", "Date", "Receipt No"]}
          data={loanPayments}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            const matchedMember = members?.find(
              (member) => member.member_id === row.payer_id // This is temporary so I don't have to create another shiz nga column .find or .filter kay kapoy HAHAHAHA
            );
            const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "System";
            return (
              <tr
                key={`${TABLE_PREFIX}${row.payment_id}`}
                onClick={() => openEditModal(row)}
                className="transition-colors cursor-pointer hover:bg-base-200/70"
              >
                {/* Ref no */}
                <td className="px-4 py-2 text-center font-medium text-xs">{TABLE_PREFIX}_{row.payment_id}</td>
                
                {/* Loan ID */}
                <td className="px-4 py-2 text-center">{row.loan_id || "Not Found"}</td>
                 
                 {/* Name */}
                <td className="px-4 py-4">
                  <span className="flex items-center gap-3">
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
                    <div className="truncate">{fullName || <span className="text-gray-400 italic">Not Found</span>}</div>
                  </span>
                </td>
                {/* Amount */}
                <td className="px-4 py-2 font-semibold text-success text-center">
                  ₱ {row.amount?.toLocaleString() || "0"}
                </td>
                {/* Method */}
                <td className="px-4 py-2 text-center">
                  {row.payment_method ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row.payment_method]}`}>
                      {row.payment_method}
                    </span>
                  ) : (
                    <span> — </span>
                  )}
                </td>
                {/* Type */}
                <td className="px-4 py-2 text-center">{row.payment_type}</td>
                {/* Date */}
                <td className="px-4 py-2 text-center">{row.payment_date}</td>
                {/* Row */}
                <td className="px-4 py-2 text-center">{row.receipt_no}</td>
                
              </tr>
            )}}
        />
        <FormModal
          table={"Loan Payment"}
          open={modalType !== null}
          close={closeModal}
          action={modalType === "edit"}
          onSubmit={handleSubmit(onSubmit)}
          deleteAction={() => handleDelete(watch("payment_id"))}
        >
          {/* Member Selection */}
          <div className="form-control w-full">
            <label className="label text-medium mb-2 font-semibold">Member</label>
            <div className="relative">
              <Controller
                name="payer_id" // must reflect to the react use hook form 
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Combobox
                    value={members.find((m) => m.member_id === field.value) || null}
                    onChange={(member) => {
                      // Set the payer_id
                      field.onChange(member?.member_id);

                      // Immediately set the loan_id for that member
                      const memberLoans = loanApps?.data?.find(
                        (loan) => loan.applicant_id === member?.member_id && loan.status === "Active" && loan.deleted_at === null
                      );

                      console.log(memberLoans.loan_id)

                      if (memberLoans) {
                        setValue("loan_id", memberLoans.loan_id);
                      } else {
                        setValue("loan_id", "Not Found");
                      }
                    }}
                  >
                    <ComboboxInput
                      required
                      className="input input-bordered w-full"
                      placeholder="Search or select member..."
                      displayValue={() => {
                        const selected = members.find((m) => m.member_id === field.value);
                        return selected
                          ? `${selected.f_name} ${selected.l_name} (${selected.email})`
                          : "";
                      }}
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
                            className={({ active }) =>
                              `px-4 py-2 cursor-pointer transition-colors duration-150 ${active ? "bg-primary text-primary-content" : "hover:bg-base-200"
                              }`
                            }
                          >
                            <div className="flex items-center gap-3">
                              <span className="truncate">
                                {member.f_name} {member.l_name} ({member.email})
                              </span>
                            </div>
                          </ComboboxOption>
                        ))
                      )}
                    </ComboboxOptions>
                  </Combobox>
                )}
              />
              {errors.member_id && (
                <p className="text-red-500 text-medium mb-2 mt-1">Member is required</p>
              )}
            </div>
          </div>

          {/* Loan ID 
          
          IT MUST FETCH FROM THE LOAN ACCOUNTS HOOK ABOVE WHICH SHOWS ONLY ACTIVE ACCOUNTS OR PRE GENERATE IT
          DISPLAY ALSO IF NOT FOUND 
          
          */}
          {/* Loan ID (auto-filled based on selected member) */}
          <div className="form-control w-full mt-2">
            <label className="label text-medium mb-2 font-semibold">Loan ID or Account Number</label>
            <input
              type="text"
              {...register("loan_id")}
              value={watch("loan_id")}
              className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
              placeholder="Will be auto fetch on the most latest active loan"
              readOnly
            />
          </div>


          {/* Amount */}
          <div className="form-control w-full mt-2">
            <label className="label text-medium mb-2 font-semibold">Amount</label>
            <input
              type="number"
              {...register("amount", { required: true, min: 1 })}
              className="input input-bordered w-full"
            />
            {errors.amount && <p className="text-red-500 text-sm">Amount is required</p>}
          </div>

          {/* Payment Method */}
          <div className="form-control w-full mt-2">
            <label className="label text-medium mb-2 font-semibold">Payment Method</label>
            <select
              {...register("payment_method", { required: true })}
              className="select select-bordered w-full"
            >
              <option value="">Select method</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Bank">Bank</option>
            </select>
            {errors.payment_method && (
              <p className="text-red-500 text-sm">Payment method is required</p>
            )}
          </div>

          {/* Payment Date */}
          <div className="form-control w-full mt-2">
            <label className="label text-medium mb-2 font-semibold">Payment Date</label>
            <input
              type="date"
              {...register("payment_date", { required: true })}
              className="input input-bordered w-full"
            />
            {errors.payment_date && (
              <p className="text-red-500 text-sm">Payment date is required</p>
            )}
          </div>

          {/* Receipt No (disabled, auto-generated) */}
          <div className="form-control w-full mt-2">
            <label className="label text-medium mb-1 font-semibold">Receipt No.</label>
            <input
              type="text"
              {...register("receipt_no")}
              title='Read Only Auto Generated'
              className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
              placeholder='Will be automatically generated'
              readOnly
            />
          </div>


          {/* Payment Type */}
          <div className="form-control w-full mt-2">
            <label className="label text-medium mb-2 font-semibold">Payment Type</label>
            <select
              {...register("payment_type", { required: true })}
              className="select select-bordered w-full"
            >
              <option value="">Select type</option>
              <option value="Full">Full</option>
              <option value="Partial">Partial</option>
              <option value="Advance">Advance</option>
            </select>
            {errors.payment_type && (
              <p className="text-red-500 text-sm">Payment type is required</p>
            )}
          </div>
        </FormModal>
      </div>
    </div>
  )
}

export default CoopLoansPayments
