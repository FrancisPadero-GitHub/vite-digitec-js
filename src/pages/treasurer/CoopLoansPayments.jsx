import {useState, useMemo} from 'react'
import dayjs from 'dayjs';
import { createPortal } from 'react-dom';
import WarningIcon from '@mui/icons-material/Warning';

import { useForm, Controller } from 'react-hook-form';
import { Toaster, toast } from 'react-hot-toast';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from "@headlessui/react";

// fetch hooks
import { useMembers } from '../../backend/hooks/shared/useFetchMembers';
import { useFetchLoanPayments } from '../../backend/hooks/shared/useFetchPayments';
import { useFetchPaySched } from '../../backend/hooks/shared/useFetchPaySched';
import { useFetchLoanAccView } from '../../backend/hooks/shared/useFetchLoanAccView';


// mutation hooks
import { useDeletePayment } from '../../backend/hooks/treasurer/useDeletePayment';
import { useAddLoanPayments } from '../../backend/hooks/treasurer/useAddPayments';
import { useEditLoanPayments } from '../../backend/hooks/treasurer/useEditPayments';


// components
import FilterToolbar from '../shared/components/FilterToolbar';
import MainDataTable from './components/MainDataTable';
import FormModal from './modals/FormModal';

// constants
import { PAYMENT_METHOD_COLORS } from '../../constants/Color';
import defaultAvatar from '../../assets/placeholder-avatar.png';

