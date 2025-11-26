import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

/**
 * Create a professional member financial statement PDF following industry standards.
 * Includes: member information, share capital, loan accounts, payments, and summary.
 * 
 * @param {Object} statementData - Complete member financial data
 * @param {Object} statementData.member - Member basic information
 * @param {string} statementData.member.account_number - Account number
 * @param {string} statementData.member.full_name - Full name
 * @param {string} statementData.member.email - Email address
 * @param {string} statementData.member.contact_number - Contact number
 * @param {string} statementData.member.account_role - Member role
 * @param {string} statementData.member.account_status - Account status
 * @param {Array} statementData.shareCapital - Share capital transactions
 * @param {Array} statementData.loanAccounts - Active/closed loan accounts
 * @param {Array} statementData.payments - Payment history
 * @param {Array} statementData.clubFunds - Club fund contributions
 * @param {Object} statementData.summary - Financial summary totals
 * @param {Object} [opts] - Optional configuration
 * @param {Date} [opts.startDate] - Statement period start date
 * @param {Date} [opts.endDate] - Statement period end date (defaults to today)
 * @param {string} [opts.cooperativeName="Cooperative Organization"] - Organization name
 * @param {string} [opts.cooperativeAddress] - Organization address
 * @param {string} [opts.cooperativeContact] - Organization contact info
 * @param {string} [opts.logoDataUrl] - Optional base64 logo image
 * @param {boolean} [opts.openInsteadOfSave=false] - Return blob URL instead of saving
 * @returns {string|undefined} Blob URL when openInsteadOfSave=true, otherwise saves file
 */
