import dayjs from "dayjs";
import { createPortal } from "react-dom";
import { createPdfReceipt } from "../utils/receiptPDF";
import PropTypes from "prop-types";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";

export default function ReceiptModal({ open, onClose, payment }) {
  if (!open || !payment) return null;

  const {
    receipt_no,
    payment_date,
    payment_method,
    loan_ref_number,
    account_number,
    full_name,
    total_amount,
    principal,
    interest,
    fees,
    receipt_meta,
  } = payment;

  // Prioritize receipt_meta values (source of truth) with fallbacks to direct properties
  const displayData = {
    receiptNo: receipt_no,
    memberName: receipt_meta?.member_name || full_name || "N/A",
    accountNumber: receipt_meta?.account_number || account_number || "N/A",
    loanRefNumber: receipt_meta?.loan_ref_number || loan_ref_number || "N/A",
    paymentMethod: receipt_meta?.payment_method || payment_method || "N/A",
    paymentDate: receipt_meta?.payment_date || payment_date,
    generatedAt: receipt_meta?.generated_at,
    breakdown: {
      totalAmount: receipt_meta?.breakdown?.total_amount ?? total_amount ?? 0,
      principal: receipt_meta?.breakdown?.principal ?? principal ?? 0,
      interest: receipt_meta?.breakdown?.interest ?? interest ?? 0,
      fees: receipt_meta?.breakdown?.fees ?? fees ?? 0,
    }
  };

  const handlePdf = () => createPdfReceipt(payment);
  const handlePrint = () => window.print();

  // Stop propagation to prevent closing when clicking inside modal
  const handleModalClick = (e) => e.stopPropagation();

  return createPortal(
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-sm sm:max-w-[25rem] md:max-w-[30rem] lg:max-w-[40rem] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={handleModalClick} 
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ReceiptIcon className="text-white" fontSize="medium" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Receipt</h3>
              <p className="text-blue-100 text-xs">Official Transaction Record</p>
            </div>
          </div>
          <button 
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Receipt Content (scrollable center) */}
        <div className="p-6 flex-1 overflow-y-auto min-h-0">
          {/* Receipt Number Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2">
              <p className="text-xs text-blue-600 font-semibold uppercase">Receipt No.</p>
              <p className="text-lg font-bold text-blue-900 font-mono tracking-wide">{displayData.receiptNo || "N/A"}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">Payment Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">{dayjs(displayData.paymentDate).format("MMMM DD, YYYY")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900">{displayData.paymentMethod}</span>
              </div>
              {displayData.generatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated:</span>
                  <span className="text-gray-700 text-xs">{dayjs(displayData.generatedAt).format("MMM DD, YYYY h:mm A")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Member & Loan Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">Account Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member:</span>
                <span className="font-semibold text-gray-900">{displayData.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account No:</span>
                <span className="font-mono font-semibold text-gray-900">{displayData.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Reference:</span>
                <span className="font-mono font-semibold text-gray-900">{displayData.loanRefNumber}</span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <h4 className="text-xs font-bold text-green-800 uppercase mb-3">Payment Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Principal</span>
                <span className="font-semibold text-gray-900">₱{displayData.breakdown.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Interest</span>
                <span className="font-semibold text-gray-900">₱{displayData.breakdown.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Fees</span>
                <span className="font-semibold text-gray-900">₱{displayData.breakdown.fees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t-2 border-green-300 mt-2 pt-2 flex justify-between">
                <span className="font-bold text-green-900 uppercase">Total Amount Paid</span>
                <span className="text-xl font-bold text-green-900">₱{displayData.breakdown.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 italic">This is an official payment receipt. Please keep for your records.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
          <button 
            className="btn btn-sm btn-outline gap-2"
            onClick={handlePrint}
          >
            <PrintIcon fontSize="small" />
            Print
          </button>
          <button 
            className="btn btn-sm btn-primary gap-2"
            onClick={handlePdf}
          >
            <PictureAsPdfIcon fontSize="small" />
            Export PDF
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

ReceiptModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  payment: PropTypes.shape({
    receipt_no: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    payment_method: PropTypes.string,
    loan_ref_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    account_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    full_name: PropTypes.string,
    total_amount: PropTypes.number,
    principal: PropTypes.number,
    interest: PropTypes.number,
    fees: PropTypes.number,
    receipt_meta: PropTypes.shape({
      generated_at: PropTypes.string,
      member_name: PropTypes.string,
      account_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      loan_ref_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      payment_method: PropTypes.string,
      payment_date: PropTypes.string,
      breakdown: PropTypes.shape({
        total_amount: PropTypes.number,
        principal: PropTypes.number,
        interest: PropTypes.number,
        fees: PropTypes.number,
      }),
    }),
  }),
};