function CoopLoansPayments() {
  const placeHolderAvatar = defaultAvatar;
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
  const { data: loan_acc_view } = useFetchLoanAccView({});

  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];
   
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: loanPaymentsData, isLoading, isError, error } = useFetchLoanPayments({page, limit});
  const loanPaymentsRaw = loanPaymentsData?.data || [];
  const total = loanPaymentsData?.count || 0;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(""); // for the search bar
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const TABLE_PREFIX = "LP"; // You can change this per table, this for the the unique table ID but this is not included in the database
  const loanPayments = loanPaymentsRaw.filter((row) => {
    const member = members?.find((m) => m.account_number === row.account_number);
    const fullName = member
      ? `${member.f_name} ${member.l_name} ${member.email}`.toLowerCase()
      : "";

    const generatedId = `${TABLE_PREFIX}_${row.payment_id}`;

    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      row.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.receipt_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.payment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      generatedId.toLowerCase().includes(searchTerm.toLowerCase()); // <-- ID match

    const statusPaymentFilter =
      statusFilter === "" || row.status === statusFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === "" || row.payment_method === paymentMethodFilter;

    const date = row.contribution_date ? new Date(row.contribution_date) : null;
    const matchesYear =
      yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1).toString() === monthFilter);

    return matchesSearch && matchesYear && matchesMonth && matchesPaymentMethod && statusPaymentFilter;
  });

  const { mutate: mutateDelete } = useDeletePayment('loan_payments');

  // React hook forms 
  const {mutate: addLoanPayments, isPending: isAddPending} = useAddLoanPayments();
  const {mutate: editLoanPayments, isPending: isEditPending} = useEditLoanPayments();
  
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

      // non-db values just for the front end 
      sched_id: "",
      outstanding_balance: "",
      status: "",

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

  // RECEIPT NO GENERATOR
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
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  const openAddModal = () => {
    reset(defaultValues)
    setModalType("add");
  }
  
  const closeModal = () => {
    setModalType(null);
  };

  // View modals
  const [viewPaymentData, setViewPaymentData] = useState(null);
  const [showEditModal, setEditModal] = useState(false);  // receives a conditional to be opened or not base on loan acc

  const openViewModal = (data) => {
    setViewPaymentData(data); // sets the data
    // Fetch the loan account details based on the selected payment data
    const selectedLoan = loanAcc.find(
      (loan) => loan.loan_ref_number === data.loan_ref_number
    );
    
    // Hide the modal if the loan is not active
    setEditModal(selectedLoan?.status === "Active" ? true : false);

  };

  const editModal = () => { 
    if (!viewPaymentData) return;

    // Fetch the loan account details based on the selected payment data
    const selectedLoan = loanAcc.find(
      (loan) => loan.loan_ref_number === viewPaymentData.loan_ref_number
    );

    // Populate the form fields with the loan account details
    reset({
      ...viewPaymentData,
      loan_id: selectedLoan?.loan_id || null,
      outstanding_balance: selectedLoan?.outstanding_balance || 0,
      status: selectedLoan?.status || "",
    });

    closeViewModal();
    setModalType("edit");
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
  const [pendingPaymentData, setPendingPaymentData] = useState(null);

  // On form submit (opens confirmation)
  const handlePaymentSubmit = (data) => {
    setPendingPaymentData(data);
    setShowPaymentConfirm(true);
  };
  
  // On confirm button
  const confirmPayment = () => {
    if (!pendingPaymentData) return;

    if (modalType === "add") {
      addLoanPayments(pendingPaymentData, {
        onSuccess: () => {
          toast.success("Successfully added payment");
          setShowPaymentConfirm(false);
          setPendingPaymentData(null);
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong");
          setShowPaymentConfirm(false);
        },
      });
    } else if (modalType === "edit") { 
      editLoanPayments(pendingPaymentData, {
        onSuccess: () => {
          toast.success("Successfully edited payment");
          setShowPaymentConfirm(false);
          setPendingPaymentData(null);
          closeModal();
        },
        onError: () => {
          toast.error("Something went wrong");
          setShowPaymentConfirm(false);
        },
      });
    }

  };
  
  /**
   * MEMBERS FILTER
   */
  const [queryMem, setQueryMem] = useState("");
  // This is used for the search query on the form
  const filteredMembers =
    queryMem === ""
      ? members
      : members.filter((m) =>
        `${m.account_number} ${m.f_name} ${m.l_name}`
          .toLowerCase()     
          .includes(queryMem.toLowerCase())
      );


  /**
   * LOAN ACC FILTER
   */
  const [queryLoan, setQueryLoan] = useState("");
  const loanAcc = useMemo(() => {
    const data = loan_acc_view?.data || [];                     // Uses the view table version instead of the base table
    return data.filter((loan) => loan.status === "Active");     // Filter to only Active loan accounts
  }, [loan_acc_view]);
  
  // Get the account number of the selected member
  const selectedMember = members.find((m) => m.account_number === watch("account_number"));

  // Then filter the active loan accs base on the selectedMember
  const filteredLoanAcc = useMemo(() => {
    const data = selectedMember
      ? loanAcc.filter((loan) => loan.account_number === selectedMember.account_number)
      : [];

    // Then this is used for the search query on the form
    if (queryLoan !== "") {
      return data.filter((loan) =>
        `${loan.loan_ref_number} ${loan.loan_id}`      // You can add columns here that you wanna search
          .toLowerCase()
          .includes(queryLoan.toLowerCase())
      );
    }

    // If no query, return all loans of the selected member
    return data;
  }, [loanAcc, selectedMember, queryLoan]);


  // fetch the outstandanding balance base on the filtered member
  const selectedLoanRef = watch("loan_ref_number");

  const loanAccViewData = useMemo(() => {
    if (!selectedLoanRef) return 0;

    const data = loanAcc.find(
      (v) => v.loan_ref_number === selectedLoanRef
    );
    return data;
  }, [selectedLoanRef, loanAcc]);

  const balance = loanAccViewData?.outstanding_balance || 0;
  const loan_id = loanAccViewData?.loan_id || null;



  /**
   * LOAN PAYMENT SCHEDULE FILTER
   */
  // View the loan payment schedule total due of monthly payments
  const { data: loan_sched } = useFetchPaySched({ loanId: loan_id});    // If this returns a null it wont return any schedules
  const loanSchedRaw = useMemo(() => loan_sched?.data || [], [loan_sched])

  // Get the current or next payment schedule dynamically
  const paymentSchedule = useMemo(() => {
    if (!selectedLoanRef || loanSchedRaw.length === 0) return { schedule: null };

    // const today = dayjs();

    const unpaidSchedules = loanSchedRaw
      .filter(item => !item.paid)
      .sort((a, b) => dayjs(a.due_date).diff(dayjs(b.due_date)));

    if (unpaidSchedules.length === 0) return { schedule: null };

    // Return the first unpaid schedule (earliest due)
    return unpaidSchedules[0];
  }, [selectedLoanRef, loanSchedRaw]);


  // Variables extracted values on this is tied to the conditional inside which is either today month or next due
  const schedId = paymentSchedule?.schedule_id || null;
  const totalDue = paymentSchedule?.total_due || 0;
  const feeDue = paymentSchedule?.fee_due || 0;
  const amountPaid = paymentSchedule?.amount_paid || 0;
  const paymentStatus = paymentSchedule?.status || "";
  const dueDate = paymentSchedule?.due_date || null;
  const mosOverdue = paymentSchedule?.mos_overdue || 0;


  // Only log when we have actual data (when a loan is selected)
  // if (selectedLoanRef && paymentSchedule) {
  //   console.log(`Total Due`, totalDue);
  // }

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
            <button
              className="btn btn-neutral whitespace-nowrap"
              onClick={openAddModal}

            >
              + Add Payments
            </button>
          </div>
        </div>

        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dropdowns={[
            {
              label: "All Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: "Full", value: "full" },
                { label: "Partial", value: "partial" },
              ],
            },
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
                            matchedMember?.avatar_url || placeHolderAvatar
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
          onSubmit={handleSubmit(handlePaymentSubmit)} // <-- this now stores data
          isPending={isAddPending || isEditPending}
          status={isAddPending || isEditPending}
          deleteAction={() => handleDelete(watch("payment_id"))}
        >
          {/* ACCOUNT SELECTION */}
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 mb-3">
            <h4 className="text-xs font-bold text-gray-600 mb-2">Account Selection</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Member Account */}
              <div className="form-control w-full">
                <label className="label text-xs font-medium text-gray-600 mb-1">Member Account</label>
                <Controller
                name="account_number"
                control={control}
                render={({ field }) => (
                  <Combobox
                    value={members.find((m) => m.account_number === field.value) || null}
                    onChange={(member) => {
                      field.onChange(member?.account_number);
                      setValue("account_number", member?.account_number || "");
                      setValue("member_id", member?.member_id || null);
                      setValue("loan_ref_number", "");
                      setValue("loan_id", null);
                    }}
                  >
                  <ComboboxInput
                    required
                    className="input input-sm input-bordered w-full"
                    placeholder="Search by Account Number or Name..."
                    displayValue={(member) => 
                      member ? `${member.account_number} - ${member.f_name} ${member.l_name}`.trim() : ""
                    }
                    onChange={(e) => setQueryMem(e.target.value)}
                  />

                  {/* Search option dropdown: account number, avatar, member name, role */}
                  <ComboboxOptions className="absolute z-[800] w-[93%] mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                    {filteredMembers.length === 0 ? (
                      <div className="px-4 py-2 text-base-content/60">No members found.</div>
                    ) : (
                      filteredMembers.map((member) => (
                        <ComboboxOption
                          key={member.account_number}
                          value={member}
                          className={({ focus }) =>
                          `px-4 py-2 cursor-pointer transition-colors duration-150 ${focus ? "bg-primary/90 text-primary-content" : ""}`
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="mask mask-circle w-10 h-10">
                                <img
                                  src={member.avatar_url || `https://i.pravatar.cc/40?u=${member.member_id || member.l_name}`}
                                  alt={`${member.f_name} ${member.l_name}`}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-mono text-sm font-semibold">{member.account_number}</span>
                              <div className="flex items-center gap-1">
                              <span className="text-sm truncate">{member.f_name} {member.l_name}</span>
                              <span className="text-xs italic">({member.account_role})</span>
                              </div>
                            </div>
                          </div>
                        </ComboboxOption>
                      ))
                    )}
                  </ComboboxOptions>
                  </Combobox>
                )}
              />
              </div>

              {/* Loan Account */}
              <div className="form-control w-full">
                <label className="label text-xs font-medium text-gray-600 mb-1">Loan Account</label>
                  <Controller
                    name="loan_ref_number"
                    control={control}
                    render={({ field }) => {
                    const selectedAccount = watch("account_number");
                    const selectedMember = members.find(m => m.account_number === selectedAccount);

                    return (
                      <Combobox
                        value={filteredLoanAcc.find((loan) => loan.loan_ref_number === field.value) || null}
                        onChange={(loan) => {
                          field.onChange(loan?.loan_ref_number);
                          setValue("loan_ref_number", loan?.loan_ref_number || "");
                          setValue("loan_id", loan?.loan_id || null);
                        }}
                        disabled={!selectedAccount}
                      >
                        <ComboboxInput
                          required
                          className="input input-sm input-bordered w-full disabled:bg-base-200"
                          placeholder={selectedAccount ? `Search loan account (e.g., LAPP-12345)` : "Select a member first"}
                          displayValue={(loan) => loan?.loan_ref_number || ""}
                          onChange={(e) => setQueryLoan(e.target.value)}
                        />
                        <ComboboxOptions className="absolute z-[800] w-[93%] mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                          {filteredLoanAcc.length === 0 ? (
                            <div className="px-4 py-2 text-base-content/60">
                              {selectedAccount ? "No loan accounts found for this member." : "Select a member first."}
                            </div>
                          ) : (
                            filteredLoanAcc.map((loan) => (
                              <ComboboxOption
                                key={loan.loan_ref_number}
                                value={loan}
                                className={({ focus }) =>
                                  `px-4 py-2 cursor-pointer transition-colors duration-150 ${
                                    focus ? "bg-primary text-primary-content" : "hover:bg-base-200"
                                  }`
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-sm font-semibold">{loan.loan_ref_number}</span>
                                  <span className="text-xs text-base-content/60">
                                    {selectedMember && `${selectedMember.f_name} ${selectedMember.l_name}`}
                                  </span>
                                </div>
                              </ComboboxOption>
                            ))
                          )}
                        </ComboboxOptions>
                      </Combobox>
                      );
                    }}
                  />
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          <div className="bg-white p-2.5 rounded-lg border border-gray-200 mb-3">
            <h4 className="text-xs font-bold text-gray-600 mb-2">Payment Details</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Schedule ID</label>
                <div className="text-sm font-mono font-bold">{schedId ? `#${schedId}` : <span className="text-gray-400">-</span>}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                <div className="text-sm font-semibold">{dueDate || <span className="text-gray-400">-</span>}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                {paymentStatus ? (
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold
                    ${paymentStatus === "OVERDUE"
                      ? "bg-red-50 border-red-300 text-red-800"
                      : paymentStatus === "PARTIALLY PAID"
                      ? "bg-blue-50 border-blue-300 text-blue-800"
                      : "bg-gray-50 border-gray-300 text-gray-700"
                    }`}>
                    <span className={paymentStatus === "OVERDUE" ? "text-red-600" : "text-gray-500"}>●</span>
                    {paymentStatus}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Outstanding Balance</label>
                <div className="text-sm font-bold text-amber-700">
                  {balance ? `₱${Number(balance).toLocaleString()}` : <span className="text-gray-400">-</span>}
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2.5 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Amount</label>
                <div className="px-2 py-1.5 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm font-bold text-blue-900">₱{round(totalDue - feeDue).toLocaleString()}</div>
                </div>
              </div>

              {/* If OVERDUE, show months and penalties */}
              {paymentStatus === "OVERDUE" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Overdue</label>
                    <div className="px-2 py-1.5 bg-red-50 rounded border border-red-200">
                      <div className="text-sm font-bold text-red-900">{mosOverdue.toLocaleString()} mos</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Penalty</label>
                    <div className="px-2 py-1.5 bg-red-50 rounded border border-red-200">
                      <div className="text-sm font-bold text-red-900">₱{round(feeDue).toLocaleString()}</div>
                    </div>
                  </div>
                </>
              )}

              {/* For PARTIALLY PAID */}
              {paymentStatus === "PARTIALLY PAID" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Already Paid</label>
                  <div className="px-2 py-1.5 bg-blue-50 rounded border border-blue-200">
                    <div className="text-sm font-bold text-blue-900">₱{round(amountPaid).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {/* Total Payable */}
              <div className={paymentStatus === "OVERDUE" || paymentStatus === "PARTIALLY PAID" ? "" : "md:col-span-2"}>
                <label className="block text-xs font-medium text-gray-500 mb-1">Total Payable</label>
                <div className="px-2 py-1.5 bg-green-50 rounded border-2 border-green-400">
                  <div className="text-base font-bold text-green-900">₱{round(totalDue - amountPaid).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT FORM */}
          <div className="bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-gray-600 mb-2">Enter Payment</h4>
            
            {fields.map(({ label, name, type, options, autoComplete }) => (
              <div key={name} className="form-control w-full mb-1.5 overflow-visible relative">
                <label htmlFor={name} className="label text-xs font-medium text-gray-600">{label}</label>

                {name === "total_amount" ? (
                  <Controller
                    name="total_amount"
                    control={control}
                    rules={{
                      required: true,
                      validate: (value) => {
                        if (value <= 0) return "Amount cannot be zero or negative";
                        const minRequiredAmount = totalDue * 0.3; // Require minimum 30% of monthly due
                        if (value < minRequiredAmount)
                          return `Amount must be at least 30% of monthly payment (₱${round(minRequiredAmount).toLocaleString()})`;
                        if (value > totalDue)
                          return `Amount cannot exceed monthly total payment of ₱${round(totalDue).toLocaleString()}`;
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
                          placeholder="Enter Payment Amount" //AMOUNT LIMIT TO BE ADDED
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {field.onChange("");return;}
                            const value = Number(raw);
                            field.onChange(value < 0 ? 0 : value);
                          }}
                          className={`input input-bordered w-full font-bold ${error ? "input-error border-red-400" : "border-green-400 focus:border-green-600"}`}
                        />
                        {error && (
                          <span className="text-xs text-error mt-1 block">{error.message}</span>
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
                    defaultValue=""
                  >
                    <option value="" disabled>Select {label}</option>
                    {options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                    className="input input-bordered w-full bg-gray-100 cursor-not-allowed text-gray-500"
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
          </div>
        </FormModal>

        {/* Payment Confirmation Modal */}
        {showPaymentConfirm && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-[28rem] max-w-[90vw]">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <WarningIcon className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">
                    {modalType === "edit" ? "Confirm Payment Modification" : "Confirm Payment Submission"}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {modalType === "edit" 
                      ? "You are about to modify an existing payment record. This action will update the payment schedules and recalculate loan balances. All changes will be logged for audit purposes and cannot be undone." 
                      : "You are about to process a new loan payment. Please verify all details are correct as this transaction will immediately update the borrower's payment schedule and outstanding balance. This action cannot be reversed once submitted."}
                  </p>
                  {pendingPaymentData && (
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <h4 className="text-xs font-bold text-gray-700 mb-2">Payment Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-500 mr-2">Amount: </span> <span className="font-bold text-success">₱ {Number(pendingPaymentData.total_amount).toLocaleString()}</span></div>
                        <div><span className="text-gray-500 mr-1">Method: </span> <span className="font-semibold">{pendingPaymentData.payment_method}</span></div>
                        <div><span className="text-gray-500 mr-1">Date: </span> <span className="font-semibold">{dayjs(pendingPaymentData.payment_date).format('MM/DD/YYYY')}</span></div>
                        <div><span className="text-gray-500 mr-1">Loan Ref: </span> <span className="font-semibold">{pendingPaymentData.loan_ref_number}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPaymentConfirm(false)}
                >
                  Go Back
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white shadow-sm cursor-pointer"
                  onClick={confirmPayment}
                  disabled={isAddPending || isEditPending}
                >
                  {isAddPending || isEditPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      {modalType === "edit" ? "Updating Payment..." : "Processing Payment..."}
                    </>
                  ) : (
                    modalType === "edit" ? "Confirm Payment Update" : "Process Payment"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
         

      {/* View Payment Details Modal */}
      {viewPaymentData && (
        <dialog open className="modal">
          <div className="modal-box w-11/12 max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold">Payment Details</h3>
              <div className={`badge badge-lg font-semibold ${
                viewPaymentData.status === "PAID" ? "badge-success" : "badge-info"
              }`}>
                {viewPaymentData.status}
              </div>
            </div>

            {/* Account Info Section */}
            <div className="bg-base-200 p-3 rounded-lg mb-3">
              <h4 className="text-xs font-bold text-gray-600 mb-2">Account Information</h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Account Number</label>
                  <div className="text-sm font-semibold">{viewPaymentData.account_number}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Loan Ref Number</label>
                  <div className="text-sm font-mono font-bold">{viewPaymentData.loan_ref_number}</div>
                </div>
              </div>
            </div>

            {/* Payment Info Section */}
            <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
              <h4 className="text-xs font-bold text-gray-600 mb-2">Payment Information</h4>
              <div className="grid grid-cols-4 gap-2.5 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Schedule ID</label>
                  <div className="text-sm font-mono font-bold">#{viewPaymentData.schedule_id}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payment ID</label>
                  <div className="text-sm font-mono font-bold">LP_{viewPaymentData.payment_id}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payment Date</label>
                  <div className="text-sm font-semibold">{dayjs(viewPaymentData.payment_date).format('MM/DD/YYYY')}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
                  <div className="text-sm font-semibold">{viewPaymentData.payment_method}</div>
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
              <h4 className="text-xs font-bold text-gray-600 mb-2">Payment Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Principal</span>
                  <div className="px-2 py-1 bg-blue-50 rounded border border-blue-200">
                    <span className="text-sm font-bold text-blue-900">₱{viewPaymentData.principal.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Interest</span>
                  <div className="px-2 py-1 bg-purple-50 rounded border border-purple-200">
                    <span className="text-sm font-bold text-purple-900">₱{viewPaymentData.interest.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fees</span>
                  <div className="px-2 py-1 bg-amber-50 rounded border border-amber-200">
                    <span className="text-sm font-bold text-amber-900">₱{viewPaymentData.fees.toLocaleString()}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-base-300">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold">Total Amount</span>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-400">
                      <span className="text-lg font-bold text-green-900">₱{viewPaymentData.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className='flex justify-between' >
                <div className="modal-action">
                  {showEditModal && (<button onClick={editModal} className="btn btn-primary">Edit</button>)}
                </div>
                <div className="modal-action">
                  <button onClick={closeViewModal} className="btn btn-primary">Close</button>
                </div>
            </div>

          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeViewModal}><button>close</button></form>
        </dialog>
      )}
      </div>
    </div>
  )
}

export default CoopLoansPayments
