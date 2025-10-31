import {useState} from 'react'

// fetch hooks
import { useMembers } from '../../backend/hooks/shared/useFetchMembers';
import { useFetchLoanPayments } from '../../backend/hooks/shared/useFetchPayments';

// mutation hooks

// components
import FilterToolbar from '../shared/components/FilterToolbar';
import MainDataTable from '../treasurer/components/MainDataTable';
import FormModal from '../treasurer/modals/FormModal';

// constants
import { PAYMENT_METHOD_COLORS } from '../../constants/Color';


function LoansPayments() {
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
      ? `${member.f_name} ${member.m_name} ${member.l_name} ${member.email}`.toLowerCase()
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


  // View modals
  const [viewPaymentData, setViewPaymentData] = useState(null);
  const openViewModal = (data) => {
    setViewPaymentData(data);
  };
  const closeViewModal = () => {
    setViewPaymentData(null);
  };

     

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold" >Member Loan Payments</h1>
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

        {/* View only data modal */}
        {viewPaymentData && (
          <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
                Payment Details
              </h2>

              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="font-medium">Account Number:</span>
                  <span>{viewPaymentData.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Loan Ref Number:</span>
                  <span>{viewPaymentData.loan_ref_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Date:</span>
                  <span>{viewPaymentData.payment_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Method:</span>
                  <span>{viewPaymentData.payment_method}</span>
                </div>
                <hr className="border-gray-300 dark:border-gray-700 my-2" />
                <div className="flex justify-between">
                  <span className="font-medium">Principal:</span>
                  <span>₱ {viewPaymentData.principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Interest:</span>
                  <span>₱ {viewPaymentData.interest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fees:</span>
                  <span>₱ {viewPaymentData.fees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white mt-2">
                  <span>Total Amount:</span>
                  <span>₱ {viewPaymentData.total_amount.toLocaleString()}</span>
                </div>
                <hr className="border-gray-300 dark:border-gray-700 my-2" />
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${viewPaymentData.status === "PAID"
                      ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                      }`}
                  >
                    {viewPaymentData.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Schedule ID:</span>
                  <span>{viewPaymentData.schedule_id}</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={closeViewModal}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all duration-200"
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

export default LoansPayments
