import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { useState } from "react";
import PropTypes from "prop-types";

/**
 * ExportIncomeStatementPDF — PDF export button for Income Statement reports.
 * Creates a professionally formatted PDF with summary and detailed transaction data.
 *
 * Props:
 * - incomeData: { summaryData, detailsData, totalIncome }
 * - fileName: optional filename (defaults to derived name)
 * - disabled: disable the button
 * - cooperativeName, cooperativeAddress, cooperativeContact, logoDataUrl: branding
 * - startDate, endDate: reporting period
 * - selectedYear, selectedMonth: filter period info
 */
export default function ExportIncomeStatementPDF({
  incomeData,
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
  title = "Export Income Statement as PDF",
  label = "Export to PDF",
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (!incomeData || (!incomeData.summaryData && !incomeData.detailsData)) {
      alert("Missing income statement data");
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

      // Format category name for display
      const formatCategoryName = (category) => {
        return category?.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || '';
      };

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
        doc.text("INCOME STATEMENT REPORT", pageWidth / 2, yPos + 16, { align: "center" });

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
        
        // Create period text based on filters
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
        
        doc.text(periodText, pageWidth / 2, detailsY, { align: "center" });

        yPos = detailsY + 18;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1.0);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;
      };

      const drawIncomeSummary = () => {
        const summaryData = incomeData.summaryData || [];
        const totalIncome = incomeData.totalIncome || 0;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("INCOME SUMMARY", margin, yPos);
        yPos += 5;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // Prepare summary table data
        const summaryTableData = summaryData.map(item => [
          formatCategoryName(item.category),
          currency(item.total_amount || 0),
          totalIncome > 0 ? `${((item.total_amount / totalIncome) * 100).toFixed(1)}%` : '0.0%'
        ]);

        // Add total row
        summaryTableData.push([
          { content: "TOTAL INCOME", styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
          { content: currency(totalIncome), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
          { content: "100.0%", styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Income Category", "Amount", "Percentage"]],
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
            0: { cellWidth: contentWidth * 0.50, fontStyle: "normal" },
            1: { cellWidth: contentWidth * 0.30, halign: "right", fontStyle: "bold" },
            2: { cellWidth: contentWidth * 0.20, halign: "center" },
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      };

      const drawTransactionDetails = () => {
        const detailsData = incomeData.detailsData || [];
        
        if (detailsData.length === 0) {
          return;
        }

        // Check if we need a new page
        if (yPos > pageHeight - 150) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("TRANSACTION DETAILS", margin, yPos);
        yPos += 5;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;

        // Group transactions by category for better organization
        const groupedData = {};
        detailsData.forEach(item => {
          const category = item.category || 'unknown';
          if (!groupedData[category]) groupedData[category] = [];
          groupedData[category].push(item);
        });

        // Process each category
        Object.entries(groupedData).forEach(([category, transactions]) => {
          // Check if we need a new page for each category
          if (yPos > pageHeight - 200) {
            doc.addPage();
            yPos = margin;
          }

          // Category header
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${formatCategoryName(category)} (${transactions.length} transactions)`, margin, yPos);
          yPos += 15;

          // Prepare transaction data for this category
          const transactionTableData = transactions.map(item => [
            item.transaction_date ? formatDate(new Date(item.transaction_date)) : "N/A",
            safe(item.member_name),
            safe(item.account_number),
            safe(item.loan_ref_number),
            currency(item.amount || 0)
          ]);

          // Add category subtotal
          const categoryTotal = transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
          transactionTableData.push([
            { content: `${formatCategoryName(category)} Subtotal`, colSpan: 4, styles: { fontStyle: "bold", fillColor: [240, 240, 240], halign: "right" } },
            { content: currency(categoryTotal), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [["Date", "Member Name", "Account No", "Loan Reference", "Amount"]],
            body: transactionTableData,
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
              0: { cellWidth: contentWidth * 0.15, halign: "center" },
              1: { cellWidth: contentWidth * 0.25 },
              2: { cellWidth: contentWidth * 0.20, halign: "center" },
              3: { cellWidth: contentWidth * 0.20, halign: "center" },
              4: { cellWidth: contentWidth * 0.20, halign: "right", fontStyle: "bold" },
            },
            alternateRowStyles: { fillColor: [248, 249, 250] },
          });

          yPos = doc.lastAutoTable.finalY + 15;
        });

        // Overall total at the end
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = margin;
        }

        const grandTotal = detailsData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("GRAND TOTAL INCOME:", margin, yPos);
        doc.text(currency(grandTotal), pageWidth - margin, yPos, { align: "right" });
        
        yPos += 20;
      };



      // Generate the PDF
      drawHeader();
      drawIncomeSummary();
      drawTransactionDetails();
      
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

      // Determine filename
      const defaultFileName = (() => {
        let name = "income_statement";
        if (selectedYear !== 'all') name += `_${selectedYear}`;
        if (selectedMonth !== 'all') {
          const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          name += `_${months[parseInt(selectedMonth) - 1]}`;
        }
        name += `_${dayjs().format('YYYY-MM-DD')}.pdf`;
        return name;
      })();

      const finalFileName = fileName || defaultFileName;

      // Save the PDF
      await new Promise(resolve => setTimeout(resolve, 50));
      doc.save(finalFileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = disabled || isGenerating || !incomeData;

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

ExportIncomeStatementPDF.propTypes = {
  incomeData: PropTypes.shape({
    summaryData: PropTypes.arrayOf(PropTypes.object),
    detailsData: PropTypes.arrayOf(PropTypes.object),
    totalIncome: PropTypes.number,
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