export function createMemberStatementPDF(statementData, opts = {}) {
  const {
    startDate,
    endDate = new Date(),
    cooperativeName = "Cooperative Organization",
    cooperativeAddress = "",
    cooperativeContact = "",
    logoDataUrl,
    openInsteadOfSave = false
  } = opts;

  if (!statementData || !statementData.member) {
    throw new Error("Missing statement data or member information for PDF generation.");
  }

  const doc = new jsPDF({ unit: "pt", format: "letter" }); // Standard US Letter
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  // Formatting helpers
  const currency = (v) => `PHP ${Number(v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const safe = (v, fallback = "N/A") => (v === null || v === undefined || v === "" ? fallback : String(v));
  const formatDate = (d) => d ? dayjs(d).format("MMM DD, YYYY") : "N/A";

  let yPos = margin;

  // ==================== HEADER SECTION ====================
  const drawHeader = () => {
    // Logo (if provided) on the left
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

    // Title at the very top, centered
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("MEMBER FINANCIAL STATEMENT", pageWidth / 2, yPos + 16, { align: "center" });

    // Organization details below title on new lines, centered
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

    // Statement period centered below details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const periodText = startDate 
      ? `Period: ${formatDate(startDate)} to ${formatDate(endDate)}`
      : `As of ${formatDate(endDate)}`;
    doc.text(periodText, pageWidth / 2, detailsY, { align: "center" });

    // Advance Y cursor below header block
    yPos = detailsY + 18;

    // Divider line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;
  };

  drawHeader();

  // ==================== MEMBER INFORMATION SECTION ====================
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
      ["Statement Date:", formatDate(new Date())]
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

  drawMemberInfo();

  // ==================== FINANCIAL SUMMARY SECTION ====================
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
      ["Member Equity", currency(summary.memberEquity || 0)]
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
        0: { cellWidth: contentWidth * 0.65, fontStyle: "normal" },
        1: { cellWidth: contentWidth * 0.35, halign: "right", fontStyle: "bold" }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    yPos = doc.lastAutoTable.finalY + 20;
  };

  drawFinancialSummary();

  // ==================== SHARE CAPITAL SECTION ====================
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
      const shareTableData = shareCapital.map(tx => [
        formatDate(tx.transaction_date),
        safe(tx.transaction_type),
        safe(tx.description, "-"),
        currency(tx.amount)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Date", "Type", "Description", "Amount"]],
        body: shareTableData,
        margin: { left: margin, right: margin },
        theme: "grid",
        headStyles: { 
          fillColor: [52, 152, 219], 
          textColor: 255, 
          fontSize: 9, 
          fontStyle: "bold",
          halign: "center"
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 80, halign: "center" },
          1: { cellWidth: 80, halign: "center" },
          2: { cellWidth: contentWidth - 240 },
          3: { cellWidth: 80, halign: "right", fontStyle: "bold" }
        }
      });

      yPos = doc.lastAutoTable.finalY + 20;
    }
  };

  drawShareCapital();

  // ==================== LOAN ACCOUNTS SECTION ====================
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
      const loanTableData = loanAccounts.map(loan => [
        safe(loan.loan_ref_number),
        safe(loan.loan_type),
        formatDate(loan.application_date),
        currency(loan.loan_amount),
        currency(loan.outstanding_balance || 0),
        safe(loan.loan_status)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Loan Ref", "Type", "Date", "Principal", "Outstanding", "Status"]],
        body: loanTableData,
        margin: { left: margin, right: margin },
        theme: "grid",
        headStyles: { 
          fillColor: [231, 76, 60], 
          textColor: 255, 
          fontSize: 8, 
          fontStyle: "bold",
          halign: "center"
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 75, halign: "center" },
          1: { cellWidth: 70 },
          2: { cellWidth: 70, halign: "center" },
          3: { cellWidth: 75, halign: "right" },
          4: { cellWidth: 75, halign: "right", fontStyle: "bold" },
          5: { cellWidth: 60, halign: "center" }
        }
      });

      yPos = doc.lastAutoTable.finalY + 20;
    }
  };

  drawLoanAccounts();

  // ==================== PAYMENT HISTORY SECTION ====================
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
      const paymentTableData = payments.slice(0, 20).map(pmt => [ // Limit to last 20 payments
        formatDate(pmt.payment_date),
        safe(pmt.loan_ref_number, "-"),
        currency(pmt.principal || 0),
        currency(pmt.interest || 0),
        currency(pmt.fees || 0),
        currency(pmt.total_amount || 0),
        safe(pmt.payment_method)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Date", "Loan Ref", "Principal", "Interest", "Fees", "Total", "Method"]],
        body: paymentTableData,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { 
          fillColor: [46, 204, 113], 
          textColor: 255, 
          fontSize: 8, 
          fontStyle: "bold",
          halign: "center"
        },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 60, halign: "center" },
          1: { cellWidth: 65, halign: "center" },
          2: { cellWidth: 60, halign: "right" },
          3: { cellWidth: 55, halign: "right" },
          4: { cellWidth: 50, halign: "right" },
          5: { cellWidth: 65, halign: "right", fontStyle: "bold" },
          6: { cellWidth: 70, halign: "center" }
        },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      if (payments.length > 20) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(`Showing last 20 of ${payments.length} payments. Contact office for complete history.`, 
          margin, doc.lastAutoTable.finalY + 10);
      }

      yPos = doc.lastAutoTable.finalY + 20;
    }
  };

  drawPaymentHistory();

  // ==================== CLUB FUNDS SECTION ====================
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
      const clubTableData = clubFunds.map(cf => [
        formatDate(cf.contribution_date),
        safe(cf.fund_type),
        safe(cf.purpose, "-"),
        currency(cf.amount),
        safe(cf.status)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Date", "Fund Type", "Purpose", "Amount", "Status"]],
        body: clubTableData,
        margin: { left: margin, right: margin },
        theme: "grid",
        headStyles: { 
          fillColor: [142, 68, 173], 
          textColor: 255, 
          fontSize: 9, 
          fontStyle: "bold",
          halign: "center"
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 75, halign: "center" },
          1: { cellWidth: 80 },
          2: { cellWidth: contentWidth - 280 },
          3: { cellWidth: 75, halign: "right", fontStyle: "bold" },
          4: { cellWidth: 50, halign: "center" }
        }
      });

      yPos = doc.lastAutoTable.finalY + 20;
    }
  };

  drawClubFunds();

  // ==================== FOOTER & DISCLAIMERS ====================
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
      `Generated on: ${dayjs().format("MMMM DD, YYYY [at] hh:mm A")}`
    ];

    disclaimers.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 12;
    });

    // Page numbers on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 20,
        { align: "center" }
      );
    }
  };

  drawFooter();

  // ==================== OUTPUT ====================
  if (openInsteadOfSave) {
    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  }

  const filename = `Member_Statement_${statementData.member.account_number}_${dayjs(endDate).format("YYYY-MM-DD")}.pdf`;
  doc.save(filename);
}
