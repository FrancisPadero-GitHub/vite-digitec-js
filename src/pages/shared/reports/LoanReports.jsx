import { useState, useMemo } from 'react';
import { useFetchLoanProducts } from "../../../backend/hooks/shared/useFetchLoanProduct";
import { useFetchLoanAcc } from "./../../../backend/hooks/shared/useFetchLoanAcc";
import { useFetchLoanAccView } from "../../../backend/hooks/shared/useFetchLoanAccView"
import { useFetchPaySchedView } from "../../../backend/hooks/shared/useFetchPaySchedView"
import { useFetchLoanPaymentsView } from "../../../backend/hooks/shared/view/useFetchPaymentsView";

// Components
import DataTableV2 from '../components/DataTableV2';
import ExcelExportButton from './components/ExportButton';
import ExportLoanReportsPDF from './components/ExportLoanReportsPDF';
import DateFilterReports from './components/DateFilterReports';

// Logo
import digitecLogo from '../../../assets/digitec-logo.png';

function LoanReports() {
  // Date filter state
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [activeTab, setActiveTab] = useState('active'); // active, schedules, overdue, payments

  const { data: loan_products, isLoading: loanProductsLoading } = useFetchLoanProducts();
  const { data: loan_acc_data, isLoading: loanAccountsLoading } = useFetchLoanAcc({});
  const { data: view_loan_acc_data, isLoading: loanAccViewLoading } = useFetchLoanAccView({});
  const { data: loan_payment_scheds, isLoading: paySchedLoading } = useFetchPaySchedView({});
  const { data: loan_payments_data, isLoading: loanPaymentsLoading } = useFetchLoanPaymentsView({});

  const isLoading = loanProductsLoading || loanAccountsLoading || loanAccViewLoading || paySchedLoading || loanPaymentsLoading;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  // Date filtering logic
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // Loan Account data merged for easy viewing and query
  const loanProducts = loan_products || [];
  const loanAccData = loan_acc_data?.data || [];
  const viewLoanAccData = view_loan_acc_data?.data || [];
  const loanAccountInformation = useMemo(() => {
    return viewLoanAccData.map(viewAcc => {
      const matchingAcc = loanAccData.find(acc => acc.loan_id === viewAcc.loan_id);
      const matchingProduct = loanProducts?.find(prod => prod.product_id === matchingAcc?.product_id) || {};
      return {  ...viewAcc, ...matchingAcc, ...matchingProduct };
    });
  }, [viewLoanAccData, loanAccData, loanProducts]);

  // Payment Schedules
  const paymentSchedules = loan_payment_scheds?.data || [];

  // Loan Payments
  const loanPayments = loan_payments_data?.data || [];

  // Filter active loans by date
  const filteredActiveLoans = useMemo(() => {
    return loanAccountInformation.filter(loan => {
      if (loan.status !== 'Active') return false;
      
      const releaseDate = loan.release_date ? new Date(loan.release_date) : null;
      if (!releaseDate || isNaN(releaseDate.getTime())) return false;
      
      const year = releaseDate.getFullYear().toString();
      const month = (releaseDate.getMonth() + 1).toString();
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const monthMatch = selectedMonth === 'all' || month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [loanAccountInformation, selectedYear, selectedMonth]);

  console.log(filteredActiveLoans);

  // Filter payment schedules by date
  const filteredPaymentSchedules = useMemo(() => {
    return paymentSchedules.filter(sched => {
      const dueDate = sched.due_date ? new Date(sched.due_date) : null;
      if (!dueDate || isNaN(dueDate.getTime())) return false;
      
      const year = dueDate.getFullYear().toString();
      const month = (dueDate.getMonth() + 1).toString();
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const monthMatch = selectedMonth === 'all' || month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [paymentSchedules, selectedYear, selectedMonth]);

  // Filter loan payments by date
  const filteredLoanPayments = useMemo(() => {
    return loanPayments.filter(payment => {
      const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;
      if (!paymentDate || isNaN(paymentDate.getTime())) return false;
      
      const year = paymentDate.getFullYear().toString();
      const month = (paymentDate.getMonth() + 1).toString();
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const monthMatch = selectedMonth === 'all' || month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [loanPayments, selectedYear, selectedMonth]);

  // Overdue Loans
  const overdueLoans = useMemo(() => {
    return loanAccountInformation.filter(loan => {
      const schedulesForThisLoan = paymentSchedules.filter(sched => sched.loan_ref_number === loan.loan_ref_number);
      return schedulesForThisLoan.some(sched => sched.mos_overdue > 0 && sched.paid === false && sched.payment_status === "OVERDUE");
    });
  }, [loanAccountInformation, paymentSchedules]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    // Sum from loan accounts (not filtered individual payments)
    const totalPrincipal = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.principal) || 0), 0);
    const totalInterest = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.total_interest) || 0), 0);
    const totalLoanAmountDue = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.total_amount_due) || 0), 0);
    const totalPaid = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.total_paid) || 0), 0);
    const totalPenalties = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.total_penalty_fees) || 0), 0);
    
    // Remaining amounts (unpaid portions)
    const totalRemainingPrincipal = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.remaining_principal) || 0), 0);
    const totalRemainingInterest = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.remaining_interest) || 0), 0);
    const totalRemainingPenalties = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.remaining_penalty_fees) || 0), 0);
    
    // Outstanding balance includes penalties
    const totalOutstanding = filteredActiveLoans.reduce((sum, loan) => sum + (Number(loan.outstanding_balance) || 0), 0);
    
    // Calculate what's actually owed from original loan (excluding penalties)
    const totalOutstandingExcludingPenalties = totalLoanAmountDue - totalPaid;
    
    // Overdue calculations
    const totalOverdueAmount = overdueLoans.reduce((sum, loan) => sum + (Number(loan.outstanding_balance) || 0), 0);
    const totalOverduePenalties = overdueLoans.reduce((sum, loan) => sum + (Number(loan.remaining_penalty_fees) || 0), 0);
    
    return {
      totalActiveLoans: filteredActiveLoans.length,
      totalPrincipal,
      totalInterest,
      totalLoanAmountDue,
      totalPaid,
      totalOutstanding,
      totalOutstandingExcludingPenalties,
      totalRemainingPrincipal,
      totalRemainingInterest,
      totalRemainingPenalties,
      totalPenalties,
      totalOverdueLoans: overdueLoans.length,
      totalOverdueAmount,
      totalOverduePenalties,
    };
  }, [filteredActiveLoans, overdueLoans]);

  // Prepare data for PDF export
  const preparePDFData = () => {
    return {
      activeLoans: filteredActiveLoans,
      paymentSchedules: filteredPaymentSchedules,
      overdueLoans: overdueLoans,
      summary: summary,
    };
  };

  // Prepare data for Excel export
  const prepareExcelData = () => {
    // Active Loans sheet
    const activeLoansSheet = [
      ...filteredActiveLoans.map(loan => ({
        "Loan Ref": loan.loan_ref_number || "",
        "Account No": loan.account_number || "",
        "Product Name": loan.name || "",
        "Principal": Number(loan.principal || 0).toFixed(2),
        "Interest Rate": `${loan.interest_rate}%`,
        "Term (Months)": loan.loan_term_approved || "",
        "Release Date": loan.release_date ? new Date(loan.release_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }) : "",
        "Maturity Date": loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }) : "",
        "Outstanding Balance": Number(loan.outstanding_balance || 0).toFixed(2),
        "Status": loan.status || "",
      })),
      { __type: "gap" },
      {
        __type: "total",
        label: "Total Active Loans",
        value: filteredActiveLoans.length
      },
      {
        __type: "total",
        label: "Total Principal",
        value: summary.totalPrincipal.toFixed(2)
      },
      {
        __type: "total",
        label: "Total Outstanding",
        value: summary.totalOutstanding.toFixed(2)
      },
    ];

    // Payment Schedules sheet
    const paymentSchedulesSheet = [
      ...filteredPaymentSchedules.map(sched => ({
        "Loan Ref": sched.loan_ref_number || "",
        "Member": sched.full_name || "",
        "Installment": sched.installment_no || "",
        "Due Date": sched.due_date ? new Date(sched.due_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }) : "",
        "Principal Due": Number(sched.principal_due || 0).toFixed(2),
        "Interest Due": Number(sched.interest_due || 0).toFixed(2),
        "Fee Due": Number(sched.fee_due || 0).toFixed(2),
        "Total Due": Number(sched.total_due || 0).toFixed(2),
        "Status": sched.payment_status || "",
        "Paid": sched.paid ? "Yes" : "No",
        "Paid Date": sched.paid_at ? new Date(sched.paid_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }) : "",
      })),
    ];

    // Overdue Loans sheet
    const overdueLoansSheet = [
      ...overdueLoans.map(loan => ({
        "Loan Ref": loan.loan_ref_number || "",
        "Account No": loan.account_number || "",
        "Product Name": loan.name || "",
        "Principal": Number(loan.principal || 0).toFixed(2),
        "Outstanding Balance": Number(loan.outstanding_balance || 0).toFixed(2),
        "Maturity Date": loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }) : "",
        "Penalty Fees": Number(loan.remaining_penalty_fees || 0).toFixed(2),
      })),
      { __type: "gap" },
      {
        __type: "total",
        label: "Total Overdue Loans",
        value: overdueLoans.length
      },
      {
        __type: "total",
        label: "Total Overdue Amount",
        value: summary.totalOverdueAmount.toFixed(2)
      },
    ];

    // Loan Payments sheet
    const loanPaymentsSheet = [
      ...filteredLoanPayments.map(payment => ({
        "Receipt No": payment.receipt_no || "",
        "Loan Ref": payment.loan_ref_number || "",
        "Member": payment.full_name || "",
        "Account No": payment.account_number || "",
        "Payment Date": payment.payment_date ? new Date(payment.payment_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }) : "",
        "Principal": Number(payment.principal || 0).toFixed(2),
        "Interest": Number(payment.interest || 0).toFixed(2),
        "Fees": Number(payment.fees || 0).toFixed(2),
        "Total Amount": Number(payment.total_amount || 0).toFixed(2),
        "Payment Method": payment.payment_method || "",
        "Status": payment.status || "",
      })),
    ];

    return {
      "Active Loans": activeLoansSheet,
      "Payment Schedules": paymentSchedulesSheet,
      "Overdue Loans": overdueLoansSheet,
      "Loan Payments": loanPaymentsSheet,
    };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Loan Reports</h1>
        {!isLoading && filteredActiveLoans.length > 0 && (
          <div className="flex gap-2">
            <ExportLoanReportsPDF
              loanData={preparePDFData()}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              cooperativeName="DigiTEC | ECTEC Multi-Purpose Cooperative"
              cooperativeAddress= "Trinitas Bugo, Cagayan de Oro City"
              cooperativeContact= "Contact: 09123456789 | Email: eaglesclubectec@gmail.com"
              logoDataUrl={digitecLogo}
            />
            <ExcelExportButton
              data={prepareExcelData()}
              fileName={`loan_reports_${new Date().toISOString().slice(0, 10)}.xlsx`}
              sheetName='Loan Reports'
            />
          </div>
        )}
      </div>

      {/* Date Filter */}
      <DateFilterReports
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={(v) => setSelectedYear(v)}
        onMonthChange={(v) => setSelectedMonth(v)}
        yearOptions={yearOptions}
        months={months}
        onClear={() => {
          setSelectedYear('all');
          setSelectedMonth('all');
        }}
      />

      {/* Summary Cards */}
      {!isLoading && (
        <div className="space-y-6">
          {/* Top Row - Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Active Loans</div>
              <div className="text-3xl font-bold text-blue-600">{summary.totalActiveLoans}</div>
              <div className="text-xs text-gray-500 mt-1">Total loan accounts</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Total Principal Released</div>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(summary.totalPrincipal)}</div>
              <div className="text-xs text-gray-500 mt-1">Amount disbursed</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500">
              <div className="text-sm text-gray-600 mb-1">Total Interest</div>
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(summary.totalInterest)}</div>
              <div className="text-xs text-gray-500 mt-1">Total interest charges</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-indigo-500">
              <div className="text-sm text-gray-600 mb-1">Total Repayable Amount</div>
              <div className="text-3xl font-bold text-indigo-600">{formatCurrency(summary.totalLoanAmountDue)}</div>
              <div className="text-xs text-gray-500 mt-1">Principal + Interest</div>
            </div>
          </div>

          {/* Middle Row - Payment Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-teal-500">
              <div className="text-sm text-gray-600 mb-1">Total Payments Made</div>
              <div className="text-3xl font-bold text-teal-600">{formatCurrency(summary.totalPaid)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {summary.totalLoanAmountDue > 0 
                  ? `${((summary.totalPaid / summary.totalLoanAmountDue) * 100).toFixed(1)}% of total repayable`
                  : '0% of total repayable'}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-orange-500">
              <div className="text-sm text-gray-600 mb-1">Outstanding Balance</div>
              <div className="text-3xl font-bold text-orange-600">{formatCurrency(summary.totalOutstanding)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(summary.totalOutstandingExcludingPenalties)} + {formatCurrency(summary.totalRemainingPenalties)} penalties
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-amber-500">
              <div className="text-sm text-gray-600 mb-1">Total Penalties</div>
              <div className="text-3xl font-bold text-amber-600">{formatCurrency(summary.totalPenalties)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(summary.totalRemainingPenalties)} remaining
              </div>
            </div>
          </div>

          {/* Bottom Row - Overdue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg shadow-md p-5 border-l-4 border-red-500">
              <div className="text-sm text-red-700 font-semibold mb-1">⚠️ Overdue Loans</div>
              <div className="text-3xl font-bold text-red-600">{summary.totalOverdueLoans}</div>
              <div className="text-xs text-red-600 mt-1">
                {summary.totalActiveLoans > 0 
                  ? `${((summary.totalOverdueLoans / summary.totalActiveLoans) * 100).toFixed(1)}% of active loans`
                  : '0% of active loans'}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-md p-5 border-l-4 border-red-600">
              <div className="text-sm text-red-700 font-semibold mb-1">Overdue Amount</div>
              <div className="text-3xl font-bold text-red-700">{formatCurrency(summary.totalOverdueAmount)}</div>
              <div className="text-xs text-red-600 mt-1">Total balance overdue</div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-md p-5 border-l-4 border-red-700">
              <div className="text-sm text-red-700 font-semibold mb-1">Overdue Penalties</div>
              <div className="text-3xl font-bold text-red-800">{formatCurrency(summary.totalOverduePenalties)}</div>
              <div className="text-xs text-red-600 mt-1">Penalty fees on overdue</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-white shadow mb-6">
        <a 
          className={`tab ${activeTab === 'active' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Loans ({filteredActiveLoans.length})
        </a>
        <a 
          className={`tab ${activeTab === 'schedules' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          Payment Schedules ({filteredPaymentSchedules.length})
        </a>
        <a 
          className={`tab ${activeTab === 'overdue' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue Loans ({overdueLoans.length})
        </a>
        <a 
          className={`tab ${activeTab === 'payments' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Loan Payments ({filteredLoanPayments.length})
        </a>
      </div>

      {/* Active Loans Table */}
      {activeTab === 'active' && (
        <DataTableV2
          title="Active Loans"
          subtext="List of all active loan accounts"
          headers={[
            "Loan Ref",
            "Account No",
            "Product",
            "Principal",
            "Interest Rate",
            "Term",
            "Release Date",
            "Maturity Date",
            "Outstanding",
            "Status"
          ]}
          data={filteredActiveLoans}
          isLoading={isLoading}
          renderRow={(loan) => (
            <tr key={loan.loan_id} className="hover">
              <td className="text-center">{loan.loan_ref_number}</td>
              <td className="text-center">{loan.account_number}</td>
              <td className="text-center">{loan.name}</td>
              <td className="text-right">{formatCurrency(loan.principal)}</td>
              <td className="text-center">{loan.interest_rate}%</td>
              <td className="text-center">{loan.loan_term_approved} mos</td>
              <td className="text-center">
                {loan.release_date ? new Date(loan.release_date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="text-center">
                {loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="text-right">{formatCurrency(loan.outstanding_balance)}</td>
              <td className="text-center">
                <span className="badge badge-success badge-sm">{loan.status}</span>
              </td>
            </tr>
          )}
        />
      )}

      {/* Payment Schedules Table */}
      {activeTab === 'schedules' && (
        <DataTableV2
          title="Payment Schedules"
          subtext="All payment schedules for active loans"
          headers={[
            "Loan Ref",
            "Member",
            "Inst #",
            "Due Date",
            "Principal",
            "Interest",
            "Fee",
            "Total Due",
            "Status",
            "Paid Date"
          ]}
          data={filteredPaymentSchedules}
          isLoading={isLoading}
          renderRow={(sched) => (
            <tr key={sched.schedule_id} className="hover">
              <td className="text-center">{sched.loan_ref_number}</td>
              <td className="text-center">{sched.full_name}</td>
              <td className="text-center">{sched.installment_no}</td>
              <td className="text-center">
                {sched.due_date ? new Date(sched.due_date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="text-right">{formatCurrency(sched.principal_due)}</td>
              <td className="text-right">{formatCurrency(sched.interest_due)}</td>
              <td className="text-right">{formatCurrency(sched.fee_due)}</td>
              <td className="text-right">{formatCurrency(sched.total_due)}</td>
              <td className="text-center">
                <span className={`badge badge-sm ${
                  sched.payment_status === 'PAID' ? 'badge-success' :
                  sched.payment_status === 'OVERDUE' ? 'badge-error' :
                  'badge-warning'
                }`}>
                  {sched.payment_status}
                </span>
              </td>
              <td className="text-center">
                {sched.paid_at ? new Date(sched.paid_at).toLocaleDateString() : '-'}
              </td>
            </tr>
          )}
        />
      )}

      {/* Overdue Loans Table */}
      {activeTab === 'overdue' && (
        <DataTableV2
          title="Overdue Loans"
          subtext="Loans with overdue payments"
          headers={[
            "Loan Ref",
            "Account No",
            "Product",
            "Principal",
            "Outstanding",
            "Maturity Date",
            "Penalty Fees"
          ]}
          data={overdueLoans}
          isLoading={isLoading}
          renderRow={(loan) => (
            <tr key={loan.loan_id} className="hover bg-red-50">
              <td className="text-center">{loan.loan_ref_number}</td>
              <td className="text-center">{loan.account_number}</td>
              <td className="text-center">{loan.name}</td>
              <td className="text-right">{formatCurrency(loan.principal)}</td>
              <td className="text-right">{formatCurrency(loan.outstanding_balance)}</td>
              <td className="text-center">
                {loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="text-right text-red-600 font-semibold">
                {formatCurrency(loan.remaining_penalty_fees)}
              </td>
            </tr>
          )}
        />
      )}

      {/* Loan Payments Table */}
      {activeTab === 'payments' && (
        <DataTableV2
          title="Loan Payments"
          subtext="Payment transaction history"
          headers={[
            "Receipt No",
            "Loan Ref",
            "Member",
            "Payment Date",
            "Principal",
            "Interest",
            "Fees",
            "Total Amount",
            "Method",
            "Status"
          ]}
          data={filteredLoanPayments}
          isLoading={isLoading}
          renderRow={(payment) => (
            <tr key={payment.payment_id} className="hover">
              <td className="text-center">{payment.receipt_no}</td>
              <td className="text-center">{payment.loan_ref_number}</td>
              <td className="text-center">{payment.full_name}</td>
              <td className="text-center">
                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="text-right">{formatCurrency(payment.principal)}</td>
              <td className="text-right">{formatCurrency(payment.interest)}</td>
              <td className="text-right">{formatCurrency(payment.fees)}</td>
              <td className="text-right font-semibold">{formatCurrency(payment.total_amount)}</td>
              <td className="text-center">{payment.payment_method}</td>
              <td className="text-center">
                <span className="badge badge-success badge-sm">{payment.status}</span>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  )
}

export default LoanReports
