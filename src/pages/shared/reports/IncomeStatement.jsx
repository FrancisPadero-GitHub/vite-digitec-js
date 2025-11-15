import React, { useState, useMemo } from 'react'

// fetch hooks
import { useIncomeStatementDetails } from '../../../backend/hooks/shared/view/useIncomeStatementDetails'
import { useIncomeStatementSummary } from '../../../backend/hooks/shared/view/useIncomeStatementSummary'

// component
import ExcelExportButton from './components/ExportButton'
import DataTableV2 from '../components/DataTableV2'
import DateFilterReports from './components/DateFilterReports'

/**
 * Service_fee - loan accounts
 * interest_income - loan payments
 * penalty_income - loan payments
 */

function IncomeStatement() {
  // Date filter state
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const { data: summaryData, isLoading: summaryLoading, isError: summaryError } = useIncomeStatementSummary({ year: selectedYear, month: selectedMonth });
  const { data: detailsData, isLoading: detailsLoading, isError: detailsError } = useIncomeStatementDetails();

  const isLoading = summaryLoading || detailsLoading;
  const isError = summaryError || detailsError;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  // Calculate total income
  const totalIncome = (summaryData || []).reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0) || 0;

  // Format category name for display
  const formatCategoryName = (category) => {
    return category?.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || '';
  };

  // Prepare Excel data for export - uses filtered data
  const prepareExcelData = () => {
    // Use filteredDetails and filteredSummary which respect the date filters
    const detailsToExport = filteredDetails || [];
    const summaryToExport = filteredSummary.length > 0 ? filteredSummary : (summaryData || []);

    // clean and format details
    const detailsSheet = detailsToExport.map(item => ({
      Date: item.transaction_date
        ? new Date(item.transaction_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        : "",
      "Member Name": item.member_name || "",
      "Account Number": item.account_number || "",
      "Loan Reference": item.loan_ref_number || "",
      Category: formatCategoryName(item.category),
      Amount: Number(item.amount || 0).toFixed(2),
    }));
    
    // clean and format summary
    const summarySheet = summaryToExport.map(item => ({
      Category: formatCategoryName(item.category),
      "Total Amount": Number(item.total_amount || 0).toFixed(2),
    }));

    // Ensure no duplicated header rows are manually added
    return {
      Details: detailsSheet,
      Summary: summarySheet,
    };
  };

    // --------------------------------------------------------------------------------
    // Date filtering logic
    // --------------------------------------------------------------------------------
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

    const filteredDetails = useMemo(() => {
      const items = detailsData || [];
      return items.filter(item => {
        const d = item.transaction_date ? new Date(item.transaction_date) : null;
        if (!d || isNaN(d.getTime())) return false;
        const year = d.getFullYear().toString();
        const month = (d.getMonth() + 1).toString();
        const yearMatch = selectedYear === 'all' || year === selectedYear;
        const monthMatch = selectedMonth === 'all' || month === selectedMonth;
        return yearMatch && monthMatch;
      });
    }, [detailsData, selectedYear, selectedMonth]);

    // Build a summary reducer from filteredDetails
    const filteredSummary = useMemo(() => {
      const groups = {};
      (filteredDetails || []).forEach(item => {
        const key = item.category || 'unknown';
        const amount = Number(item.amount || 0);
        if (!groups[key]) groups[key] = 0;
        groups[key] += amount;
      });

      return Object.keys(groups).map(k => ({ category: k, total_amount: groups[k] }));
    }, [filteredDetails]);

    const filteredTotalIncome = filteredSummary.reduce((s, it) => s + Number(it.total_amount || 0), 0);


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Income Statement</h1>
        {!isLoading && (filteredDetails?.length > 0 || filteredSummary?.length > 0) && (
          <ExcelExportButton
            data={prepareExcelData()}
            fileName={`income_statement_${new Date()
              .toISOString()
              .slice(0, 10)}.xlsx`}
            sheetName='Income Statement'
          />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <>
            {/* Total Income Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide">Total Income</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(filteredTotalIncome || totalIncome)}</p>
            </div>

            {/* Individual Category Cards */}
            {(filteredSummary.length > 0 ? filteredSummary : summaryData)?.map((item, index) => {
              const colors = [
                'from-green-500 to-green-600',
                'from-purple-500 to-purple-600',
                'from-orange-500 to-orange-600'
              ];
              const icons = {
                service_fee: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ),
                interest_income: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ),
                penalty_income: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )
              };

              return (
                <div key={index} className={`bg-gradient-to-br ${colors[index % colors.length]} rounded-lg shadow-lg p-6 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide">
                      {formatCategoryName(item.category)}
                    </h3>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icons[item.category] || icons.service_fee}
                    </svg>
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(item.total_amount)}</p>
                  <p className="text-sm mt-2 opacity-80">
                    {(() => {
                      const total = filteredSummary.length ? filteredTotalIncome : totalIncome;
                      const percentage = total > 0 ? ((item.total_amount / total) * 100).toFixed(1) : '0.0';
                      return `${percentage}% of total`;
                    })()}
                  </p>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Detailed Transactions Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Transaction Details</h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
            <DataTableV2
            showLinkPath={false}
            headers={["Account No", "Member Name", "Loan Reference", "Category", "Date", "Amount"]}
            data={filteredDetails}
            isLoading={isLoading}
            isError={isError}
            renderRow={(item, idx) => {
              const accountNo = item.account_number;
              const memberName = item.member_name;
              const loanRef = item.loan_ref_number;
              const category = formatCategoryName(item.category);
              const date = new Date(item.transaction_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const amount = formatCurrency(item.amount);

              return (
                <tr key={item.id || idx}>
                  <td className="text-center">{accountNo}</td>
                  <td className="text-center">{memberName}</td>
                  <td className="text-center">{loanRef}</td>
                  <td className="text-center">{category}</td>
                  <td className="text-center">{date}</td>
                  <td className="text-center">{amount}</td>
                </tr>
              )
            }}
          />
        )}
      </div>
    </div>
  )
}

export default IncomeStatement