import { useState, useMemo } from "react";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
// fetch hooks
import { useFetchLoanPayments } from "../../backend/hooks/shared/useFetchPayments";
import { useFetchProfile } from "../../backend/hooks/member/useFetchProfile";
import { useFetchCoop } from "../../backend/hooks/shared/useFetchCoop";

// components
import FilterToolbar from "../shared/components/FilterToolbar";
import DataTableV2 from "../shared/components/DataTableV2";
import ReceiptModal from "../treasurer/modals/ReceiptModal";

// constants
import { PAYMENT_METHOD_COLORS } from "../../constants/Color";

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";
import { display } from "../../constants/numericFormat";
import getYearsMonthsDaysDifference from "../../constants/DateCalculation";

// Restriction
import useLoanRestriction from "../../backend/hooks/member/utils/useRestriction";

function MemberPayments() {
  const { hasRestriction, requirements } = useLoanRestriction();

  const { data: myProfile } = useFetchProfile();
  const memberInfo = myProfile || {};

  const { data: coopData } = useFetchCoop({ useLoggedInMember: true });
  const coopContributions = coopData?.data || [];

  // Calculate total share capital
  const totalShareCapital = useMemo(
    () =>
      coopContributions.reduce(
        (sum, contrib) => sum + (contrib.amount || 0),
        0
      ),
    [coopContributions]
  );

  const {
    data: loanPaymentsData,
    isLoading,
    isError,
    error,
  } = useFetchLoanPayments({ useLoggedInMember: true });

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
    const matchesStatusFilter =
      statusFilter === "" || row.status === statusFilter;
    const matchesPaymentMethod =
      paymentMethodFilter === "" || row.payment_method === paymentMethodFilter;

    const date = row.payment_date ? new Date(row.payment_date) : null;
    const matchesYear =
      yearFilter === "" ||
      (date && date.getFullYear().toString() === yearFilter);

    // To avoid subtext displaying numbers instead of month names
    // I had to convert the values from the monthFilter to numbers for comparison
    const monthNameToNumber = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };
    const filterMonthNumber = monthFilter
      ? monthNameToNumber[monthFilter]
      : null;
    const matchesMonth =
      monthFilter === "" || (date && date.getMonth() + 1 === filterMonthNumber);

    return (
      matchesSearch &&
      matchesYear &&
      matchesMonth &&
      matchesPaymentMethod &&
      matchesStatusFilter
    );
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
  const activeFiltersText =
    [
      debouncedSearch ? `Search: "${debouncedSearch}"` : null,
      statusFilter ? `${statusFilter}` : null,
      paymentMethodFilter ? `${paymentMethodFilter}` : null,
      yearFilter ? `${yearFilter}` : null,
      monthFilter ? `${monthFilter}` : null,
    ]
      .filter(Boolean)
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

  const [showReceipt, setShowReceipt] = useState(false);

  if (hasRestriction) {
    // Membership duration
    const { years: tenure } = getYearsMonthsDaysDifference(
      memberInfo?.joined_date
    );
    // Age
    const { years: memberAge } = getYearsMonthsDaysDifference(
      memberInfo?.birthday
    );

    const eligibilityInfo = [
      {
        label: "Tenure",
        value: `${tenure} ${tenure > 1 ? "years" : "year"}`,
        passed: tenure >= requirements.minTenure,
        rule: `${requirements.minTenure} ${requirements.minTenure > 1 ? "years" : "year"} required`,
      },
      {
        label: "Age",
        value: `${memberAge} ${memberAge > 1 ? "years" : "year"} old`,
        passed: memberAge >= requirements.minAge,
        rule: `${requirements.minAge} years minimum`,
      },
      {
        label: "Share Capital",
        value: `₱${totalShareCapital.toLocaleString()}`,
        passed: totalShareCapital >= requirements.minShareCapital,
        rule: `₱${requirements.minShareCapital.toLocaleString()} minimum`,
      },
    ];
    return (
      <div className="flex items-start justify-center py-8 min-h-screen px-4">
        <div className="w-full mx-0 sm:mx-6 max-w-3xl p-3 sm:p-4 md:p-6 text-center bg-red-50 rounded-xl border border-red-200 shadow-sm">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-red-600">
            You are not eligible for loan applications
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 mt-2">
            Please contact the administrator or board members for assistance.
          </p>
          {/* Loan Eligibility display here */}
          <div className="mt-4 sm:mt-6 w-full max-w-2xl mx-auto text-left">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3">
                Eligibility Requirements
              </h3>
              <ul className="text-xs sm:text-sm space-y-2 sm:space-y-3">
                {eligibilityInfo.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 pb-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          item.passed ? "text-green-600" : "text-red-600"
                        }
                      >
                        {item.passed ? "✔️" : "❌"}
                      </span>
                      <span className="font-medium">{item.label}:</span>
                      <span
                        className={`font-semibold ${item.passed ? "text-green-700" : "text-red-700"}`}
                      >
                        {item.value}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 sm:ml-auto">
                      ({item.rule})
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 sm:mt-4 text-center">
                {eligibilityInfo.every((item) => item.passed) ? (
                  <span className="badge badge-success text-xs sm:text-sm">
                    Eligible
                  </span>
                ) : (
                  <span className="badge badge-error text-xs sm:text-sm">
                    Not Eligible
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-3">
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
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
                  { label: "Paid", value: "PAID" },
                  { label: "Partial", value: "PARTIAL" },
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
                options: yearOptions,
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
          headers={[
            "Payment Ref.",
            "Loan Ref No.",
            "Amount",
            "Status",
            "Date",
            "Payment Method",
          ]}
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
              <tr
                key={id}
                onClick={() => openViewModal(row)}
                className="text-center hover:bg-base-200/50"
              >
                {/* Payment Ref. */}
                <td className="text-center font-medium text-xs">
                  {TABLE_PREFIX}_{id}
                </td>

                {/* Loan Ref No. */}
                <td>{loanRefNumber}</td>

                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {display(amount)}
                </td>

                {/* Status */}
                <td className="font-semibold text-info">{status}</td>

                {/* Payment Date */}
                <td className="">{paymentDate}</td>

                {/* Payment Method */}
                <td>
                  {paymentMethod ? (
                    <span
                      className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}
                    >
                      {paymentMethod}
                    </span>
                  ) : (
                    <span className="font-semibold">Not Found</span>
                  )}
                </td>
              </tr>
            );
          }}
        />

        <ReceiptModal
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          payment={viewPaymentData}
        />

        {/* View only data modal */}
        {viewPaymentData && (
          <dialog open className="modal overflow-hidden">
            <div className="modal-box max-w-sm md:max-w-2xl w-full flex flex-col max-h-2xl">
              {/* Fixed Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-bold">Payment Details</h3>
                <div
                  className={`badge badge-lg font-semibold ${
                    viewPaymentData.status === "Full"
                      ? "badge-info"
                      : "badge-warning"
                  }`}
                >
                  {viewPaymentData.status}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto overflow-x-hidden flex-1 pr-2">
                {/* Payment Info Section */}
                <div className="bg-base-100 p-2.5 rounded-lg border border-gray-200 mb-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Schedule ID
                      </label>
                      <div className="text-sm font-mono font-semibold">
                        #
                        {viewPaymentData.schedule_id ? (
                          `${viewPaymentData.schedule_id}`
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Status
                      </label>
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
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Payment Ref
                      </label>
                      <div className="text-sm font-semibold">
                        {TABLE_PREFIX}_{viewPaymentData.payment_id}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Loan Ref Number
                      </label>
                      <div className="text-sm font-mono font-bold">
                        {viewPaymentData.loan_ref_number}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Payment Date
                      </label>
                      <div className="text-sm font-semibold">
                        {viewPaymentData.payment_date}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Payment Method
                      </label>
                      <div
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${PAYMENT_METHOD_COLORS[viewPaymentData.payment_method]}`}
                      >
                        {viewPaymentData.payment_method}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Receipt No.
                    </label>
                    <div className="text-sm font-mono font-bold">
                      {viewPaymentData.receipt_no}
                    </div>
                  </div>
                </div>

                {/* Amount Breakdown Section */}
                <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
                  <h4 className="text-xs font-bold text-gray-600 mb-3">
                    Payment Breakdown
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Principal</span>
                      <div className="px-2 py-1 bg-blue-50 rounded border border-blue-200 w-28 text-right">
                        <span className="text-sm font-bold text-blue-900">
                          ₱{viewPaymentData.principal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Interest</span>
                      <div className="px-2 py-1 bg-purple-50 rounded border border-purple-200 w-28 text-right">
                        <span className="text-sm font-bold text-purple-900">
                          ₱{viewPaymentData.interest.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fees</span>
                      <div className="px-2 py-1 bg-amber-50 rounded border border-amber-200 w-28 text-right">
                        <span className="text-sm font-bold text-amber-900">
                          ₱{viewPaymentData.fees.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-base-300">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold">
                          Total Amount
                        </span>
                        <div className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-400">
                          <span className="text-lg font-bold text-green-900">
                            ₱{viewPaymentData.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Fixed Modal Actions */}
              <div className="flex justify-between pt-2 border-t border-gray-200 mt-2 flex-shrink-0">
                {/* <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    createPdfReceipt(viewPaymentData);
                  }}
                >
                  <PictureAsPdfIcon fontSize="small" />
                  Export PDF
                </button> */}
                <button
                  className="btn btn-sm btn-primary mr-2"
                  onClick={() => setShowReceipt(true)}
                >
                  <PictureAsPdfIcon fontSize="small" className="mr-1" />
                  View Receipt
                </button>
                <button onClick={closeViewModal} className="btn btn-sm">
                  Close
                </button>
              </div>
            </div>
            {/* Backdrop enables outside click to close */}
            <form
              method="dialog"
              className="modal-backdrop"
              onSubmit={closeViewModal}
            >
              <button aria-label="Close"></button>
            </form>
          </dialog>
        )}
      </div>
    </div>
  );
}

export default MemberPayments;
