import { useState } from 'react'
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
// fetch hooks
import { useFetchLoanPayments } from '../../backend/hooks/shared/useFetchPayments';

// components
import FilterToolbar from '../shared/components/FilterToolbar';
import DataTableV2 from '../shared/components/DataTableV2';
import FormModal from '../treasurer/modals/FormModal';

// constants
import { PAYMENT_METHOD_COLORS } from '../../constants/Color';

// utils
import { useDebounce } from '../../backend/hooks/treasurer/utils/useDebounce';
import { display } from '../../constants/numericFormat';
import { createPdfReceipt } from '../treasurer/utils/receiptPDF';

function MemberPayments() {
  const { data: loanPaymentsData, isLoading, isError, error } = useFetchLoanPayments({ useLoggedInMember: true });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250); 

  const TABLE_PREFIX = "LP"; // unique ID prefix
  const loanPaymentsRaw = loanPaymentsData?.data || [];

  const loanPayments = loanPaymentsRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}_${row.payment_id}`;

    // Match search (id, status, payment type)
    const matchesSearch =
      debouncedSearch === "" ||
      row.status?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      row.receipt_no?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      row.payment_type?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      generatedId.toLowerCase().includes(debouncedSearch.toLowerCase()); // <-- ID match

      // Match filters
    const matchesStatusFilter = statusFilter === "" || row.status === statusFilter;
    const matchesPaymentMethod = paymentMethodFilter === "" || row.payment_method === paymentMethodFilter;

    const date = row.contribution_date ? new Date(row.contribution_date) : null;
    const matchesYear =
      yearFilter === "" || (date && date.getFullYear().toString() === yearFilter);

    // To avoid subtext displaying numbers instead of month names
    // I had to convert the values from the monthFilter to numbers for comparison
    const monthNameToNumber = {
      January: 1, February: 2,
      March: 3, April: 4,
      May: 5, June: 6,
      July: 7, August: 8,
      September: 9, October: 10,
      November: 11, December: 12,
    };
    const filterMonthNumber = monthFilter ? monthNameToNumber[monthFilter] : null;
    const matchesMonth =
      monthFilter === "" || (date && (date.getMonth() + 1)=== filterMonthNumber);

    return matchesSearch && matchesYear && matchesMonth && matchesPaymentMethod && matchesStatusFilter;
  });

  // Dynamically generate year options for the past 5 years including current year
  // to get rid of the hard coded years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  // just for fancy subtext in line with active filters
  const activeFiltersText = [
    debouncedSearch ? `Search: "${debouncedSearch}"` : null,
    statusFilter ? `${statusFilter}` : null,
    paymentMethodFilter ? `${paymentMethodFilter}` : null,
    yearFilter ? `${yearFilter}` : null,
    monthFilter ? `${monthFilter}` : null,
  ].
    filter(Boolean)
    .join(" - ") || "Showing all payments";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPaymentMethodFilter("");
    setYearFilter("");
    setMonthFilter("");
  };

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
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onReset={handleClearFilters}
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
                options: yearOptions
              },
              {
                label: "All Month",
                value: monthFilter,
                onChange: setMonthFilter,
                options: [
                  { label: "January", value: "January" },
                  { label: "February", value: "February" },
                  { label: "March", value: "March" },
                  { label: "April", value: "April" },
                  { label: "May", value: "May" },
                  { label: "June", value: "June" },
                  { label: "July", value: "July" },
                  { label: "August", value: "August" },
                  { label: "September", value: "September" },
                  { label: "October", value: "October" },
                  { label: "November", value: "November" },
                  { label: "December", value: "December" },
                ],
              },
            ]}
          />
        </div>

        <DataTableV2
          title={"My Loan Payments"}
          filterActive={activeFiltersText !== "Showing all payments"}
          subtext={activeFiltersText}
          showLinkPath={false}
          headers={["Payment Ref.", "Loan Ref No.", "Amount", "Status", "Date", "Payment Method"]}
          data={loanPayments}
          isLoading={isLoading}
          isError={isError}
          error={error}
          renderRow={(row) => {
            const id = row?.payment_id || "Not Found";
            const loanRefNumber = row?.loan_ref_number || "Not Found";
            const amount = row?.total_amount || 0;
            const status = row?.status || "Not Found";
            const paymentDate = row?.payment_date
              ? new Date(row.payment_date).toLocaleDateString()
              : "Not Found";
            const paymentMethod = row?.payment_method;

            return (
              <tr key={id} onDoubleClick={() => openViewModal(row)} className="text-center hover:bg-base-200/50">
                {/* Payment Ref. */}
                <td className="text-center font-medium text-xs">
                  {TABLE_PREFIX}{id}
                </td>

                {/* Loan Ref No. */}
                <td>
                  {loanRefNumber}
                </td>

                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {display(amount)}
                </td>

                {/* Status */}
                <td className="font-semibold text-info">
                  {status}
                </td>

                {/* Payment Date */}
                <td className="">
                  {paymentDate}
                </td>

                {/* Payment Method */}
                <td>
                  {paymentMethod ? (
                    <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}>
                      {paymentMethod}
                    </span>
                  ) : (
                    <span className="font-semibold">Not Found</span>
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
            onSubmit={() => {}} // just passing a dummy function to disable submit
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
            <div className="flex justify-start">
            <button 
              className="btn btn-sm btn-primary mt-3"
              onClick={() => {
                // console.log(viewPaymentData)
                createPdfReceipt(viewPaymentData);
              }}
            >
              <PictureAsPdfIcon fontSize="small" />
              Export PDF
            </button>
          </div>
          </FormModal>
        )}
      </div>
    </div>
  )
}

export default MemberPayments
