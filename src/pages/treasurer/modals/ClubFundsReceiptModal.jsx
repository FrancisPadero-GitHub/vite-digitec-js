import dayjs from "dayjs";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";

export default function ClubFundsReceiptModal({ open, onClose, contribution }) {
  if (!open || !contribution) return null;

  const {
    receipt_no,
    payment_date,
    payment_method,
    account_number,
    full_name,
    amount,
    category,
    remarks,
    contribution_id,
    period_start,
    period_end,
  } = contribution;

  const displayData = {
    receiptNo: receipt_no || `CFC-${contribution_id}`,
    memberName: full_name || "N/A",
    accountNumber: account_number || "N/A",
    paymentMethod: payment_method || "N/A",
    paymentDate: payment_date,
    amount: amount ?? 0,
    category: category || "N/A",
    remarks: remarks || "",
    periodStart: period_start,
    periodEnd: period_end,
  };

  const handlePdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "A5" });

    const currency = (v) =>
      `PHP ${Number(v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let yPos = 40;
    const lineHeight = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Club Funds Receipt", 210, yPos, { align: "center" });
    yPos += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Official Transaction Record", 210, yPos, { align: "center" });
    yPos += lineHeight * 2;

    // Receipt Number
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Receipt No: ${displayData.receiptNo}`, 40, yPos);
    yPos += lineHeight * 1.5;

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.line(40, yPos, 380, yPos);
    yPos += lineHeight;

    // Account Information
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Account Information", 40, yPos);
    yPos += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Member: ${displayData.memberName}`, 40, yPos);
    yPos += lineHeight;
    doc.text(`Account No: ${displayData.accountNumber}`, 40, yPos);
    yPos += lineHeight * 1.5;

    // Contribution Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Contribution Details", 40, yPos);
    yPos += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Date: ${dayjs(displayData.paymentDate).format("MMMM DD, YYYY")}`,
      40,
      yPos
    );
    yPos += lineHeight;
    doc.text(`Category: ${displayData.category}`, 40, yPos);
    yPos += lineHeight;
    doc.text(`Payment Method: ${displayData.paymentMethod}`, 40, yPos);
    yPos += lineHeight;

    // Coverage Period (only for Monthly Dues)
    if (
      displayData.category === "Monthly Dues" &&
      displayData.periodStart &&
      displayData.periodEnd
    ) {
      doc.text(
        `Coverage: ${dayjs(displayData.periodStart).format("MMM YYYY")} - ${dayjs(displayData.periodEnd).format("MMM YYYY")}`,
        40,
        yPos
      );
      yPos += lineHeight;
    }
    yPos += lineHeight * 0.5;

    if (displayData.remarks) {
      doc.text(`Remarks: ${displayData.remarks}`, 40, yPos);
      yPos += lineHeight * 1.5;
    }

    // Amount
    doc.setDrawColor(100, 200, 100);
    doc.setLineWidth(2);
    doc.line(40, yPos, 380, yPos);
    yPos += lineHeight;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Total Amount:", 40, yPos);
    doc.text(currency(displayData.amount), 380, yPos, { align: "right" });
    yPos += lineHeight;

    doc.setLineWidth(2);
    doc.line(40, yPos, 380, yPos);
    yPos += lineHeight * 2;

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text(
      "This is an official receipt. Please keep for your records.",
      210,
      yPos,
      { align: "center" }
    );
    yPos += lineHeight;
    doc.text(
      `Generated on: ${dayjs().format("MMMM DD, YYYY h:mm A")}`,
      210,
      yPos,
      { align: "center" }
    );

    doc.save(`ClubFunds_Receipt_${displayData.receiptNo}.pdf`);
  };

  const handlePrint = () => window.print();

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
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ReceiptIcon className="text-white" fontSize="medium" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Club Funds Receipt
              </h3>
              <p className="text-purple-100 text-xs">
                Official Transaction Record
              </p>
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

        {/* Receipt Content */}
        <div className="p-6 flex-1 overflow-y-auto min-h-0">
          {/* Receipt Number Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg px-4 py-2">
              <p className="text-xs text-purple-600 font-semibold uppercase">
                Receipt No.
              </p>
              <p className="text-lg font-bold text-purple-900 font-mono tracking-wide">
                {displayData.receiptNo}
              </p>
            </div>
          </div>

          {/* Contribution Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">
              Contribution Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">
                  {dayjs(displayData.paymentDate).format("MMMM DD, YYYY")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold text-gray-900">
                  {displayData.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900">
                  {displayData.paymentMethod}
                </span>
              </div>
              {displayData.category === "Monthly Dues" &&
                displayData.periodStart &&
                displayData.periodEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage Period:</span>
                    <span className="font-semibold text-gray-900">
                      {dayjs(displayData.periodStart).format("MMM YYYY")} -{" "}
                      {dayjs(displayData.periodEnd).format("MMM YYYY")}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-xs font-bold text-gray-600 uppercase mb-3">
              Account Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Member:</span>
                <span className="font-semibold text-gray-900">
                  {displayData.memberName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account No:</span>
                <span className="font-mono font-semibold text-gray-900">
                  {displayData.accountNumber}
                </span>
              </div>
            </div>
          </div>

          {displayData.remarks && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">
                Remarks
              </h4>
              <p className="text-sm text-gray-700">{displayData.remarks}</p>
            </div>
          )}

          {/* Amount */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <h4 className="text-xs font-bold text-green-800 uppercase mb-3">
              Amount
            </h4>
            <div className="border-t-2 border-green-300 pt-3 flex justify-between">
              <span className="font-bold text-green-900 uppercase">
                Total Amount
              </span>
              <span className="text-xl font-bold text-green-900">
                ₱
                {displayData.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 italic">
              This is an official receipt. Please keep for your records.
            </p>
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
          <button className="btn btn-sm btn-primary gap-2" onClick={handlePdf}>
            <PictureAsPdfIcon fontSize="small" />
            Export PDF
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

ClubFundsReceiptModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contribution: PropTypes.shape({
    receipt_no: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    payment_date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    payment_method: PropTypes.string,
    account_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    full_name: PropTypes.string,
    amount: PropTypes.number,
    category: PropTypes.string,
    remarks: PropTypes.string,
    contribution_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    period_start: PropTypes.string,
    period_end: PropTypes.string,
  }),
};
