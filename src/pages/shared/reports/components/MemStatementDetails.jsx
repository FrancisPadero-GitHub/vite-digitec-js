import { useParams } from "react-router-dom";
import { useState } from "react";
import { Wallet, Briefcase, CreditCard, Users } from "lucide-react";

// fetch hooks
import { useFetchMemberDetails } from "../../../../backend/hooks/member/useFetchMemberDetails";
import { useFetchLoanAccView } from "../../../../backend/hooks/shared/useFetchLoanAccView";
import { useFetchLoanPayments } from "../../../../backend/hooks/shared/useFetchPayments";

// RPC fetch hooks for the totals for the two tables (club funds and coop contributions)
import { useRpcTotal } from "../../../../backend/hooks/shared/view/useFetchRpcTotal";

// Formatting utilities
import { display } from "../../../../constants/numericFormat";

// Export component
import ExportPDFButton from "./ExportPDFButton";
import ExcelExportButton from "./ExcelExportButton";
import DateFilterReports from "./DateFilterReports";

import digitecLogo from "../../../../assets/digitec-logo.png";

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount || 0);
};

function MemStatementDetails() {
  const { memberId } = useParams();
  const parsedId = Number(memberId);

  // Filter states
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // this contains 2 main data tables loanAcc and clubFunds + coopContributions AND a member information
  const { data, isLoading, isError } = useFetchMemberDetails({
    memberId: parsedId,
  });

  // Extract member info for loan account view
  const memberInfo = data?.memberInfo || {}; // used to fetch loan acc view

  // Extract various data tables
  const loanAccount = data?.loanAcc?.data || []; // base table that will be merged with loanAccView

  // loan acc view to view outstanding balance realtime
  const accountNo = memberInfo?.account_number;
  const { data: view_loan_account } = useFetchLoanAccView({
    accountNumber: accountNo,
  });
  const viewLoanAcc = view_loan_account?.data || [];

  // Merge loanAccount with loanAccView on loan_id (base and view tables might have multiple matching columns)
  const mergedLoanAccounts = loanAccount.map((baseRow) => {
    const viewRow = viewLoanAcc.find((v) => v.loan_id === baseRow.loan_id);
    return {
      ...baseRow,
      ...viewRow,
    };
  });

  // Returns { onGoingLoans, pastLoans } for a given account number
  function getLoansByStatus() {
    const onGoingLoans = mergedLoanAccounts?.filter(
      (row) => row.status === "Active"
    );
    const pastLoans = mergedLoanAccounts?.filter(
      (row) => row.status === "Closed"
    );
    return { onGoingLoans, pastLoans };
  }

  // loans both active and past loans
  const { onGoingLoans, pastLoans } = getLoansByStatus();
  const activeLoans = onGoingLoans[0] || []; // base behavior kept from original code

  // loan payments
  const { data: loanPaymentsData } = useFetchLoanPayments({
    accountNumber: accountNo,
  });
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
    return items.filter((item) => {
      const itemDate = new Date(item[dateField]);
      const itemYear = itemDate.getFullYear().toString();
      const itemMonth = (itemDate.getMonth() + 1).toString();

      const yearMatch = selectedYear === "all" || itemYear === selectedYear;
      const monthMatch = selectedMonth === "all" || itemMonth === selectedMonth;
      return yearMatch && monthMatch;
    });
  };

  const filteredClubFunds = filterByDate(clubFunds, "payment_date");
  const filteredCoopContributions = filterByDate(
    coopContributions,
    "contribution_date"
  );
  const filteredOngoingLoans = filterByDate(onGoingLoans, "release_date");
  const filteredLoanPayments = filterByDate(loanPayments, "payment_date");

  const prepareExportDataPDF = () => ({
    member: {
      account_number: memberInfo?.account_number,
      full_name:
        `${memberInfo?.f_name || ""} ${memberInfo?.m_name || ""} ${memberInfo?.l_name || ""}`.trim(),
      email: memberInfo?.email,
      contact_number: memberInfo?.contact_number,
      account_role: memberInfo?.account_role,
      account_status: memberInfo?.account_status,
    },
    shareCapital: (filteredCoopContributions || []).map((c) => ({
      transaction_date: c.contribution_date,
      transaction_type: c.category || "Contribution",
      description: c.description || "Share Capital Contribution",
      amount: c.amount,
    })),
    loanAccounts: [...(filteredOngoingLoans || []), ...(pastLoans || [])].map(
      (loan) => ({
        loan_ref_number: loan.loan_ref_number,
        loan_type: loan.loan_type || loan.type || "Loan",
        application_date: loan.release_date || loan.application_date,
        loan_amount: loan.principal ?? loan.loan_amount,
        outstanding_balance: loan.outstanding_balance,
        loan_status: loan.status || loan.loan_status || "Active",
      })
    ),
    payments: (filteredLoanPayments || []).map((p) => ({
      payment_date: p.payment_date,
      loan_ref_number: p.loan_ref_number,
      principal: p.principal,
      interest: p.interest,
      fees: p.penalty_fees_paid ?? p.fees,
      total_amount: p.total_amount,
      payment_method: p.payment_method,
    })),
    clubFunds: (filteredClubFunds || []).map((f) => ({
      contribution_date: f.payment_date,
      fund_type: f.category || "Contribution",
      purpose: f.description || "Club Fund",
      amount: f.amount,
      status: f.status || "Posted",
    })),
    summary: {
      totalShareCapital: coopContributionsTotal || 0,
      totalClubFunds: clubFundsTotal || 0,
      activeLoanCount: (onGoingLoans || []).length || 0,
      totalLoanOutstanding:
        (activeLoans && activeLoans.outstanding_balance) || 0,
      totalPayments: (activeLoans && activeLoans.total_paid) || 0,
      memberEquity:
        (coopContributionsTotal || 0) +
        (clubFundsTotal || 0) -
        ((activeLoans && activeLoans.outstanding_balance) || 0),
    },
  });

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
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
  const prepareExportDataExcel = () => {
    const memberName = memberInfo
      ? `${memberInfo.f_name || ""} ${memberInfo.m_name || ""} ${memberInfo.l_name || ""}`.trim()
      : "N/A";

    const accountNumber = memberInfo?.account_number || "N/A";

    return {
      shareCapital: [
        ...filteredCoopContributions.map((c) => ({
          Name: memberName,
          AccountNumber: accountNumber,
          Date: new Date(c.contribution_date).toLocaleDateString(),
          Description: c.description || "Share Capital Contribution",
          Amount: c.amount || 0,
          Type: c.type || "Contribution",
        })),

        { __type: "gap" },
        { __type: "gap" },

        {
          __type: "total",
          label: "Share Capital Total",
          value: coopContributionsTotal || 0,
        },
      ],

      clubFunds: [
        ...filteredClubFunds.map((f) => ({
          Name: memberName,
          AccountNumber: accountNumber,
          Date: new Date(f.payment_date).toLocaleDateString(),
          Description: f.description || "Club Fund Contribution",
          Amount: f.amount || 0,
          Type: f.type || "Contribution",
        })),

        { __type: "gap" },
        { __type: "gap" },

        {
          __type: "total",
          label: "Club Funds Total",
          value: clubFundsTotal || 0,
        },
      ],

      onGoingLoansLoans: filteredOngoingLoans.map((loan) => ({
        Name: memberName,
        AccountNumber: accountNumber,

        "Loan ID": loan.loan_id,
        "Loan Ref No": loan.loan_ref_number || "N/A",

        Principal: loan.principal || 0,
        "Net Principal": loan.net_principal || 0,
        "Interest Paid": loan.interest_paid || 0,
        "Penalty Fees Paid": loan.penalty_fees_paid || 0,
        "Total Paid": loan.total_paid || 0,

        "Remaining Principal": loan.remaining_principal || 0,
        "Remaining Interest": loan.remaining_interest || 0,

        "Outstanding Balance": loan.outstanding_balance || 0,

        "Service Fee": loan.service_fee || 0,
        "Total Interest": loan.total_interest || 0,
        "Total Penalty Fees": loan.total_penalty_fees || 0,

        "Release Date": new Date(loan.release_date).toLocaleDateString(),
        "Approved Date": loan.approved_date
          ? new Date(loan.approved_date).toLocaleDateString()
          : "N/A",
        "Maturity Date": loan.maturity_date
          ? new Date(loan.maturity_date).toLocaleDateString()
          : "N/A",
      })),

      loanPayments: filteredLoanPayments.map((payment) => ({
        Name: memberName,
        AccountNumber: accountNumber,
        Date: new Date(payment.payment_date).toLocaleDateString(),

        "Payment ID": payment.payment_id || "N/A",
        Amount: payment.total_amount || 0,
        "Payment Method": payment.payment_method || "N/A",
        "Loan Ref No": payment.loan_ref_number || "N/A",
      })),

      ...(pastLoans.length > 0 && {
        closedLoans: pastLoans.map((loan) => ({
          Name: memberName,
          AccountNumber: accountNumber,

          "Loan ID": loan.loan_id,
          "Loan Ref No": loan.loan_ref_number || "N/A",

          Principal: loan.principal || 0,
          "Net Principal": loan.net_principal || 0,

          "Interest Paid": loan.interest_paid || 0,
          "Penalty Fees Paid": loan.penalty_fees_paid || 0,
          "Total Paid": loan.total_paid || 0,

          "Total Interest": loan.total_interest || 0,
          "Total Penalty Fees": loan.total_penalty_fees || 0,

          "Service Fee": loan.service_fee || 0,

          "Outstanding Balance": loan.outstanding_balance || 0,

          "Release Date": new Date(loan.release_date).toLocaleDateString(),
          "Maturity Date": loan.maturity_date
            ? new Date(loan.maturity_date).toLocaleDateString()
            : "N/A",

          Status: loan.status || "Closed",
        })),
      }),
    };
  };
  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="flex items-center space-x-3"
          role="status"
          aria-live="polite"
        >
          <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div className="text-xl">Loading member statement...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">
          Failed to load member statement.
        </div>
      </div>
    );
  }

  return (
    <div className="m-3">
      <div className="space-y-2">
        {/* Header Section */}
        <div className="bg-base-100 shadow-md rounded-lg p-4 sm:p-6 gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
            <div className="w-full lg:w-1/2">
              <h1 className="text-lg lg:text-2xl sm:text-lg lg:text-2xl font-bold">
                Member Statement
              </h1>
              <div className="mt-3 lg:mt-0">
                <DateFilterReports
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  onYearChange={setSelectedYear}
                  onMonthChange={setSelectedMonth}
                  yearOptions={yearOptions}
                  months={months}
                  onClear={() => {
                    setSelectedYear("all");
                    setSelectedMonth("all");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
            <div>
              <p className="text-gray-600">Member Name:</p>
              <p className="font-semibold text-base sm:text-lg">
                {memberInfo
                  ? `${memberInfo.f_name || ""} ${memberInfo.m_name || ""} ${memberInfo.l_name || ""}`.trim()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Account Number:</p>
              <p className="font-semibold text-base sm:text-lg">
                {memberInfo?.account_number || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-semibold truncate">
                {memberInfo?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Statement Date:</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {/* Share Capital Total */}
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <div className="card-body px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="card-title text-sm font-semibold uppercase tracking-wide text-white">
                  Share Capital Total
                </h3>
                <Users className="w-8 h-8 text-white opacity-80" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-white">
                {formatCurrency(coopContributionsTotal || 0)}
              </p>
              <p className="text-sm mt-2 opacity-90 text-white">
                {filteredCoopContributions.length} contributions
              </p>
            </div>
          </div>

          {/* Club Funds Total */}
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="card-title text-sm font-semibold uppercase tracking-wide text-white">
                  Club Funds Total
                </h3>
                <Wallet className="w-8 h-8 text-white opacity-80" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-white">
                {formatCurrency(clubFundsTotal || 0)}
              </p>
              <p className="text-sm mt-2 opacity-90 text-white">
                {filteredClubFunds.length} transactions
              </p>
            </div>
          </div>

          {/* Active Loans */}
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="card-title text-sm font-semibold uppercase tracking-wide truncate text-white">
                  Active Loans
                </h3>
                <Briefcase className="w-8 h-8 text-white opacity-80" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-white">
                {onGoingLoans.length}
              </p>
              <p className="text-sm mt-2 opacity-90 text-white">
                Outstanding:{" "}
                {formatCurrency(activeLoans.outstanding_balance || 0)}
              </p>
            </div>
          </div>

          {/* Loan Payments */}
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="card-title text-sm font-semibold uppercase tracking-wide truncate text-white">
                  Loan Payments
                </h3>
                <CreditCard className="w-8 h-8 text-white opacity-80" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-white">
                {filteredLoanPayments.length}
              </p>
              <p className="text-sm mt-2 opacity-90 text-white">
                Total paid: {formatCurrency(activeLoans?.total_paid || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex justify-end my-4 gap-2">
          <ExportPDFButton
            logoDataUrl={digitecLogo}
            cooperativeName="DigiTEC | ECTEC Multi-Purpose Cooperative"
            cooperativeAddress="Trinitas Bugo, Cagayan de Oro City"
            cooperativeContact="Contact: 09123456789 | Email: eaglesclubectec@gmail.com"
            startDate={
              selectedYear !== "all" || selectedMonth !== "all"
                ? new Date(
                    selectedYear !== "all"
                      ? parseInt(selectedYear)
                      : new Date().getFullYear(),
                    selectedMonth !== "all" ? parseInt(selectedMonth) - 1 : 0,
                    1
                  )
                : undefined
            }
            endDate={new Date()}
            disabled={isLoading}
            statementData={prepareExportDataPDF()}
            fileName={`Member_Statement_${memberInfo?.account_number || "export"}_${new Date().toISOString().split("T")[0]}.pdf`}
            title="Export as PDF"
          />
          <ExcelExportButton
            data={prepareExportDataExcel()}
            fileName={`Member_Statement_${memberInfo?.account_number || "export"}_${new Date().toISOString().split("T")[0]}.xlsx`}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 my-4">
          {/* Coop Contributions (Share Capital) */}
          <div className="bg-base-100 shadow-md rounded-lg p-4 sm:p-6">
            <h2 className="text-lg lg:text-2xl font-bold mb-4">
              Share Capital Contributions
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            <div className="overflow-y-auto overflow-x-auto max-h-[55vh] min-h-[20vh]">
              <table className="min-w-full divide-y">
                <tbody className="divide-y">
                  {filteredCoopContributions.length > 0 ? (
                    filteredCoopContributions.map((contribution, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {new Date(
                            contribution.contribution_date
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm max-w-[120px] sm:max-w-xs truncate">
                          {contribution.description ||
                            "Share Capital Contribution"}
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {contribution.category || "Contribution"}
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 text-right whitespace-nowrap text-xs sm:text-sm font-semibold text-green-600">
                          {display(contribution.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-3 py-4 text-center text-xs sm:text-sm"
                      >
                        No share capital contributions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredCoopContributions.length !== 0 && (
              <div className="sticky bottom-0 border-t border-gray-200">
                <table className="min-w-full">
                  <tfoot>
                    <tr>
                      <td
                        colSpan="2"
                        className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm font-bold"
                      >
                        Total:
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm font-bold text-green-600">
                        {display(coopContributionsTotal || 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Club Funds */}
          <div className="bg-base-100 shadow-md rounded-lg p-4 sm:p-6">
            <h2 className="text-lg lg:text-2xl font-bold mb-4">
              Club Funds History
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            <div className="overflow-y-auto overflow-x-auto max-h-[55vh] min-h-[20vh]">
              <table className="min-w-full divide-y divide-gray-300">
                <tbody className="divide-y divide-gray-300">
                  {filteredClubFunds.length > 0 ? (
                    filteredClubFunds.map((fund, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {new Date(fund.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm max-w-[120px] sm:max-w-xs truncate">
                          {fund.description || "Club Fund Contribution"}
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                          {fund.category || "Contribution"}
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 text-right whitespace-nowrap text-xs sm:text-sm font-semibold text-blue-600">
                          {display(fund.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-3 py-4 text-center text-xs sm:text-sm"
                      >
                        No club fund transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredClubFunds.length !== 0 && (
              <div className="sticky bottom-0 border-t border-gray-200 bg-base-100">
                <table className="min-w-full">
                  <tfoot>
                    <tr>
                      <td
                        colSpan="2"
                        className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm font-bold"
                      >
                        Total:
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm font-bold">
                        {display(clubFundsTotal || 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Active Loans */}
        <div className=" bg-base-100 shadow-md rounded-lg p-4 sm:p-6 mb-4">
          <h2 className="text-lg lg:text-2xl font-bold mb-4">
            Active Loan Balances
          </h2>

          <div className="overflow-y-auto overflow-x-auto max-h-[55vh] min-h-[20vh]">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Loan ID
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Loan Ref No.
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Net Principal
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider hidden lg:table-cell">
                    Interest Paid
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider hidden xl:table-cell">
                    Penalty Paid
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider hidden xl:table-cell">
                    Remaining Principal
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider hidden xl:table-cell">
                    Remaining Interest
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                    Release Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filteredOngoingLoans.length > 0 ? (
                  filteredOngoingLoans.map((loan, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm">
                        {loan.loan_id}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm">
                        {loan.loan_ref_number}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm">
                        {display(loan.principal)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm">
                        {display(loan.net_principal)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm hidden lg:table-cell">
                        {display(loan.interest_paid)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm hidden xl:table-cell">
                        {display(loan.penalty_fees_paid)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm text-green-600 font-semibold">
                        {display(loan.total_paid)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm hidden xl:table-cell">
                        {display(loan.remaining_principal)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm hidden xl:table-cell">
                        {display(loan.remaining_interest)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm text-orange-600 font-semibold">
                        {display(loan.outstanding_balance)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm hidden sm:table-cell">
                        {new Date(loan.release_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="px-3 py-4 text-center text-xs sm:text-sm"
                    >
                      No active loans
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loan Payment History */}
        <div className="bg-base-100 shadow-md rounded-lg p-4 sm:p-6 mb-4">
          <h2 className="text-lg lg:text-2xl font-bold mb-4">
            Loan Payment History
          </h2>

          <div className="overflow-y-auto overflow-x-auto max-h-[35vh] min-h-[20vh]">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                    Payment Method
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Loan Ref No.
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filteredLoanPayments.length > 0 ? (
                  filteredLoanPayments.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm font-medium">
                        {payment.payment_id || "N/A"}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm font-semibold text-green-600">
                        {display(payment.total_amount)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm hidden sm:table-cell">
                        {payment.payment_method || "N/A"}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm">
                        {payment.loan_ref_number || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-3 py-4 text-center text-xs sm:text-sm"
                    >
                      No payment history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredLoanPayments.length > 0 && (
            <div className="border-t border-gray-300">
              <table className="min-w-full">
                <tfoot>
                  <tr>
                    <td
                      colSpan="2"
                      className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm font-bold"
                    >
                      Total Payments:
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm font-bold text-green-600">
                      {display(activeLoans?.total_paid)}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Past Loans (Optional) */}
        {pastLoans.length > 0 && (
          <div className="bg-base-100 shadow-md rounded-lg p-4 sm:p-6 mb-4">
            <h2 className="text-lg lg:text-2xl font-bold mb-4">Closed Loans</h2>

            <div className="overflow-y-auto overflow-x-auto max-h-[35vh] min-h-[17vh]">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Loan ID
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Loan Ref No
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider hidden lg:table-cell">
                      Interest Paid
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider hidden xl:table-cell">
                      Penalty Paid
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Total Paid
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                      Release Date
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider hidden xl:table-cell">
                      Maturity Date
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {pastLoans.map((loan, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm">
                        {loan.loan_id}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm">
                        {loan.loan_ref_number}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm">
                        {display(loan.principal)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm hidden lg:table-cell">
                        {display(loan.interest_paid)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm hidden xl:table-cell">
                        {display(loan.penalty_fees_paid)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-right text-xs sm:text-sm text-green-600 font-semibold">
                        {display(loan.total_paid)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm hidden sm:table-cell">
                        {new Date(loan.release_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm hidden xl:table-cell">
                        {loan.maturity_date
                          ? new Date(loan.maturity_date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 text-center text-xs sm:text-sm">
                        {loan.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-base-100 shadow-md rounded-lg p-3 text-center text-xs sm:text-sm">
          <p>
            This is an official member statement generated on{" "}
            {new Date().toLocaleDateString()}
          </p>
          <p className="mt-2">
            For questions or concerns, please contact your cooperative
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MemStatementDetails;
