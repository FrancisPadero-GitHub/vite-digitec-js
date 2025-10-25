import {useState, useMemo} from 'react'
// import dayjs from 'dayjs';
import { Link } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { Toaster, toast } from 'react-hot-toast';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";

// fetch hooks
import { useMembers } from '../../backend/hooks/shared/useFetchMembers';
import { useFetchLoanPayments } from '../../backend/hooks/shared/useFetchPayments';
import { useFetchPaySched } from '../../backend/hooks/shared/useFetchPaySched';
import { useFetchLoanAcc } from '../../backend/hooks/shared/useFetchLoanAcc';
import { useFetchLoanAccView } from '../../backend/hooks/shared/useFetchLoanAccView';


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
  const { data: loan_acc_data } = useFetchLoanAcc({});

  const { data: loan_acc_view } = useFetchLoanAccView({});

  const { data: members_data } = useMembers();
  const members = members_data?.data || [];

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: loanPaymentsData, isLoading, isError, error } = useFetchLoanPayments(page, limit);
  const loanPaymentsRaw = loanPaymentsData?.data || [];
  const total = loanPaymentsData?.count || 0;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "LP"; // You can change this per table, this for the the unique table ID but this is not included in the database
  const loanPayments = loanPaymentsRaw.filter((row) => {
    const member = members?.find((m) => m.account_number === row.account_number);
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




    const matchesPaymentMethod =
      paymentMethodFilter === "" || row.payment_method === paymentMethodFilter;

    const date = row.contribution_date ? new Date(row.contribution_date) : null;
    const matchesYear =
      yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesYear && matchesMonth && matchesPaymentMethod;
  });

  const { mutate: mutateDelete } = useDelete('loan_payments');

  // React hook forms 
  const {mutate: addLoanPayments, isPending} = useAddLoanPayments();
  const today = new Date().toISOString().split("T")[0];

  const defaultValues = {
      payment_id: "",
      loan_id: null,
      loan_ref_number:  "", // or Account_number
      account_number: "",
      member_id: null,
      total_amount: "",
      payment_method: "",
      payment_date: today,
      // receipt_no: "",
      payment_type: "",
    }
  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    setValue,
  } = useForm({
    defaultValues
  });


  /**
   * 
   * TEMPORARY WORK AROUND
   * 
   * sets the loan_id automatically if a member is selected and has a loan acc that is active 
   */

  // Watch the dependencies
  // const payerId = watch("account_number");
  // const loanId = watch("loan_ref_number");
  // const paymentDate = watch("payment_date");

  // Compute receipt_no whenever dependencies change
  // useMemo(() => {
  //   if (loanId && payerId && paymentDate) {
  //     setValue(
  //       "receipt_no",
  //       `${loanId}-P${payerId}-D${dayjs(paymentDate).format("YYYYMMDD")}`
  //     );
  //   } else {
  //     setValue("receipt_no", "");
  //   }
  // }, [loanId, payerId, paymentDate, setValue]);



  // Modal Controls
  const [modalType, setModalType] = useState(null); // "add" | "edit" | null

  const openAddModal = () => {
    reset(defaultValues)
    setModalType("add");
  }
  
  // const openEditModal = (data) => {
  //   console.log(data)
  //   reset(data)
  //   setModalType("edit");
  // };

  const closeModal = () => {
    setModalType(null);
  };

  // View modals
  const [viewPaymentData, setViewPaymentData] = useState(null);
  const openViewModal = (data) => {
    setViewPaymentData(data);
  };
  const closeViewModal = () => {
    setViewPaymentData(null);
  };

  // Handlers
  const handleDelete = (payment_id) => {
    // console.log("Deleting Coop contribution:", payment_id);
    mutateDelete({ table: "loan_payments", column_name: "payment_id", id: payment_id });
    closeModal();
  };

  const onSubmit = (data) => {
    // addLoanPayments(data, {
    //   onSuccess: () => {
    //     toast.success("Successfully added payment")

    //     closeModal();
    //   },
    //   onError: () => {
    //     toast.error("Something went wrong ")
    //   }
    // })

    /**
     * Scans the payment schedule 
     * then structure the total_amount that fits to (fees -> interest -> principal )
     */
    console.log("TEST:", data);
  }


  // Filters member upon inputing value
  const [queryMem, setQueryMem] = useState("");
  const filteredMembers =
    queryMem === ""
      ? members
      : members.filter((m) =>
        `${m.account_number} ${m.f_name} ${m.m_name} ${m.l_name} ${m.email}`
          .toLowerCase()
          .includes(queryMem.toLowerCase())
      );

      
  // Only display loan acc base on the filteredMembers
  const loanAcc = useMemo(() => loan_acc_data?.data || [], [loan_acc_data]);

  const [queryLoan, setQueryLoan] = useState("");
  const selectedMember = members.find((m) => m.account_number === watch("account_number"));

  const filteredLoanAcc = useMemo(() => {
    //  loans that belong to the selected member
    const memberLoans = selectedMember
      ? loanAcc.filter((loan) => loan.account_number === selectedMember.account_number)
      : [];

    // search query, filter further by loan_ref_number or balance
    if (queryLoan !== "") {
      return memberLoans.filter((loan) =>
        `${loan.loan_ref_number} `
      // ${ loan.outstanding_balance } insert this beside it 
          .toLowerCase()
          .includes(queryLoan.toLowerCase())
      );
    }

    // If no query, return all loans of the selected member
    return memberLoans;
  }, [loanAcc, selectedMember, queryLoan]);


  // View the loan outstanding balance on the loan_acc_view
  const loanAccView = useMemo(() => loan_acc_view?.data || [], [loan_acc_view]) // fetch the outstandanding balance? base on the filtered member
  const selectedLoanRef = watch("loan_ref_number");

  const loanAccViewData = useMemo(() => {
    if (!selectedLoanRef) return 0;

    const record = loanAccView.find(
      (v) => v.loan_ref_number === selectedLoanRef
    );
    return record;
  }, [selectedLoanRef, loanAccView]);

  const balance = loanAccViewData?.outstanding_balance || 0;

  // View the loan payment schedule total due of monthly payments
  const loan_id = loanAccViewData?.loan_id || null;
  const { data: loan_sched } = useFetchPaySched({ loanId: loan_id});

  const loanSchedRaw = useMemo(() => loan_sched?.data || [], [loan_sched])

  // Compute monthly total — only if a member and a loan are selected
  const monthlyTotal = useMemo(() => {
    if (!selectedLoanRef || loanSchedRaw.length === 0) return 0;
    return loanSchedRaw[0]?.total_due || 0;
  }, [selectedLoanRef, loanSchedRaw]);


  const fields = [
    {
      label: "Amount",
      name: "total_amount",
      type: "number",
      autoComplete: "off",
    },
    {
      label: "Payment Method",
      name: "payment_method",
      type: "select",
      autoComplete: "off",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ],
    },
    {
      label: "Payment Date",
      name: "payment_date",
      type: "date",
      autoComplete: "off",
    },
  ];


  return (
    <div>
      <Toaster position="bottom-left"/>
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
              label: "All Method",
              value: paymentMethodFilter,
              onChange: setPaymentMethodFilter,
              options: [
                { label: "Cash", value: "Cash" },
                { label: "GCash", value: "GCash" },
                { label: "Bank", value: "Bank" },
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
          headers={["Payment Ref.", "Loan Ref No.", "Name", "Amount", "Status", "Payment Method", "Date"]}
          data={loanPayments}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {
            const matchedMember = members?.find(
              (member) => member.account_number === row.account_number // This is temporary so I don't have to create another shiz nga column .find or .filter kay kapoy HAHAHAHA
            );
            const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "System";
            return (
              <tr
                key={`${TABLE_PREFIX}${row?.payment_id}`}
                onClick={() => openViewModal(row)}
                className="transition-colors cursor-pointer hover:bg-base-200/70"
              >
                {/* Ref no */}
                <td className="px-4 py-2 text-center font-medium text-xs">{TABLE_PREFIX}_{row?.payment_id}</td>
                
                {/* Loan ID */}
                <td className="px-4 py-2 text-center">{row?.loan_ref_number || "Not Found"}</td>
                 
                 {/* Name */}
                <td className="px-4 py-4 text-center" >
                  <span className="flex items-center gap-3">
                    {/* avatar for members */}
                    <div className="avatar">
                      <div className="mask mask-circle w-10 h-10">
                        <img
                          src={
                            matchedMember?.avatar_url || `https://i.pravatar.cc/40?u=${matchedMember?.id || matchedMember?.l_name}`
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
                  ₱ {row?.total_amount?.toLocaleString() || "0"}
                </td>

                {/* Status */}
                <td className="px-4 py-2 font-semibold text-info text-center">
                  {row?.status|| "0"}
                </td>

                {/* Method */}
                <td className="px-4 py-2 text-center">
                  {row?.payment_method ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row?.payment_method]}`}>
                      {row?.payment_method}
                    </span>
                  ) : (
                    <span> — </span>
                  )}
                </td>
                {/* Date */}
                <td className="px-4 py-2 text-center">{row?.payment_date}</td>
    
              </tr>
            )}}
        />
        <FormModal
          table="Loan Payment"
          open={modalType !== null}
          close={closeModal}
          action={modalType === "edit"}
          onSubmit={handleSubmit(onSubmit)}
          status={isPending}
          deleteAction={() => handleDelete(watch("payment_id"))}
        >
            {/* Account No. */}
          <div className="form-control w-full">
            <label className="label text-sm font-semibold mb-2">Member Account</label>
            <Controller
              name="account_number"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={members.find((m) => m.account_number === field.value) || null}
                  onChange={(member) => {
                    // Store the account number for display
                    field.onChange(member?.account_number);

                    // Also store the account number directly (optional redundancy)
                    setValue("account_number", member?.account_number || "");

                    // Optional: if you want to store member_id for backend reference
                    setValue("member_id", member?.member_id || null);
                  }}
                >
                  <ComboboxInput
                    required
                    className="input input-bordered w-full"
                    placeholder="Search by Account Number or Name..."
                    displayValue={(member) => (member ? member.account_number : "")}
                    onChange={(e) => setQueryMem(e.target.value)}
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
          {/* Loan Ref No */}
          <div className="form-control w-full">
            <label className="label text-sm font-semibold mb-2">Loan Account</label>
            <Controller
              name="loan_ref_number"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={loanAcc.find((loan) => loan.loan_ref_number === field.value) || null}
                  onChange={(loan) => {
                    // Update both reference and ID
                    field.onChange(loan?.loan_ref_number);
                    setValue("loan_ref_number", loan?.loan_ref_number || "");
                    setValue("loan_id", loan?.loan_id || null);

                    // If needed, link account_number to the selected loan automatically
                    setValue("account_number", loan?.account_number || "");
                  }}
                >
                  <ComboboxInput
                    required
                    className="input input-bordered w-full"
                    placeholder="Search by Loan Reference or Balance..."
                    displayValue={(loan) => (loan ? loan.loan_ref_number : "")}
                    onChange={(e) => setQueryLoan(e.target.value)}
                  />
                  <ComboboxOptions className="absolute z-[800] w-[93%] mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                    {filteredLoanAcc.length === 0 ? (
                      <div className="px-4 py-2 text-base-content/60">No loan accounts found.</div>
                    ) : (
                      filteredLoanAcc.map((loan) => (
                        <ComboboxOption
                          key={loan.loan_ref_number}
                          value={loan}
                          className={({ focus }) =>
                            `px-4 py-2 cursor-pointer transition-colors duration-150 ${focus ? "bg-primary text-primary-content" : "hover:bg-base-200"
                            }`
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm">{loan.loan_ref_number}</span>

                            {/* <div className="flex items-center gap-2">
                              <span className="text-sm">Outstanding Balance:</span>
                              <span className="truncate text-sm font-semibold">
                                ₱{Number(loan.outstanding_balance).toLocaleString()}
                              </span>
                              
                            </div> */}
                          </div>
                        </ComboboxOption>

                      ))
                    )}
                  </ComboboxOptions>
                </Combobox>
              )}
            />
          </div>

          {/* Outstanding Balance and monthly payment total Display */}
          <div className="form-control w-full mt-2 mb-2 flex justify-between">
            <div>
              <label className="label text-sm font-semibold mb-2">Monthly Payment</label>
              <div className="flex items-center font-semibold">
                <span className='text-info'>₱ {Number(monthlyTotal).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-right">
              <label className="label text-sm font-semibold mb-2">Outstanding Balance</label>
              <div className="flex justify-end items-center font-semibold">
                <span className='text-warning'>₱ {Number(balance).toLocaleString()}</span>
                <span className="text-sm text-gray-500 ml-2">remaining</span>
              </div>
            </div>
          </div>

          {fields.map(({ label, name, type, options, autoComplete }) => (
            <div key={name} className="form-control w-full mt-2">
              <label htmlFor={name}>
                <span className="label text-sm font-semibold mb-2">{label}</span>
              </label>

              {name === "total_amount" ? (
                <Controller
                  name="total_amount"
                  control={control}
                  rules={{
                    required: true,
                    validate: (value) => {
                      if (value <= 0) return "Amount cannot be zero or negative";
                      if (value > monthlyTotal)
                        return `Amount cannot exceed monthly total payment of ₱${Number(monthlyTotal).toLocaleString()} (TEMPORARY)`;
                      if (value > balance)
                        return `Amount cannot exceed outstanding balance of ₱${Number(balance).toLocaleString()}`;
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input
                        id="total_amount"
                        type="number"
                        autoComplete="off"
                        value={field.value}
                        placeholder="Enter Amount"
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            field.onChange("");
                            return;
                          }
                          const value = Number(raw);
                          field.onChange(value < 0 ? 0 : value);
                        }}
                        className={`input input-bordered w-full ${error ? "input-error" : ""}`}
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
              ) : type === "readonly" ? (
                <input
                  id={name}
                  type="text"
                  {...register(name)}
                  readOnly
                  title="Auto Generated"
                  placeholder="Will be auto-generated"
                  className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
                />
              ) : (
                <input
                  id={name}
                  type={type}
                  autoComplete={autoComplete}
                  {...register(name, { required: true })}
                  className="input input-bordered w-full"
                />
              )}
            </div>
          ))}
        </FormModal>
         

         {/* View only data modal */}
        {viewPaymentData && (
          <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50">
            <div className="bg-base-100 p-6 rounded-lg w-96">
              <h2 className="text-lg font-bold mb-4">Payment Details</h2>

              <div className="space-y-2">
                <div><span className="font-semibold">Account Number:</span> {viewPaymentData.account_number}</div>
                <div><span className="font-semibold">Loan Ref Number:</span> {viewPaymentData.loan_ref_number}</div>
                <div><span className="font-semibold">Payment Date:</span> {viewPaymentData.payment_date}</div>
                <div><span className="font-semibold">Payment Method:</span> {viewPaymentData.payment_method}</div>
                <div><span className="font-semibold">Principal:</span> ₱ {viewPaymentData.principal.toLocaleString()}</div>
                <div><span className="font-semibold">Interest:</span> ₱ {viewPaymentData.interest.toLocaleString()}</div>
                <div><span className="font-semibold">Fees:</span> ₱ {viewPaymentData.fees.toLocaleString()}</div>
                <div><span className="font-semibold">Total Amount:</span> ₱ {viewPaymentData.total_amount.toLocaleString()}</div>
                <div><span className="font-semibold">Status:</span> {viewPaymentData.status}</div>
                <div><span className="font-semibold">Schedule ID:</span> {viewPaymentData.schedule_id}</div>
              </div>

              <div className="mt-4 text-right">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default CoopLoansPayments
