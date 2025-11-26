import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { useState } from "react";
import PropTypes from "prop-types";

/**
 * ExportClubCoopFundsPDF — PDF export button for Club/Coop Funds reports.
 * Creates a professionally formatted PDF with fund balances, inflows, and outflows.
 *
 * Props:
 * - fundsData: { contributions, expenses, loanReleases, totals }
 * - fileName: optional filename (defaults to derived name)
 * - disabled: disable the button
 * - cooperativeName, cooperativeAddress, cooperativeContact, logoDataUrl: branding
 * - startDate, endDate: reporting period
 * - selectedYear, selectedMonth: filter period info
 */
export default function ExportClubCoopFundsPDF({
  fundsData,
  fileName,
  disabled,
  cooperativeName = "Cooperative Organization",
  cooperativeAddress = "",
  cooperativeContact = "",
  logoDataUrl,
  startDate,
  endDate = new Date(),
  selectedYear = 'all',
  selectedMonth = 'all',
  className = "btn btn-outline btn-sm",
  title = "Export Club/Coop Funds as PDF",
  label = "Export to PDF",
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (!fundsData || (!fundsData.contributions && !fundsData.expenses && !fundsData.loanReleases)) {
      alert("Missing funds data");
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
        // Logo configuration
        const logoSize = 60;
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

        const titleStartY = yPos + 16;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text("CLUB/COOP FUNDS REPORT", pageWidth / 2, titleStartY, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 50, 100);
        doc.text(safe(cooperativeName), pageWidth / 2, titleStartY + 24, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        let detailsY = titleStartY + 42;
        
        if (cooperativeAddress) {
          doc.text(cooperativeAddress, pageWidth / 2, detailsY, { align: "center" });
          detailsY += 14;
        }
        if (cooperativeContact) {
          doc.text(cooperativeContact, pageWidth / 2, detailsY, { align: "center" });
          detailsY += 14;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
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
          periodText = startDate ? `Period: ${formatDate(startDate)} to ${formatDate(endDate)}` : `As of ${formatDate(endDate)}`;
        }
        
        doc.text(periodText, pageWidth / 2, detailsY + 4, { align: "center" });

        const logoBottomY = yPos + logoSize;
        const textBottomY = detailsY + 20;
        yPos = Math.max(logoBottomY, textBottomY);
        
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 20;
      };

      const drawFundsSummary = () => {
        const totals = fundsData.totals || {};

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("FUNDS SUMMARY", margin, yPos);
        yPos += 5;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        const totalContributions = (totals.shareCapitalContributions || 0) + (totals.clubFundContributions || 0);
        
        const summaryTableData = [
          ["Share Capital Contributions (Inflow)", currency(totals.shareCapitalContributions || 0)],
          ["Total Loan Releases (Outflow)", currency(totals.totalLoanReleases || 0)],
          ["Club Fund Contributions (Inflow)", currency(totals.clubFundContributions || 0)],
          ["Total Expenses (Outflow)", currency(totals.totalExpenses || 0)],

          [
            { content: "NET CASH FLOW", styles: { fontStyle: "bold" } },
            { content: currency(totalContributions - (totals.totalExpenses || 0) - (totals.totalLoanReleases || 0)), styles: { fontStyle: "bold" } },
            { content: "", styles: {} }
          ],
          [
            { content: "CASH ON HAND / GENERAL FUND", styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
            { content: currency(totals.cashOnHand || 0), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
            { content: "", styles: { fillColor: [240, 240, 240] } }
          ],
        ];

        autoTable(doc, {
          startY: yPos,
          head: [["Description", "Amount"]],
          body: summaryTableData,
          margin: { left: margin, right: margin },
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            textColor: 255, 
            fontSize: 10, 
            fontStyle: "bold", 
            halign: "center" 
          },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.60, fontStyle: "normal" },
            1: { cellWidth: contentWidth * 0.40, halign: "center", fontStyle: "bold" },
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      };

      const drawContributions = () => {
        const contributions = fundsData.contributions || [];
        
        if (contributions.length === 0) return;

        if (yPos > pageHeight - 150) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("FUND CONTRIBUTIONS (INFLOWS)", margin, yPos);
        yPos += 5;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        const contributionsTableData = contributions.map(item => [
          item.contribution_date || item.payment_date || item.transaction_date ? formatDate(new Date(item.contribution_date || item.payment_date || item.transaction_date)) : "N/A",
          safe(item.full_name || item.member_name),
          safe(item.account_number),
          safe(item.fund_type || item.payment_category || "N/A"),
          currency(item.amount || 0)
        ]);

        const totalContributions = contributions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        contributionsTableData.push([
          { content: "TOTAL CONTRIBUTIONS", colSpan: 4, styles: { fontStyle: "bold", fillColor: [240, 240, 240], halign: "right" } },
          { content: currency(totalContributions), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Member Name", "Account No", "Fund Type", "Amount"]],
          body: contributionsTableData,
          margin: { left: margin, right: margin },
          theme: "striped",
          headStyles: { 
            fillColor: [46, 204, 113], 
            textColor: 255, 
            fontSize: 9, 
            fontStyle: "bold", 
            halign: "center" 
          },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.15, halign: "center" },
            1: { cellWidth: contentWidth * 0.30 },
            2: { cellWidth: contentWidth * 0.20, halign: "center" },
            3: { cellWidth: contentWidth * 0.15, halign: "center" },
            4: { cellWidth: contentWidth * 0.20, halign: "right", fontStyle: "bold" },
          },
          alternateRowStyles: { fillColor: [248, 249, 250] },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      };

      const drawExpenses = () => {
        const expenses = fundsData.expenses || [];
        
        if (expenses.length === 0) return;

        if (yPos > pageHeight - 150) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("CLUB EXPENSES (OUTFLOWS)", margin, yPos);
        yPos += 5;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        const expensesTableData = expenses.map(item => [
          item.transaction_date ? formatDate(new Date(item.transaction_date)) : "N/A",
          `EXP_${safe(item.transaction_id)}`,
          safe(item.title),
          safe(item.description || "-"),
          currency(item.amount || 0)
        ]);

        const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        expensesTableData.push([
          { content: "TOTAL EXPENSES", colSpan: 4, styles: { fontStyle: "bold", fillColor: [240, 240, 240], halign: "right" } },
          { content: currency(totalExpenses), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Ref No", "Title", "Category", "Amount"]],
          body: expensesTableData,
          margin: { left: margin, right: margin },
          theme: "striped",
          headStyles: { 
            fillColor: [231, 76, 60], 
            textColor: 255, 
            fontSize: 9, 
            fontStyle: "bold", 
            halign: "center" 
          },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.15, halign: "center" },
            1: { cellWidth: contentWidth * 0.15, halign: "center" },
            2: { cellWidth: contentWidth * 0.30 },
            3: { cellWidth: contentWidth * 0.20, halign: "center" },
            4: { cellWidth: contentWidth * 0.20, halign: "right", fontStyle: "bold" },
          },
          alternateRowStyles: { fillColor: [248, 249, 250] },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      };

      const drawLoanReleases = () => {
        const loanReleases = fundsData.loanReleases || [];
        
        if (loanReleases.length === 0) return;

        if (yPos > pageHeight - 150) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("LOAN RELEASES (OUTFLOWS)", margin, yPos);
        yPos += 5;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        const loanReleasesTableData = loanReleases.map(item => [
          item.release_date || item.application_date ? formatDate(new Date(item.release_date || item.application_date)) : "N/A",
          safe(item.loan_ref_number),
          safe(item.account_number),
          currency(item.principal || 0)
        ]);

        const totalLoanReleases = loanReleases.reduce((sum, item) => sum + Number(item.principal || 0), 0);
        loanReleasesTableData.push([
          { content: "TOTAL LOAN RELEASES", colSpan: 4, styles: { fontStyle: "bold", fillColor: [240, 240, 240], halign: "right" } },
          { content: currency(totalLoanReleases), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Loan Ref", "Account No", "Amount"]],
          body: loanReleasesTableData,
          margin: { left: margin, right: margin },
          theme: "striped",
          headStyles: { 
            fillColor: [52, 73, 94], 
            textColor: 255, 
            fontSize: 9, 
            fontStyle: "bold", 
            halign: "center" 
          },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.25, halign: "center" },
            1: { cellWidth: contentWidth * 0.25, halign: "center" },
            2: { cellWidth: contentWidth * 0.25, halign: "center" },
            3: { cellWidth: contentWidth * 0.25, halign: "right", fontStyle: "bold" },
          },
          alternateRowStyles: { fillColor: [248, 249, 250] },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      };

      // Generate the PDF
      drawHeader();
      drawFundsSummary();
      drawContributions();
      drawExpenses();
      drawLoanReleases();
      
      // Add footer to all pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        const footerY = pageHeight - margin;
        const currentDate = formatDate(new Date());
        
        doc.text(`Generated on: ${currentDate}`, margin, footerY);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
      }

      const defaultFileName = (() => {
        let name = "club_coop_funds_report";
        if (selectedYear !== 'all') name += `_${selectedYear}`;
        if (selectedMonth !== 'all') {
          const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          name += `_${months[parseInt(selectedMonth) - 1]}`;
        }
        name += `_${dayjs().format('YYYY-MM-DD')}.pdf`;
        return name;
      })();

      const finalFileName = fileName || defaultFileName;

      await new Promise(resolve => setTimeout(resolve, 50));
      doc.save(finalFileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = disabled || isGenerating || !fundsData;

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className={`${className} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      title={title}
      aria-label={label}
    >
      {isGenerating && <span className="loading loading-spinner loading-xs mr-2" />}
      {isGenerating ? "Generating PDF..." : label}
    </button>
  );
}

ExportClubCoopFundsPDF.propTypes = {
  fundsData: PropTypes.shape({
    contributions: PropTypes.arrayOf(PropTypes.object),
    expenses: PropTypes.arrayOf(PropTypes.object),
    loanReleases: PropTypes.arrayOf(PropTypes.object),
    totals: PropTypes.object,
  }),
  fileName: PropTypes.string,
  disabled: PropTypes.bool,
  cooperativeName: PropTypes.string,
  cooperativeAddress: PropTypes.string,
  cooperativeContact: PropTypes.string,
  logoDataUrl: PropTypes.string,
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  selectedYear: PropTypes.string,
  selectedMonth: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  label: PropTypes.string,
};
