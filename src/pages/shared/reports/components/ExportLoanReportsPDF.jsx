import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { useState } from "react";
import PropTypes from "prop-types";

/**
 * ExportLoanReportsPDF — PDF export button for Loan Reports.
 * Creates a professionally formatted PDF with active loans, payment schedules, and overdue loans.
 *
 * Props:
 * - loanData: { activeLoans, paymentSchedules, overdueLoans, summary }
 * - fileName: optional filename (defaults to derived name)
 * - disabled: disable the button
 * - cooperativeName, cooperativeAddress, cooperativeContact, logoDataUrl: branding
 * - reportDate: date of report generation
 * - selectedYear, selectedMonth: filter period info
 */
export default function ExportLoanReportsPDF({
  loanData,
  fileName,
  disabled,
  cooperativeName = "Cooperative Organization",
  cooperativeAddress = "",
  cooperativeContact = "",
  logoDataUrl,
  reportDate = new Date(),
  selectedYear = 'all',
  selectedMonth = 'all',
  className = "btn btn-outline btn-sm",
  title = "Export Loan Reports as PDF",
  label = "Export to PDF",
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (!loanData || (!loanData.activeLoans && !loanData.paymentSchedules && !loanData.overdueLoans)) {
      alert("Missing loan data");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Allow UI to update before heavy PDF generation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "landscape" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;

      const currency = (v) => `PHP ${Number(v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const safe = (v, fallback = "N/A") => (v === null || v === undefined || v === "" ? fallback : String(v));
      const formatDate = (d) => (d ? dayjs(d).format("MMM DD, YYYY") : "N/A");

      let yPos = margin;

      const drawHeader = () => {
        // Logo configuration
        const logoSize = 50;
        const logoOffsetX = margin;
        const logoOffsetY = yPos;
        
        // Try to render logo if provided
        if (logoDataUrl) {
          try {
            let format = "PNG";
            if (logoDataUrl.toLowerCase().includes('data:image/jpeg') || logoDataUrl.toLowerCase().includes('data:image/jpg')) {
              format = "JPEG";
            } else if (logoDataUrl.toLowerCase().includes('data:image/png')) {
              format = "PNG";
            }
            
            doc.addImage(logoDataUrl, format, logoOffsetX, logoOffsetY, logoSize, logoSize, undefined, "FAST");
          } catch (e) {
            console.warn("Logo rendering failed:", e);
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(1);
            doc.rect(logoOffsetX, logoOffsetY, logoSize, logoSize);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text("LOGO", logoOffsetX + logoSize/2, logoOffsetY + logoSize/2 + 2, { align: "center" });
            doc.setTextColor(0, 0, 0);
          }
        } else {
          doc.setDrawColor(150, 150, 150);
          doc.setLineWidth(0.5);
          doc.setFillColor(245, 245, 245);
          doc.rect(logoOffsetX, logoOffsetY, logoSize, logoSize, 'FD');
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(120, 120, 120);
          doc.text("COOP", logoOffsetX + logoSize/2, logoOffsetY + logoSize/2 - 5, { align: "center" });
          doc.text("LOGO", logoOffsetX + logoSize/2, logoOffsetY + logoSize/2 + 5, { align: "center" });
          doc.setTextColor(0, 0, 0);
        }

        const titleStartY = yPos + 12;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("LOAN REPORTS", pageWidth / 2, titleStartY, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(0, 50, 100);
        doc.text(safe(cooperativeName), pageWidth / 2, titleStartY + 20, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        let detailsY = titleStartY + 35;
        
        if (cooperativeAddress) {
          doc.text(cooperativeAddress, pageWidth / 2, detailsY, { align: "center" });
          detailsY += 12;
        }
        if (cooperativeContact) {
          doc.text(cooperativeContact, pageWidth / 2, detailsY, { align: "center" });
          detailsY += 12;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 100, 0);
        
        let periodText = "";
        if (selectedYear !== 'all' || selectedMonth !== 'all') {
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          
          if (selectedYear !== 'all' && selectedMonth !== 'all') {
            periodText = `Period: ${months[parseInt(selectedMonth) - 1]} ${selectedYear}`;
          } else if (selectedYear !== 'all') {
            periodText = `Period: Year ${selectedYear}`;
          } else if (selectedMonth !== 'all') {
            periodText = `Period: ${months[parseInt(selectedMonth) - 1]} (All Years)`;
          }
        } else {
          periodText = `As of ${formatDate(reportDate)}`;
        }
        
        doc.text(periodText, pageWidth / 2, detailsY + 3, { align: "center" });

        doc.setDrawColor(0, 100, 0);
        doc.setLineWidth(1);
        doc.line(margin, detailsY + 12, pageWidth - margin, detailsY + 12);

        return detailsY + 26;
      };

      const checkNewPage = (requiredHeight) => {
        if (yPos + requiredHeight > pageHeight - margin - 40) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Draw header on first page
      yPos = drawHeader();

      // SUMMARY SECTION
      if (loanData.summary) {
        const { 
          totalActiveLoans, 
          totalPrincipal, 
          totalInterest,
          totalLoanAmountDue,
          totalPaid,
          totalOutstanding, 
          totalOutstandingExcludingPenalties,
          totalRemainingPenalties,
          totalPenalties,
          totalOverdueLoans, 
          totalOverdueAmount,
          totalOverduePenalties
        } = loanData.summary;

        checkNewPage(200);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(0, 50, 100);
        doc.text("LOAN PORTFOLIO SUMMARY", margin, yPos);
        yPos += 20;

        const summaryData = [
          ["Total Active Loans", safe(totalActiveLoans, '0')],
          ["", ""],
          ["Total Principal Released", currency(totalPrincipal)],
          ["Total Interest", currency(totalInterest)],
          ["Total Repayable Amount", currency(totalLoanAmountDue)],
          ["", ""],
          ["Total Payments Made", currency(totalPaid)],
          ["Outstanding (excl. penalties)", currency(totalOutstandingExcludingPenalties)],
          ["Remaining Penalties", currency(totalRemainingPenalties)],
          ["Total Outstanding Balance", currency(totalOutstanding)],
          ["", ""],
          ["Total Penalties Charged", currency(totalPenalties)],
          ["", ""],
          ["Overdue Loans", safe(totalOverdueLoans, '0')],
          ["Total Overdue Amount", currency(totalOverdueAmount)],
          ["Overdue Penalties", currency(totalOverduePenalties)],
        ];

        autoTable(doc, {
          startY: yPos,
          head: [["Metric", "Value"]],
          body: summaryData,
          margin: { left: margin, right: margin },
          theme: "grid",
          headStyles: { 
            fillColor: [0, 100, 0], 
            fontSize: 10, 
            fontStyle: "bold",
            halign: "center"
          },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 300, fontStyle: "bold", halign: "left" },
            1: { cellWidth: 'auto', halign: "right", fontStyle: "normal" }
          },
          didParseCell: function(data) {
            // Make separator rows invisible
            if (data.row.index > 0 && data.cell.raw === "") {
              data.cell.styles.fillColor = [240, 240, 240];
              data.cell.styles.textColor = [240, 240, 240];
              data.cell.styles.lineWidth = 0.1;
              data.cell.styles.minCellHeight = 5;
            }
            // Highlight main totals - make values bold
            if (data.cell.raw === "Total Repayable Amount" || 
                data.cell.raw === "Total Outstanding Balance" ||
                data.cell.raw === "Total Overdue Amount") {
              data.cell.styles.fillColor = [255, 250, 205];
              data.cell.styles.fontStyle = "bold";
            }
            // Make corresponding values bold for highlighted rows
            if (data.column.index === 1 && (
                data.row.raw[0] === "Total Repayable Amount" || 
                data.row.raw[0] === "Total Outstanding Balance" ||
                data.row.raw[0] === "Total Overdue Amount")) {
              data.cell.styles.fillColor = [255, 250, 205];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.fontSize = 10;
            }
            // Highlight overdue section
            if (data.row.raw[0] === "Overdue Loans" || 
                data.row.raw[0] === "Total Overdue Amount" ||
                data.row.raw[0] === "Overdue Penalties") {
              data.cell.styles.fillColor = [255, 230, 230];
            }
            // Format count values (non-currency)
            if (data.column.index === 1 && (
                data.row.raw[0] === "Total Active Loans" ||
                data.row.raw[0] === "Overdue Loans")) {
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.fontSize = 10;
            }
          }
        });

        yPos = doc.lastAutoTable.finalY + 25;
      }

      // ACTIVE LOANS SECTION
      if (loanData.activeLoans && loanData.activeLoans.length > 0) {
        checkNewPage(200);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 50, 100);
        doc.text(`ACTIVE LOANS (${loanData.activeLoans.length})`, margin, yPos);
        yPos += 20;

        const activeLoansData = loanData.activeLoans.map(loan => [
          safe(loan.loan_ref_number),
          safe(loan.account_number),
          safe(loan.name || loan.name),
          currency(loan.principal),
          `${safe(loan.interest_rate)}%`,
          safe(loan.loan_term_approved),
          formatDate(loan.release_date),
          formatDate(loan.maturity_date),
          currency(loan.outstanding_balance),
          safe(loan.status),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Loan Ref", "Account No", "Product", "Principal", "Rate", "Term", "Release", "Maturity", "Balance", "Status"]],
          body: activeLoansData,
          margin: { left: margin, right: margin },
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontSize: 8, 
            fontStyle: "bold",
            halign: "center"
          },
          bodyStyles: { fontSize: 7, halign: "center" },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 70 },
            2: { cellWidth: 90 },
            3: { cellWidth: 60, halign: "right" },
            4: { cellWidth: 35, halign: "center" },
            5: { cellWidth: 30, halign: "center" },
            6: { cellWidth: 60 },
            7: { cellWidth: 60 },
            8: { cellWidth: 65, halign: "right" },
            9: { cellWidth: 50 },
          },
        });

        yPos = doc.lastAutoTable.finalY + 25;
      }

      // OVERDUE LOANS SECTION
      if (loanData.overdueLoans && loanData.overdueLoans.length > 0) {
        checkNewPage(200);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(220, 53, 69);
        doc.text(`OVERDUE LOANS (${loanData.overdueLoans.length})`, margin, yPos);
        yPos += 20;

        const overdueLoansData = loanData.overdueLoans.map(loan => [
          safe(loan.loan_ref_number),
          safe(loan.account_number),
          safe(loan.name || loan.product_name),
          currency(loan.principal),
          currency(loan.outstanding_balance),
          formatDate(loan.maturity_date),
          safe(loan.mos_overdue || 'N/A'),
          currency(loan.remaining_penalty_fees),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Loan Ref", "Account No", "Product", "Principal", "Balance", "Maturity", "Mos Overdue", "Penalty"]],
          body: overdueLoansData,
          margin: { left: margin, right: margin },
          theme: "striped",
          headStyles: { 
            fillColor: [220, 53, 69], 
            fontSize: 8, 
            fontStyle: "bold",
            halign: "center"
          },
          bodyStyles: { fontSize: 7, halign: "center" },
          columnStyles: {
            0: { cellWidth: 75 },
            1: { cellWidth: 75 },
            2: { cellWidth: 100 },
            3: { cellWidth: 70, halign: "right" },
            4: { cellWidth: 70, halign: "right" },
            5: { cellWidth: 70 },
            6: { cellWidth: 60, halign: "center" },
            7: { cellWidth: 70, halign: "right" },
          },
        });

        yPos = doc.lastAutoTable.finalY + 25;
      }

      // PAYMENT SCHEDULES SECTION (Sample - limited to prevent too long PDFs)
      if (loanData.paymentSchedules && loanData.paymentSchedules.length > 0) {
        const sampleSchedules = loanData.paymentSchedules.slice(0, 20); // Limit to 20 for readability
        
        checkNewPage(200);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(0, 50, 100);
        doc.text(`PAYMENT SCHEDULES (Showing ${sampleSchedules.length} of ${loanData.paymentSchedules.length})`, margin, yPos);
        yPos += 20;

        const scheduleData = sampleSchedules.map(sched => [
          safe(sched.loan_ref_number),
          safe(sched.installment_no),
          formatDate(sched.due_date),
          currency(sched.principal_due),
          currency(sched.interest_due),
          currency(sched.fee_due),
          currency(sched.total_due),
          safe(sched.payment_status),
          sched.paid ? formatDate(sched.paid_at) : 'Unpaid',
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Loan Ref", "Inst", "Due Date", "Principal", "Interest", "Fee", "Total Due", "Status", "Paid Date"]],
          body: scheduleData,
          margin: { left: margin, right: margin },
          theme: "striped",
          headStyles: { 
            fillColor: [52, 152, 219], 
            fontSize: 8, 
            fontStyle: "bold",
            halign: "center"
          },
          bodyStyles: { fontSize: 7, halign: "center" },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 30, halign: "center" },
            2: { cellWidth: 60 },
            3: { cellWidth: 55, halign: "right" },
            4: { cellWidth: 55, halign: "right" },
            5: { cellWidth: 50, halign: "right" },
            6: { cellWidth: 55, halign: "right" },
            7: { cellWidth: 60 },
            8: { cellWidth: 65 },
          },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Footer on last page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Generated on ${dayjs().format("MMMM DD, YYYY hh:mm A")}`,
          margin,
          pageHeight - 25
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - 25,
          { align: "right" }
        );
      }

      // Save the PDF
      const defaultFileName = `Loan_Report_${dayjs().format("YYYY-MM-DD")}.pdf`;
      doc.save(fileName || defaultFileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = () => {
    if (disabled) return true;
    if (isGenerating) return true;
    if (!loanData) return true;
    return !loanData.activeLoans && !loanData.paymentSchedules && !loanData.overdueLoans;
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled()}
      className={className}
      title={title}
    >
      {isGenerating ? (
        <>
          <span className="loading loading-spinner loading-xs"></span>
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

ExportLoanReportsPDF.propTypes = {
  loanData: PropTypes.shape({
    activeLoans: PropTypes.array,
    paymentSchedules: PropTypes.array,
    overdueLoans: PropTypes.array,
    summary: PropTypes.shape({
      totalActiveLoans: PropTypes.number,
      totalPrincipal: PropTypes.number,
      totalInterest: PropTypes.number,
      totalLoanAmountDue: PropTypes.number,
      totalPaid: PropTypes.number,
      totalOutstanding: PropTypes.number,
      totalOutstandingExcludingPenalties: PropTypes.number,
      totalRemainingPenalties: PropTypes.number,
      totalPenalties: PropTypes.number,
      totalOverdueLoans: PropTypes.number,
      totalOverdueAmount: PropTypes.number,
      totalOverduePenalties: PropTypes.number,
    }),
  }),
  fileName: PropTypes.string,
  disabled: PropTypes.bool,
  cooperativeName: PropTypes.string,
  cooperativeAddress: PropTypes.string,
  cooperativeContact: PropTypes.string,
  logoDataUrl: PropTypes.string,
  reportDate: PropTypes.instanceOf(Date),
  selectedYear: PropTypes.string,
  selectedMonth: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  label: PropTypes.string,
};
