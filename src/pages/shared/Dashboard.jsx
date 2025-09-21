import { Savings, AccountBalance, Wallet, ReceiptLong } from '@mui/icons-material';

// hooks
import { useState } from 'react';
import { useFetchTotal } from './hooks/useFetchTotal';
import { useFetchIncome } from './hooks/useFetchIncome';
import { useMembers } from '../../backend/hooks/useFetchMembers';
import { useFetchExpenses } from '../treasurer/hooks/useFetchExpenses';
import { useFetchClubFunds } from '../treasurer/hooks/useFetchClubFunds';
import { useFetchCoopContributions } from '../treasurer/hooks/useFetchCoopContributions';


// components
import StatCard from './components/StatCard';
import ExpensesChart from './components/ExpensesChart';
import CoopContributionChart from './components/CoopContributionChart';
import DataTable from './components/BaseDashboardTable';

function Dashboard() {

  // recent income table
  const { data: income, isLoading: incomeIsLoading } = useFetchIncome();
  const incomeColumns = [
    { header: "Title", key: "title" },
    { header: "Amount", key: "amount", render: (value) => `₱ ${value?.toLocaleString() || "0"}` },
    { header: "Source", key: "source" },
    { header: "Date", key: "date", render: (val) => val ? new Date(val).toLocaleDateString() : "Not Provided" },
    { header: "Remarks", key: "remarks" },
  ]

  // for the recent expenses quick table
  const { data: fundExpenses, isLoading: expensesIsLoading } = useFetchExpenses();
  const expensesColumns = [
    { header: "Title", key: "title" },
    { header: "Amount", key: "amount", render: (value) => `₱ ${value?.toLocaleString() || "0"}` },
    { header: "Category", key: "category" },
    { header: "Date", key: "transaction_date", render: (val) => val ? new Date(val).toLocaleDateString() : "Not Provided" },
    { header: "Description", key: "description" },
  ];

  // recent club funds
  const { data: members } = useMembers();
  const { data: clubFunds, isLoading: clubFundsIsLoading } = useFetchClubFunds();
  const clubFundsColumns = [
    { header: "Amount", key: "amount", render: (value) => `₱ ${value?.toLocaleString() || "0"}` },
    { header: "Category", key: "category" },
    { header: "Payment Date", key: "payment_date", render: (val) => val ? new Date(val).toLocaleDateString() : "Not Provided" },
    { header: "Payment Method", key: "payment_method" },
    { header: "Remarks", key: "remarks" },

  ];

  // recent coop share capital
  const { data: coopFunds, isLoading: coopIsloading } = useFetchCoopContributions();
  const coopFundsColumns = [
    { header: "Amount", key: "amount", render: (value) => `₱ ${value?.toLocaleString() || "0"}` },
    { header: "Source", key: "source" },
    { header: "Payment Category", key: "category" },
    { header: "Date", key: "contribution_date", render: (val) => val ? new Date(val).toLocaleDateString() : "Not Provided" },
    { header: "Remarks", key: "remarks" },
  ]

  // Filters for the cards
  const subText = "All Time";
  const [filters, setFilters] = useState({
    income: { month: null, year: null, subtitle: subText },
    funds: { month: null, year: null, subtitle: subText },
    coop: { month: null, year: null, subtitle: subText },
    expenses: { month: null, year: null, subtitle: subText },
  });

  /**
   * Fetches totals for specific tables using RPC functions
   * rpc code can be viewed on supabase functions
   * 
   * Filter here are accomodated base on the RPC function on supabase
   */
  const { data: incomeTotal, isLoading: incomeLoading, isError: incomeIsError, error: incomeError } = useFetchTotal({
    rpcFn: "get_club_income_total",
    year: filters.income.year,
    month: filters.income.month,
  });

  const { data: clubFundsTotal, isLoading: cbftLoading, isError: cbftIsError, error: cbftError } = useFetchTotal({
    rpcFn: "get_club_funds_total",
    year: filters.funds.year,
    month: filters.funds.month,
  });

  const { data: coopTotal, isLoading: coopLoading, isError: coopIsError, error: coopError } = useFetchTotal({
    rpcFn: "get_coop_contributions_total",
    year: filters.coop.year,
    month: filters.coop.month,
  });

  const { data: expensesTotal, isLoading: expensesLoading, isError: expensesIsError, error: expensesError } = useFetchTotal({
    rpcFn: "get_club_expenses_total",
    year: filters.expenses.year,
    month: filters.expenses.month,
  });

  /**
   * 
   * This will be looped through and rendered below as StatCards props arguments
   * 
   */

  const stats = [
    {
      icon: <Wallet />,
      iconBgColor: "bg-purple-400",
      statName: "Total Income",
      growthPercent: 12, // Will be changed later on
      amount: incomeTotal ?? 0,
      subtitle: filters.income.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          income: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: incomeLoading,
      error: incomeIsError,
      errorMessage: incomeError?.message,
    },
    {
      icon: <Savings />,
      iconBgColor: "bg-lime-400",
      statName: "Total Funds",
      growthPercent: 8, // Will be changed later on
      amount: clubFundsTotal ?? 0,
      subtitle: filters.funds.subtitle,
      onSubtitleChange: (date_label) => {
        setFilters((prev) => ({
          ...prev,
          funds: {
            subtitle: date_label,
            month: date_label === "This Month" ? new Date().getMonth() + 1 : null,
            year: date_label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: cbftLoading,
      error: cbftIsError,
      errorMessage: cbftError?.message,
    },
    {
      icon: <AccountBalance />,
      iconBgColor: "bg-sky-400",
      statName: "Coop Total Contribution",
      growthPercent: 6, // Will be changed later on
      amount: coopTotal ?? 0,
      subtitle: filters.coop.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          coop: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: coopLoading,
      error: coopIsError,
      errorMessage: coopError?.message,
    },

    {
      icon: <ReceiptLong />,
      iconBgColor: "bg-red-400",
      statName: "Total Expenses",
      growthPercent: 2, // Will be changed later on

      amount: expensesTotal ?? 0,
      subtitle: filters.expenses.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          expenses: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: expensesLoading,
      error: expensesIsError,
      errorMessage: expensesError?.message,
    },

  ];


  return (
    <div>
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDE */}
          <div className="flex-1 flex flex-col gap-8">

            {/* Total Card Stats  */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stats_items, stat_id) => (
                <StatCard key={stat_id} {...stats_items} />
              ))}
            </section>

            <DataTable
              title={"Income"}
              columns={incomeColumns}
              data={income}
              isLoading={incomeIsLoading}
              rowLimit={10}
              linkPath={"/treasurer"} // will provide later on
            />


            <DataTable
              title={"Expenses"}
              columns={expensesColumns}
              data={fundExpenses}
              isLoading={expensesIsLoading}
              rowLimit={10}
              linkPath={"/treasurer/club-expenses"}
            />

            <DataTable
              title={"Club Funds"}
              columns={clubFundsColumns}
              data={clubFunds}
              isLoading={clubFundsIsLoading}
              rowLimit={10}
              linkPath={"/treasurer/club-funds"}
              members={members}
            />

            <DataTable
              title={"Share Capital Contribution"}
              columns={coopFundsColumns}
              data={coopFunds}
              isLoading={coopIsloading}
              rowLimit={10}
              linkPath={"/treasurer/coop-share-capital"}
              members={members}
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-[30%] flex flex-col gap-6">

            {/* CLUB EXPENSES DONUT CHART */}
            <section className="card bg-base-100 shadow-lg min-h-[480px] p-8 rounded-3xl">
              <div className="flex flex-col h-full gap-6">
                <div>
                  <span className="text-2xl font-bold tracking-tight">Club Expenses Breakdown</span>
                  <span className="text-gray-400"> | All Time</span>
                  <p className="mt-1 text-sm text-base-content/70">
                    Distribution of club expenses by category
                  </p>
                </div>
                <div className="flex-grow">
                  <ExpensesChart />
                </div>
              </div>
            </section>

            {/* Share Capital Area Chart */}
            <section className="overflow-x-auto border border-base-content/5 bg-base-100 rounded-2xl shadow-md min-h-[400px]">
              <div className="p-6 flex flex-col">
                <h2 className="text-xl font-semibold">Share Capital Activity</h2>
                <p className="text-base-content/60 mb-2">Overview of total share capital contributions by month.</p>
                <div className="w-full min-w-0">
                  <CoopContributionChart />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
