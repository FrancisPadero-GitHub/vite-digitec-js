import { useParams } from 'react-router-dom'
import { useState } from 'react';

// fetch hooks
import { useFetchMemberDetails } from '../../../../backend/hooks/member/useFetchMemberDetails';
import { useFetchLoanAccView } from '../../../../backend/hooks/shared/useFetchLoanAccView';
import { useFetchLoanPayments } from '../../../../backend/hooks/shared/useFetchPayments';

// RPC fetch hooks for the totals for the two tables (club funds and coop contributions)
import { useRpcTotal } from '../../../../backend/hooks/shared/view/useFetchRpcTotal';

// Formatting utilities
import { display } from '../../../../constants/numericFormat';

// Export component
import ExcelExportButton from './ExportButton';
import DateFilterReports from './DateFilterReports';


function MemStatementDetails() {
  const { memberId } = useParams();
  const parsedId = Number(memberId);

  // Filter states
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // this contains 2 main data tables loanAcc and clubFunds + coopContributions AND a member information 
  const { data, isLoading, isError, error } = useFetchMemberDetails({
    memberId: parsedId,
  });

  // Extract member info for loan account view
  const memberInfo = data?.memberInfo || {};      // used to fetch loan acc view

  // Extract various data tables
  const loanAccount = data?.loanAcc?.data || [];      // base table that will be merged with loanAccView
  
  // loan acc view to view outstanding balance realtime
  const accountNo = memberInfo?.account_number
  const { data: view_loan_account } = useFetchLoanAccView({ accountNumber: accountNo }); 
  const viewLoanAcc = view_loan_account?.data || [];


  // Merge loanAccount with loanAccView on loan_id (base and view tables might have multiple matching columns)
  const mergedLoanAccounts = loanAccount.map(baseRow => {
    const viewRow = viewLoanAcc.find(v => v.loan_id === baseRow.loan_id);

    return {
      ...baseRow, // all base table fields
      ...viewRow,
    };
  });
  // console.log(mergedLoanAccounts[0])
  // const destructuredMergedData = mergedLoanAccounts[0] || {};    // might need later
  
    // Returns { onGoingLoans, pastLoans } for a given account number
  function getLoansByStatus() {
    const onGoingLoans = mergedLoanAccounts?.filter(row => row.status === "Active");
    const pastLoans = mergedLoanAccounts?.filter(row => row.status === "Closed");         // unused for now need clarity if we include the closed loans in the statement
    return { onGoingLoans, pastLoans };
  }

  /**
   * This is the data for the tables we need below
   */ 
  
  // loans both active and past loans
  const { onGoingLoans, pastLoans } = getLoansByStatus();
  const activeLoans = onGoingLoans[0] || [];     // the [0] is to get the first element which is the array of active loans filtered which is always return single array

  // loan payments
  const { data: loanPaymentsData } = useFetchLoanPayments({ accountNumber: accountNo });
  const loanPayments = loanPaymentsData?.data || [];
  
  // club funds history
  const clubFunds = data?.clubFunds?.data || [];
  // coop contributions history
  const coopContributions = data?.coopContributions?.data || [];

  /**
   * this is for the totals or summaries precalculated for me on supabase
   * Uses the filter states for year and month
   */
  const { data: clubFundsTotal } = useRpcTotal({
    rpcFn: "get_club_funds_total_by_member",
    accountNumber: accountNo,
    year: selectedYear,
    month: selectedMonth,
  });

  const { data: coopContributionsTotal } = useRpcTotal({
    rpcFn: "get_coop_contributions_total_by_member",
    accountNumber: accountNo,
    year: selectedYear,
    month: selectedMonth,
  });

  // Filter data based on selected year and month
  const filterByDate = (items, dateField) => {
    if (!items) return [];
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      const itemYear = itemDate.getFullYear().toString();
      const itemMonth = (itemDate.getMonth() + 1).toString();
      
      const yearMatch = selectedYear === 'all' || itemYear === selectedYear;
      const monthMatch = selectedMonth === 'all' || itemMonth === selectedMonth;
      
      return yearMatch && monthMatch;
    });
  };

  const filteredClubFunds = filterByDate(clubFunds, 'payment_date');
  const filteredCoopContributions = filterByDate(coopContributions, 'contribution_date');
  const filteredOngoingLoans = filterByDate(onGoingLoans, 'release_date');
  const filteredLoanPayments = filterByDate(loanPayments, 'payment_date');


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
    { value: '12', label: 'December' },
  ];

  // Dynamically generate year options for the past 5 years and current year
  // to get rid of the hard coded years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

// Get unique years from all data
// const availableYears = useMemo(() => {
//   const years = new Set();

