import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { useState } from "react";

/**
 * ExportPDFButton — drop-in PDF export button.
 * Encapsulates PDF creation (member financial statement) so callers just pass data.
 *
 * Props:
 * - statementData: { member, shareCapital, loanAccounts, payments, clubFunds, summary }
 * - fileName: optional filename (defaults to derived name)
 * - disabled: disable the button
 * - cooperativeName, cooperativeAddress, cooperativeContact, logoDataUrl: branding
 * - startDate, endDate: statement period
 * - openInsteadOfSave: when true, opens blob URL via window.open
 */
import PropTypes from "prop-types";

export default function ExportPDFButton({
  statementData,
  fileName,
  disabled,
  cooperativeName = "Cooperative Organization",
  cooperativeAddress = "",
  cooperativeContact = "",
  logoDataUrl,
  startDate,
  endDate = new Date(),
  openInsteadOfSave = false,
  className = "btn btn-outline btn-sm",
  title = "Export as PDF file",
  label = "Export to PDF",
}) {
    const [isGenerating, setIsGenerating] = useState(false);
  const handleExport = async () => {
    if (!statementData || !statementData.member) {
      alert("Missing statement data or member information");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Allow UI to update before heavy PDF generation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    const currency = (v) => `PHP ${Number(v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const safe = (v, fallback = "N/A") => (v === null || v === undefined || v === "" ? fallback : String(v));
    const formatDate = (d) => (d ? dayjs(d).format("MMM DD, YYYY") : "N/A");

    let yPos = margin;

    const drawHeader = () => {
      const logoSize = 50;
      const logoOffsetX = margin;
      const logoOffsetY = yPos;
      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, "PNG", logoOffsetX, logoOffsetY, logoSize, logoSize, undefined, "FAST");
        } catch (e) {
          console.warn("Logo rendering failed:", e);
        }
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("MEMBER FINANCIAL STATEMENT", pageWidth / 2, yPos + 16, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(safe(cooperativeName), pageWidth / 2, yPos + 32, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      let detailsY = yPos + 46;
      if (cooperativeAddress) {
        doc.text(cooperativeAddress, pageWidth / 2, detailsY, { align: "center" });
        detailsY += 12;
      }
      if (cooperativeContact) {
        doc.text(cooperativeContact, pageWidth / 2, detailsY, { align: "center" });
        detailsY += 12;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const periodText = startDate ? `Period: ${formatDate(startDate)} to ${formatDate(endDate)}` : `As of ${formatDate(endDate)}`;
      doc.text(periodText, pageWidth / 2, detailsY, { align: "center" });

      yPos = detailsY + 18;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.0);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;
    };

    const drawMemberInfo = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("MEMBER INFORMATION", margin, yPos);
      yPos += 5;

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 12;

      const member = statementData.member;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const infoData = [
        ["Account Number:", safe(member.account_number)],
        ["Member Name:", safe(member.full_name)],
        ["Email:", safe(member.email)],
        ["Contact:", safe(member.contact_number)],
        ["Account Role:", safe(member.account_role)],
        ["Account Status:", safe(member.account_status)],
        ["Statement Date:", formatDate(new Date())],
      ];

      const colX1 = margin;
      const colX2 = margin + 120;

      infoData.forEach(([label, value]) => {
        doc.setFont("helvetica", "normal");
        doc.text(label, colX1, yPos);
        doc.setFont("helvetica", "bold");
        doc.text(value, colX2, yPos);
        yPos += 14;
      });

      yPos += 10;
    };

    const drawFinancialSummary = () => {
      const summary = statementData.summary || {};

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("FINANCIAL SUMMARY", margin, yPos);
      yPos += 5;

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      const summaryTableData = [
        ["Total Share Capital", currency(summary.totalShareCapital || 0)],
        ["Total Club Fund Contributions", currency(summary.totalClubFunds || 0)],
        ["Active Loans (Count)", String(summary.activeLoanCount || 0)],
        ["Total Loan Principal Outstanding", currency(summary.totalLoanOutstanding || 0)],
        ["Total Payments Made (Period)", currency(summary.totalPayments || 0)],
        ["Member Equity", currency(summary.memberEquity || 0)],
      ];

      autoTable(doc, {
        startY: yPos,
        head: [["Description", "Amount"]],
        body: summaryTableData,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10, fontStyle: "bold", halign: "center" },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.65, fontStyle: "normal" },
          1: { cellWidth: contentWidth * 0.35, halign: "right", fontStyle: "bold" },
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      yPos = doc.lastAutoTable.finalY + 20;
    };

    const drawShareCapital = () => {
      if (yPos > pageHeight - 150) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("SHARE CAPITAL", margin, yPos);
      yPos += 5;

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      const shareCapital = statementData.shareCapital || [];

      if (shareCapital.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("No share capital transactions recorded.", margin, yPos);
        yPos += 20;
      } else {
        const shareTableData = shareCapital.map((tx) => [
          formatDate(tx.transaction_date),
          safe(tx.transaction_type),
          safe(tx.description, "-"),
          currency(tx.amount),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Type", "Description", "Amount"]],
          body: shareTableData,
          margin: { left: margin, right: margin },
          theme: "grid",
          headStyles: { fillColor: [52, 152, 219], textColor: 255, fontSize: 9, fontStyle: "bold", halign: "center" },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 80, halign: "center" },
            1: { cellWidth: 80, halign: "center" },
            2: { cellWidth: contentWidth - 240 },
            3: { cellWidth: 80, halign: "right", fontStyle: "bold" },
          },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      }
    };

    const drawLoanAccounts = () => {
      if (yPos > pageHeight - 150) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("LOAN ACCOUNTS", margin, yPos);
      yPos += 5;

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      const loanAccounts = statementData.loanAccounts || [];

      if (loanAccounts.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("No loan accounts found.", margin, yPos);
        yPos += 20;
      } else {
        const loanTableData = loanAccounts.map((loan) => [
          safe(loan.loan_ref_number),
          safe(loan.loan_type),
          formatDate(loan.application_date),
          currency(loan.loan_amount),
          currency(loan.outstanding_balance || 0),
          safe(loan.loan_status),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Loan Ref", "Type", "Date", "Principal", "Outstanding", "Status"]],
          body: loanTableData,
          margin: { left: margin, right: margin },
          theme: "grid",
          headStyles: { fillColor: [231, 76, 60], textColor: 255, fontSize: 8, fontStyle: "bold", halign: "center" },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 75, halign: "center" },
            1: { cellWidth: 70 },
            2: { cellWidth: 70, halign: "center" },
            3: { cellWidth: 75, halign: "right" },
            4: { cellWidth: 75, halign: "right", fontStyle: "bold" },
            5: { cellWidth: 60, halign: "center" },
          },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      }
    };

    const drawPaymentHistory = () => {
      if (yPos > pageHeight - 150) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("PAYMENT HISTORY", margin, yPos);
      yPos += 5;

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      const payments = statementData.payments || [];

      if (payments.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("No payment history available.", margin, yPos);
        yPos += 20;
      } else {
        const paymentTableData = payments.slice(0, 20).map((pmt) => [
          formatDate(pmt.payment_date),
          safe(pmt.loan_ref_number, "-"),
          currency(pmt.principal || 0),
          currency(pmt.interest || 0),
          currency(pmt.fees || 0),
          currency(pmt.total_amount || 0),
          safe(pmt.payment_method),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Loan Ref", "Principal", "Interest", "Fees", "Total", "Method"]],
          body: paymentTableData,
          margin: { left: margin, right: margin },
          theme: "striped",
          headStyles: { fillColor: [46, 204, 113], textColor: 255, fontSize: 8, fontStyle: "bold", halign: "center" },
          bodyStyles: { fontSize: 7 },
          columnStyles: {
            0: { cellWidth: 60, halign: "center" },
            1: { cellWidth: 65, halign: "center" },
            2: { cellWidth: 60, halign: "right" },
            3: { cellWidth: 55, halign: "right" },
            4: { cellWidth: 50, halign: "right" },
            5: { cellWidth: 65, halign: "right", fontStyle: "bold" },
            6: { cellWidth: 70, halign: "center" },
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        if (payments.length > 20) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.text(
            `Showing last 20 of ${payments.length} payments. Contact office for complete history.`,
            margin,
            doc.lastAutoTable.finalY + 10
          );
        }

        yPos = doc.lastAutoTable.finalY + 20;
      }
    };

    const drawClubFunds = () => {
      if (yPos > pageHeight - 150) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CLUB FUND CONTRIBUTIONS", margin, yPos);
      yPos += 5;

      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      const clubFunds = statementData.clubFunds || [];

      if (clubFunds.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text("No club fund contributions recorded.", margin, yPos);
        yPos += 20;
      } else {
        const clubTableData = clubFunds.map((cf) => [
          formatDate(cf.contribution_date),
          safe(cf.fund_type),
          safe(cf.purpose, "-"),
          currency(cf.amount),
          safe(cf.status),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Fund Type", "Purpose", "Amount", "Status"]],
          body: clubTableData,
          margin: { left: margin, right: margin },
          theme: "grid",
          headStyles: { fillColor: [142, 68, 173], textColor: 255, fontSize: 9, fontStyle: "bold", halign: "center" },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 75, halign: "center" },
            1: { cellWidth: 80 },
            2: { cellWidth: contentWidth - 280 },
            3: { cellWidth: 75, halign: "right", fontStyle: "bold" },
            4: { cellWidth: 50, halign: "center" },
          },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      }
    };

    const drawFooter = () => {
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = margin;
      }

      yPos += 10;
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      const disclaimers = [
        "This statement is generated electronically and is valid without signature.",
        "Please review this statement carefully. Report any discrepancies within 30 days.",
        "For inquiries, contact your cooperative office.",
        "",
        `Generated on: ${dayjs().format("MMMM DD, YYYY [at] hh:mm A")}`,
      ];

      disclaimers.forEach((line) => {
        doc.text(line, margin, yPos);
        yPos += 12;
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 20, { align: "center" });
      }
    };

    // Render
    drawHeader();
    drawMemberInfo();
    drawFinancialSummary();
    drawShareCapital();
    drawLoanAccounts();
    drawPaymentHistory();
    drawClubFunds();
    drawFooter();

      if (openInsteadOfSave) {
        const blobUrl = URL.createObjectURL(doc.output("blob"));
        window.open(blobUrl);
        return;
      }

      // Small delay before save to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const defaultName = `Member_Statement_${statementData.member.account_number}_${dayjs(endDate).format("YYYY-MM-DD")}.pdf`;
      doc.save(fileName || defaultName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = () => !statementData || isGenerating || disabled;

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled()}
      className={`${className} ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
      title={isGenerating ? 'Generating PDF...' : title}
      aria-busy={isGenerating}
      aria-disabled={isDisabled()}
    >
      {isGenerating ? (
        <span className="flex items-center gap-2">
          <span className="loading loading-spinner loading-xs"></span>
          Generating...
        </span>
      ) : (
        label
      )}
    </button>
  );
}

ExportPDFButton.propTypes = {
  statementData: PropTypes.shape({
    member: PropTypes.shape({
      account_number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      full_name: PropTypes.string,
      email: PropTypes.string,
      contact_number: PropTypes.string,
      account_role: PropTypes.string,
      account_status: PropTypes.string,
    }),
    shareCapital: PropTypes.arrayOf(PropTypes.object),
    loanAccounts: PropTypes.arrayOf(PropTypes.object),
    payments: PropTypes.arrayOf(PropTypes.object),
    clubFunds: PropTypes.arrayOf(PropTypes.object),
    summary: PropTypes.object,
  }),
  fileName: PropTypes.string,
  disabled: PropTypes.bool,
  cooperativeName: PropTypes.string,
  cooperativeAddress: PropTypes.string,
  cooperativeContact: PropTypes.string,
  logoDataUrl: PropTypes.string,
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  openInsteadOfSave: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
  label: PropTypes.string,
};
