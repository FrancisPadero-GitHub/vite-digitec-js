import { useState, useMemo } from 'react'

// fetch hooks
import { useFetchCoopView } from '../../../backend/hooks/shared/view/useFetchCoopView'
import { useFetchClubFundsView } from '../../../backend/hooks/shared/view/useFetchClubFundsView'
import { useFetchExpenses } from '../../../backend/hooks/shared/useFetchExpenses'
import { useFetchLoanAccView } from '../../../backend/hooks/shared/useFetchLoanAccView'
import { useFetchTotal } from '../../../backend/hooks/shared/useFetchTotal'

// components
import ExcelExportButton from './components/ExcelExportButton'
import ExportClubCoopFundsPDF from './components/ExportClubCoopFundsPDF'
import DataTableV2 from '../components/DataTableV2'
import DateFilterReports from './components/DateFilterReports'

// Logo
import digitecLogo from '../../../assets/digitec-logo.png'

function ClubCoopFunds() {
  // Date filter state
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Fetch data
  const { data: coopData, isLoading: coopLoading, isError: coopError } = useFetchCoopView({});
  const { data: clubFundsData, isLoading: clubFundsLoading, isError: clubFundsError } = useFetchClubFundsView({});
  const { data: expensesData, isLoading: expensesLoading, isError: expensesError } = useFetchExpenses({});
  const { data: loanAccData, isLoading: loanAccLoading, isError: loanAccError } = useFetchLoanAccView({});


  // Fetch totals summary
  const { data: currentSummary, isLoading: summaryLoading } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: selectedYear === 'all' ? null : parseInt(selectedYear),
    month: selectedMonth === 'all' ? null : parseInt(selectedMonth),
    key: "funds-summary-current",
  });

  const isLoading = coopLoading || clubFundsLoading || expensesLoading || loanAccLoading || summaryLoading;
  const isError = coopError || clubFundsError || expensesError || loanAccError;

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

  // Filter contributions (coop + club funds)
  const filteredContributions = useMemo(() => {
    const coopContribs = (coopData?.data || []).map(item => ({
      ...item,
      contribution_date: item.contribution_date,
      fund_type: 'Share Capital',
      member_name: item.full_name
    }));
    
    const clubContribs = (clubFundsData?.data || []).map(item => ({
      ...item,
      contribution_date: item.payment_date,
      fund_type: 'Club Fund',
      member_name: item.full_name
    }));

    const allContribs = [...coopContribs, ...clubContribs];

    return allContribs.filter(item => {
      const d = item.contribution_date || item.payment_date ? new Date(item.contribution_date || item.payment_date) : null;
      if (!d || isNaN(d.getTime())) return false;
      const year = d.getFullYear().toString();
      const month = (d.getMonth() + 1).toString();
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const monthMatch = selectedMonth === 'all' || month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [coopData, clubFundsData, selectedYear, selectedMonth]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    const items = expensesData?.data || [];
    return items.filter(item => {
      const d = item.transaction_date ? new Date(item.transaction_date) : null;
      if (!d || isNaN(d.getTime())) return false;
      const year = d.getFullYear().toString();
      const month = (d.getMonth() + 1).toString();
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const monthMatch = selectedMonth === 'all' || month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [expensesData, selectedYear, selectedMonth]);

  // Filter loan releases (released loans)
  const filteredLoanReleases = useMemo(() => {
    const items = loanAccData?.data || [];
    return items.filter(item => {
      // filter only released loans that is active and not closed
      if (item.status !== 'Active' && item.release_date != null) return false;
      const d = item.release_date || item.application_date ? new Date(item.release_date || item.application_date) : null;
      if (!d || isNaN(d.getTime())) return false;
      const year = d.getFullYear().toString();
      const month = (d.getMonth() + 1).toString();
      const yearMatch = selectedYear === 'all' || year === selectedYear;
      const monthMatch = selectedMonth === 'all' || month === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [loanAccData, selectedYear, selectedMonth]);

  // Calculate totals
  const shareCapitalContributions = currentSummary?.club_total_coop || 0;
  const clubFundContributions = currentSummary?.club_balance || 0;
  const totalExpenses = currentSummary?.club_total_expenses || 0;
  const totalLoanReleases = currentSummary?.coop_total_principal_released || 0;
  const cashOnHand = currentSummary?.overall_total_cash || 0;

  // Prepare PDF data
  const preparePDFData = () => {
    return {
      contributions: filteredContributions,
      expenses: filteredExpenses,
      loanReleases: filteredLoanReleases,
      totals: {
        shareCapitalContributions,
        clubFundContributions,
        totalExpenses,
        totalLoanReleases,
        cashOnHand
      }
    };
  };

  // Prepare Excel data
  const prepareExcelData = () => {
    // Contributions sheet
    const contributionsSheet = [
      ...filteredContributions.map(item => ({
        Date: item.contribution_date
          ? new Date(item.contribution_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
          : "",
        "Member Name": item.member_name || "",
        "Account Number": item.account_number || "",
        "Fund Type": item.fund_type || "",
        Amount: Number(item.amount || 0).toFixed(2)
      })),
      { __type: "gap" },
      { __type: "gap" },
      {
        __type: "total",
        label: "Total Contributions",
        value: shareCapitalContributions.toFixed(2)
      }
    ];

    // Expenses sheet
    const expensesSheet = [
      ...filteredExpenses.map(item => ({
        Date: item.transaction_date
          ? new Date(item.transaction_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
          : "",
        "Ref No": item.transaction_id ? `EXP_${item.transaction_id}` : "",
        Title: item.title || "",
        Category: item.description || "-",
        Amount: Number(item.amount || 0).toFixed(2)
      })),
      { __type: "gap" },
      { __type: "gap" },
      {
        __type: "total",
        label: "Total Expenses",
        value: totalExpenses.toFixed(2)
      }
    ];

    // Loan Releases sheet
    const loanReleasesSheet = [
      ...filteredLoanReleases.map(item => ({
        Date: (item.release_date || item.application_date)
          ? new Date(item.release_date || item.application_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
          : "",
        "Loan Ref": item.loan_ref_number || "",
        "Account NO": item.account_number || "",
        Amount: Number(item.principal || item.loan_amount || 0).toFixed(2)
      })),
      { __type: "gap" },
      { __type: "gap" },
      {
        __type: "total",
        label: "Total Loan Releases",
        value: totalLoanReleases.toFixed(2)
      }
    ];

    // Summary sheet
    const summarySheet = [
      {
        Description: "Share Capital Contributions (Inflow)",
        Amount: shareCapitalContributions.toFixed(2)
      },
      {
        Description: "Total Loan Releases (Outflow)",
        Amount: totalLoanReleases.toFixed(2)
      },
      {
        Description: "Club Fund Contributions (Inflow)",
        Amount: clubFundContributions.toFixed(2)
      },
      {
        Description: "Total Expenses (Outflow)",
        Amount: totalExpenses.toFixed(2)
      },
      { __type: "gap" },
      {
        __type: "total",
        label: "Net Cash Flow",
        value: (shareCapitalContributions + clubFundContributions - totalExpenses - totalLoanReleases).toFixed(2)
      },
      { __type: "gap" },
      {
        __type: "total",
        label: "Cash on Hand / General Fund",
        value: Number(cashOnHand || 0).toFixed(2)
      }
    ];

    return {
      Summary: summarySheet,
      Contributions: contributionsSheet,
      Expenses: expensesSheet,
      "Loan Releases": loanReleasesSheet
    };
  };

  return (
    <div className="px-2 sm:px-4 lg:px-6 min-h-screen py-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Club/Coop Funds Report</h1>
        {!isLoading && (filteredContributions?.length > 0 || filteredExpenses?.length > 0 || filteredLoanReleases?.length > 0) && (
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <ExportClubCoopFundsPDF
              fundsData={preparePDFData()}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              cooperativeName="DigiTEC | ECTEC Multi-Purpose Cooperative"
              cooperativeAddress="123 Cooperative Street, City, Province"
              cooperativeContact="Tel: +63 123 456 7890 | Email: info@digiteccoop.com"
              logoDataUrl={digitecLogo}
            />
            <ExcelExportButton
              data={prepareExcelData()}
              fileName={`club_coop_funds_${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`}
              sheetName='Funds Report'
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
        onClear={() => { setSelectedYear('all'); setSelectedMonth('all'); }}
      />

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-8 sm:py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <>
            {/* Share Capital Contributions Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide">Share Capital</h3>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatCurrency(shareCapitalContributions)}</p>
              <p className="text-xs sm:text-sm mt-2 opacity-80">Inflows</p>
            </div>

            {/* Total Loan Releases Card */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide">Loan Releases</h3>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatCurrency(totalLoanReleases)}</p>
              <p className="text-xs sm:text-sm mt-2 opacity-80">Outflows</p>
            </div>

            {/* Club Fund Contributions Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide">Club Funds</h3>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatCurrency(clubFundContributions)}</p>
              <p className="text-xs sm:text-sm mt-2 opacity-80">Inflows</p>
            </div>

            {/* Total Expenses Card */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide">Expenses</h3>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs sm:text-sm mt-2 opacity-80">Outflows</p>
            </div>

            {/* Cash on Hand Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 col-span-full xs:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide">Cash on Hand</h3>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatCurrency(cashOnHand)}</p>
              <p className="text-xs sm:text-sm mt-2 opacity-80">General Fund</p>
            </div>
          </>
        )}
      </div>

      {/* Contributions Section */}
      <div className="rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
          Fund Contributions (Inflows)
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <DataTableV2
            showLinkPath={false}
            headers={["Date", "Member Name", "Account No", "Fund Type", "Amount"]}
            data={filteredContributions}
            isLoading={isLoading}
            isError={isError}
            renderRow={(item, idx) => {
              const date = new Date(item.contribution_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const amount = formatCurrency(item.amount);

              return (
                <tr key={idx}>
                  <td className="text-center text-xs sm:text-sm">{date}</td>
                  <td className="text-center text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{item.member_name}</td>
                  <td className="text-center text-xs sm:text-sm">{item.account_number}</td>
                  <td className="text-center text-xs sm:text-sm">{item.fund_type}</td>
                  <td className="text-center text-xs sm:text-sm">{amount}</td>
                </tr>
              )
            }}
          />
        )}
      </div>

      {/* Expenses Section */}
      <div className="rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
          Club Expenses (Outflows)
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <DataTableV2
            showLinkPath={false}
            headers={["Date", "Ref No", "Title", "Category", "Amount"]}
            data={filteredExpenses}
            isLoading={isLoading}
            isError={isError}
            renderRow={(item, idx) => {
              const date = new Date(item.transaction_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const amount = formatCurrency(item.amount);
              const TABLE_PREFIX = "EXP"
              return (
                <tr key={idx}>
                  <td className="text-center text-xs sm:text-sm">{date}</td>
                  <td className="text-center text-xs sm:text-sm">{TABLE_PREFIX}_{item.transaction_id}</td>
                  <td className="text-center text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{item.title}</td>
                  <td className="text-center text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{item.description || "-"}</td>
                  <td className="text-center text-xs sm:text-sm">{amount}</td>
                </tr>
              )
            }}
          />
        )}
      </div>

      {/* Loan Releases Section */}
      <div className="rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
          Loan Releases (Outflows)
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <DataTableV2
            showLinkPath={false}
            headers={["Date", "Loan Ref", "Account No", "Principal"]}
            data={filteredLoanReleases}
            isLoading={isLoading}
            isError={isError}
            renderRow={(item, idx) => {
              const date = new Date(item.release_date || item.application_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const amount = formatCurrency(item.principal);

              return (
                <tr key={idx}>
                  <td className="text-center text-xs sm:text-sm">{date}</td>
                  <td className="text-center text-xs sm:text-sm">{item.loan_ref_number}</td>
                  <td className="text-center text-xs sm:text-sm">{item.account_number}</td>
                  <td className="text-center text-xs sm:text-sm">{amount}</td>
                </tr>
              )
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ClubCoopFunds