//   [...clubFunds, ...coopContributions, ...loanPayments].forEach(item => {
//     const date = new Date(item.payment_date || item.contribution_date);
//     if (!isNaN(date.getTime())) {
//       years.add(date.getFullYear());
//     }
//   });
//   return Array.from(years).sort((a, b) => b - a);
// }, [clubFunds, coopContributions, loanPayments]);

  // Prepare data for Excel export (using filtered data)
  const prepareExportData = () => {
    const memberName = memberInfo ? 
      `${memberInfo.f_name || ''} ${memberInfo.m_name || ''} ${memberInfo.l_name || ''}`.trim() 
      : 'N/A';
    const accountNumber = memberInfo?.account_number || 'N/A';
    return {
      shareCapital: filteredCoopContributions.map(contribution => ({
        Name: memberName,
        AccountNumber: accountNumber,
        Date: new Date(contribution.contribution_date).toLocaleDateString(),
        Description: contribution.description || 'Share Capital Contribution',
        Amount: contribution.amount || 0,
        Type: contribution.type || 'Contribution',
        Total: coopContributionsTotal || 0
      })),
      clubFunds: filteredClubFunds.map(fund => ({
        Name: memberName,
        AccountNumber: accountNumber,
        Date: new Date(fund.payment_date).toLocaleDateString(),
        Description: fund.description || 'Club Fund Contribution',
        Amount: fund.amount || 0,
        Type: fund.type || 'Contribution',
        Total: clubFundsTotal || 0
      })),
      onGoingLoansLoans: filteredOngoingLoans.map(loan => ({
        Name: memberName,
        AccountNumber: accountNumber,
        'Loan ID': loan.loan_id,
        'Loan Ref No': loan.loan_ref_number || 'N/A',
        'Total Amount Due': loan.total_amount_due || 0,
        'Total Paid': loan.total_paid || 0,
        'Outstanding Balance': loan.outstanding_balance || 0,
        'Release Date': new Date(loan.release_date).toLocaleDateString()
      })),
      loanPayments: filteredLoanPayments.map(payment => ({
        Name: memberName,
        AccountNumber: accountNumber,
        Date: new Date(payment.payment_date).toLocaleDateString(),
        'Payment ID': payment.payment_id || 'N/A',
        Amount: payment.total_amount || 0,
        'Payment Method': payment.payment_method || 'N/A',
        'Loan Ref No': payment.loan_ref_number || 'N/A'
      })),
      ...(pastLoans.length > 0 && {
        closedLoans: pastLoans.map(loan => ({
          Name: memberName,
          AccountNumber: accountNumber,
          'Loan ID': loan.loan_id,
          Product: loan.loan_product_name || 'N/A',
          Principal: loan.principal_amount || 0,
          'Total Paid': loan.total_paid || 0,
          'Release Date': new Date(loan.release_date).toLocaleDateString(),
          Status: loan.status
        }))
      })
    };
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading member statement...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error?.message || 'Failed to load data'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Member Statement</h1>
            <ExcelExportButton
              data={prepareExportData()}
              fileName={`Member_Statement_${memberInfo?.account_number || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`}
            />
          </div>
          
          {/* Filter Section */}
          <DateFilterReports
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            yearOptions={yearOptions}
            months={months}
            onClear={() => {
              setSelectedYear('all');
              setSelectedMonth('all');
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Member Name:</p>
              <p className="font-semibold text-lg">
                {memberInfo ? (
                  `${memberInfo.f_name || ''} ${memberInfo.m_name || ''} ${memberInfo.l_name || ''}`.trim()
                ) : 'N/A'}
               </p>
            </div>
            <div>
              <p className="text-gray-600">Account Number:</p>
              <p className="font-semibold text-lg">{memberInfo?.account_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-semibold">{memberInfo?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Statement Date:</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Share Capital Total */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Share Capital Total</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{display(coopContributionsTotal || 0)}</p>
            <p className="text-xs mt-1 opacity-75">{filteredCoopContributions.length} contributions</p>
          </div>

          {/* Club Funds Total */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Club Funds Total</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{display(clubFundsTotal || 0)}</p>
            <p className="text-xs mt-1 opacity-75">{filteredClubFunds.length} transactions</p>
          </div>

          {/* Active Loans */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Active Loans</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{onGoingLoans.length}</p>
            <p className="text-xs mt-1 opacity-75">Outstanding balance: {display(onGoingLoans?.outstanding_balance || 0)}</p>
          </div>

          {/* Total Payments */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Loan Payments</h3>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{filteredLoanPayments.length}</p>
            <p className="text-xs mt-1 opacity-75">Total paid: {display(activeLoans?.total_paid || 0)}</p>
          </div>
        </div>

        {/* Coop Contributions (Share Capital) */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Capital Contributions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCoopContributions.length > 0 ? (
                  filteredCoopContributions.map((contribution, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(contribution.contribution_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {contribution.description || 'Share Capital Contribution'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                        {display(contribution.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contribution.type || 'Contribution'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No share capital contributions found
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredCoopContributions.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-right font-bold text-gray-900">Total:</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">{display(coopContributionsTotal || 0)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Club Funds */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Club Funds History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClubFunds.length > 0 ? (
                  filteredClubFunds.map((fund, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(fund.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {fund.description || 'Club Fund Contribution'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600">
                        {display(fund.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fund.type || 'Contribution'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No club fund transactions found
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredClubFunds.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-right font-bold text-gray-900">Total:</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">{display(clubFundsTotal || 0)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Loan Balances</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Ref No.</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount Due</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {onGoingLoans.length > 0 ? (
                  onGoingLoans.map((loan, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.loan_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {loan.loan_ref_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {display(loan.total_amount_due)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        {display(loan.total_paid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-orange-600">
                        {display(loan.outstanding_balance)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(loan.release_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No active loans
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loan Payment History */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loan Payment History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Ref No.</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLoanPayments.length > 0 ? (
                  filteredLoanPayments.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.payment_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                        {display(payment.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.payment_method || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payment.loan_ref_number || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No payment history found
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredLoanPayments.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-right font-bold text-gray-900">Total Payments:</td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {display(activeLoans?.total_paid)}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Past Loans (Optional) */}
        {pastLoans.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Closed Loans</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pastLoans.map((loan, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {loan.loan_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {loan.loan_product_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {display(loan.principal_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        {display(loan.total_paid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(loan.release_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white shadow-md rounded-lg p-6 text-center text-sm text-gray-500">
          <p>This is an official member statement generated on {new Date().toLocaleDateString()}</p>
          <p className="mt-2">For questions or concerns, please contact your cooperative administrator.</p>
        </div>
      </div>
    </div>
  )
}

export default MemStatementDetails