import { useState } from 'react'

// fetch hooks
import { useFetchLoanPayments } from '../../backend/hooks/shared/useFetchPayments';

// components
import FilterToolbar from '../shared/components/FilterToolbar';
import MainDataTable from '../treasurer/components/MainDataTable';
import FormModal from '../treasurer/modals/FormModal';

// constants
import { PAYMENT_METHOD_COLORS } from '../../constants/Color';


function MemberPayments() {

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { data: loanPaymentsData, isLoading, isError, error } = useFetchLoanPayments({ page, limit, useLoggedInMember: true });
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

    const generatedId = `${TABLE_PREFIX}_${row.payment_id}`;

    const matchesSearch =
      searchTerm === "" ||
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
          <h1 className="text-2xl font-bold" >My Loan Payments</h1>
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
                { label: "Full", value: "Full" },
                { label: "Partial", value: "Partial" },
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
          headers={["Payment Ref No.", "Loan Ref No.", "Amount", "Status", "Date", "Payment Method"]}
          data={loanPayments}
          isLoading={isLoading}
          isError={isError}
          error={error}
          page={page}
          limit={limit}
          total={total}
          setPage={setPage}
          renderRow={(row) => {

            return (
              <tr
                key={`${TABLE_PREFIX}${row?.payment_id}`}
                onClick={() => openViewModal(row)}
                className="transition-colors cursor-pointer hover:bg-base-200/70"
              >
                {/* Ref no */}
                <td className="px-4 py-4 text-center font-medium text-xs">{TABLE_PREFIX}_{row?.payment_id}</td>

                {/* Loan ID */}
                <td className="px-4 py-4 text-center font-medium text-xs">{row?.loan_ref_number || "Not Found"}</td>

                {/* Amount */}
                <td className="px-4 py-4 font-semibold text-success text-center">
                  ₱ {row?.total_amount?.toLocaleString() || "0"}
                </td>

                {/* Status */}
                <td className="px-4 py-4 font-semibold text-center">
                  <span className={`${row?.status === 'Partial' ? 'text-warning' : row?.status === 'Full' ? 'text-info' : 'text-base-content'}`}>
                    {row?.status || "Unknown"}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-4 text-center">{row?.payment_date}</td>

                {/* Method */}
                <td className="px-4 py-4 text-center">
                  {row?.payment_method ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row?.payment_method]}`}>
                      {row?.payment_method}
                    </span>
                  ) : (
                    <span> — </span>
                  )}
                </td>
              </tr>
            )
          }}
        />

        {/* View only data modal */}
        {viewPaymentData && (
          <FormModal
            table="Payment Details"
            open={true}
            close={closeViewModal}
            action={false}
            onSubmit={null}
          >
            {/* Payment Info Section */}
            <div className="bg-base-100 p-2.5 rounded-lg border border-gray-200 mb-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Schedule ID</label>
                  <div className="text-sm font-mono font-semibold">
                    #{viewPaymentData.schedule_id ? `${viewPaymentData.schedule_id}` : <span className="text-gray-400">-</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                      viewPaymentData.status === "Full"
                        ? "bg-blue-50 border border-blue-300 text-blue-800"
                        : "bg-yellow-50 border border-yellow-300 text-yellow-800"
                    }`}
                  >
                    {viewPaymentData.status}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payment Ref</label>
                  <div className="text-sm font-semibold">{TABLE_PREFIX}_{viewPaymentData.payment_id}</div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Loan Ref Number</label>
                  <div className="text-sm font-mono font-bold">{viewPaymentData.loan_ref_number}</div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payment Date</label>
                  <div className="text-sm font-semibold">{viewPaymentData.payment_date}</div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${PAYMENT_METHOD_COLORS[viewPaymentData.payment_method]}`}>
                    {viewPaymentData.payment_method}
                  </div>
                </div>
                

              </div>
            </div>

        {/* Amount Breakdown Section */}
        <div className="bg-base-100 p-3 rounded-lg border border-base-300">
          <h4 className="text-xs font-bold text-gray-600 mb-3">Payment Breakdown</h4>
          
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
          </FormModal>
        )}
      </div>
    </div>
  )
}

export default MemberPayments
