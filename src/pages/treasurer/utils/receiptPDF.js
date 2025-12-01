import jsPDF from "jspdf";
import dayjs from "dayjs";

/**
 * Create a styled PDF receipt for a loan payment.
 * @param {Object} payment - Payment record (single allocation row from loan_payments)
 * @param {Object} [opts]
 * @param {string} [opts.title="Loan Payment Receipt"] - Title to display
 * @param {string} [opts.logoDataUrl] - Optional base64 image (PNG/JPEG) for branding (will be drawn at top-left)
 * @param {boolean} [opts.includeMeta=true] - Whether to render receipt_meta timestamps
 * @param {boolean} [opts.openInsteadOfSave=false] - If true returns Blob URL instead of auto-save
 * @returns {string|undefined} Blob URL when openInsteadOfSave=true, otherwise saves file.
 */
export function createPdfReceipt(payment, opts = {}) {
  const {
    title = "Loan Payment Receipt",
    logoDataUrl,
    includeMeta = true,
    openInsteadOfSave = false,
  } = opts;

  if (!payment) throw new Error("Missing payment object for PDF receipt.");

  const doc = new jsPDF({ unit: "pt", format: "A5" }); // A5 = compact receipt size

  // Helpers
  // NOTE: jsPDF default fonts (Helvetica, Times, Courier) do NOT support the Peso sign (₱) reliably.
  // This was causing garbled characters (e.g., ±8&20&...) in rendered PDFs.
  // Using 'PHP' prefix instead; if you need the actual symbol, embed a Unicode font.
  const currency = (v) =>
    `PHP ${Number(v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const safe = (v, fallback = "N/A") =>
    v === null || v === undefined || v === "" ? fallback : String(v);
  const receiptMeta = payment.receipt_meta || {};

  // Prioritize receipt_meta values as source of truth
  const displayData = {
    receiptNo: payment.receipt_no,
    memberName: receiptMeta.member_name || payment.full_name || "N/A",
    accountNumber:
      receiptMeta.account_number || payment.account_number || "N/A",
    loanRefNumber:
      receiptMeta.loan_ref_number || payment.loan_ref_number || "N/A",
    paymentMethod:
      receiptMeta.payment_method || payment.payment_method || "N/A",
    paymentDate: receiptMeta.payment_date || payment.payment_date,
    generatedAt: receiptMeta.generated_at,
    breakdown: {
      totalAmount:
        receiptMeta.breakdown?.total_amount ?? payment.total_amount ?? 0,
      principal: receiptMeta.breakdown?.principal ?? payment.principal ?? 0,
      interest: receiptMeta.breakdown?.interest ?? payment.interest ?? 0,
      fees: receiptMeta.breakdown?.fees ?? payment.fees ?? 0,
    },
  };

  let y = 32; // vertical cursor
  const leftX = 32;
  const rightX = doc.internal.pageSize.getWidth() - 32;

  // Optional logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", leftX, y, 40, 40, undefined, "FAST");
    } catch {
      // Ignore logo failures silently
    }
  }

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, logoDataUrl ? leftX + 50 : leftX, y + 16);
  doc.setDrawColor(25, 118, 210); // blue
  doc.setLineWidth(1);
  doc.line(leftX, y + 26, rightX, y + 26);
  y += 38;

  // Receipt core info block
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const blockLine = (label, value) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, leftX, y);
    doc.setFont("courier", "bold"); // monospaced for stability
    doc.text(safe(value), rightX, y, { align: "right" });
    y += 14;
  };

  blockLine("Receipt No", displayData.receiptNo);
  blockLine("Date", dayjs(displayData.paymentDate).format("YYYY-MM-DD"));
  blockLine("Member", displayData.memberName);
  blockLine("Account No", displayData.accountNumber);
  blockLine("Loan Ref", displayData.loanRefNumber);
  blockLine("Payment Method", displayData.paymentMethod);

  if (includeMeta && displayData.generatedAt) {
    blockLine(
      "Generated",
      dayjs(displayData.generatedAt).format("YYYY-MM-DD HH:mm")
    );
  }

  y += 4;
  doc.setDrawColor(200);
  doc.line(leftX, y, rightX, y);
  y += 14;

  // Breakdown table
  doc.setFont("helvetica", "bold");
  doc.text("Breakdown", leftX, y);
  y += 8;
  doc.setFontSize(8);
  const col1 = leftX;
  const col3 = rightX; // Using two-column layout (label, value)
  const rowH = 14;

  const drawRow = (label, value, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, col1, y);
    doc.setFont("courier", bold ? "bold" : "normal");
    doc.text(currency(value), col3, y, { align: "right" });
    y += rowH;
  };

  y += 12;
  drawRow("Principal", displayData.breakdown.principal);
  drawRow("Interest", displayData.breakdown.interest);
  drawRow("Fees", displayData.breakdown.fees);
  doc.setDrawColor(150);
  doc.line(col1, y - 6, col3, y - 6);
  drawRow("Total Paid", displayData.breakdown.totalAmount, true);

  // Footer note
  y += 10;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const footerLines = [
    "This receipt is system-generated.",
    "Retain for your records. Contact support for discrepancies.",
  ];
  footerLines.forEach((l) => {
    doc.text(l, leftX, y);
    y += 10;
  });

  // Timestamp
  doc.setFontSize(6);
  doc.text(`Exported: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`, leftX, y + 2);

  if (openInsteadOfSave) {
    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  }

  doc.save(`${payment.receipt_no || "receipt"}.pdf`);
}
