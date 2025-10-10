import { Savings, AccountBalance, Wallet, ReceiptLong } from '@mui/icons-material';

// hooks
import { useState } from 'react';
import { useFetchTotal } from './hooks/useFetchTotal';
import { useFetchIncome } from './hooks/useFetchIncome';
import { useMembers } from '../../backend/hooks/useFetchMembers';
import { useFetchExpenses } from '../treasurer/hooks/useFetchExpenses';
import { useFetchClubFunds } from '../treasurer/hooks/useFetchClubFunds';
import { useFetchCoopContributions } from '../treasurer/hooks/useFetchCoopContributions';

// constants
import { PAYMENT_METHOD_COLORS, CLUB_CATEGORY_COLORS, INCOME_SOURCE_COLORS, CAPITAL_CATEGORY_COLORS} from '../../constants/Color';

// components
import StatCard from './components/StatCard';
import ExpensesChart from './components/ExpensesChart';
import CoopContributionChart from './components/CoopContributionChart';
import ComparisonChart from './components/ComparisonChart';
import DataTable from './components/DataTable';

function Dashboard() {
  // Supabase Hooks
  const { data: members } = useMembers();
  const { data: income, isLoading: incomeIsLoading } = useFetchIncome();
  const { data: fundExpenses, isLoading: expensesIsLoading } = useFetchExpenses();
  const { data: clubFunds, isLoading: clubFundsIsLoading } = useFetchClubFunds();
  const { data: coopFunds, isLoading: coopIsloading } = useFetchCoopContributions();

  // Filters for the cards
  const subText = "All Time";
  const [filters, setFilters] = useState({
    income: { month: null, year: null, subtitle: subText },
    fundsBalance: { month: null, year: null, subtitle: subText },
    expenses: { month: null, year: null, subtitle: subText },
    coop: { month: null, year: null, subtitle: subText },
  });

  // Helper to compute previous period filter
  const getPrevPeriod = (subtitle) => {
    if (subtitle === "This Month") {
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { month: prev.getMonth() + 1, year: prev.getFullYear() };
    }
    if (subtitle === "This Year") {
      return { month: null, year: new Date().getFullYear() - 1 };
    }
    return { month: null, year: null }; // All Time → no comparison
  };

  // Helper to compute growth percent
  const calcGrowth = (current, previous, asString = false) => {
    if (previous == null || previous === 0 || current == null) return null;

    const growth = ((current - previous) / previous) * 100;
    const rounded = Math.round(growth); // ✅ no decimals

    return asString ? `${rounded}%` : rounded;
  };

  // =========================
  // Income
  // =========================
  const { data: incomeTotal, isLoading: incomeLoading, isError: incomeIsError, error: incomeError } = useFetchTotal({
    rpcFn: "get_club_income_total",
    year: filters.income.year,
    month: filters.income.month,
  });
  const { data: incomePrevTotal } = useFetchTotal({
    rpcFn: "get_club_income_total",
    ...getPrevPeriod(filters.income.subtitle),
  });
  const incomeGrowth = calcGrowth(incomeTotal, incomePrevTotal);

  // =========================
  // Club Fund Balance
  // =========================
  const { data: clubFundsBalance, isLoading: cfBalLoading, isError: cfBalIsError, error: cfBalError } = useFetchTotal({
    rpcFn: "get_club_funds_balance",
    year: filters.fundsBalance.year,
    month: filters.fundsBalance.month,
  });
  const { data: cfPrevBal } = useFetchTotal({
    rpcFn: "get_club_funds_balance",
    ...getPrevPeriod(filters.fundsBalance.subtitle),
  });
  const cfGrowth = calcGrowth(clubFundsBalance, cfPrevBal);

  // =========================
  // Expenses
  // =========================
  const { data: expensesTotal, isLoading: expensesLoading, isError: expensesIsError, error: expensesError } = useFetchTotal({
    rpcFn: "get_club_expenses_total",
    year: filters.expenses.year,
    month: filters.expenses.month,
  });
  const { data: expensesPrevTotal } = useFetchTotal({
    rpcFn: "get_club_expenses_total",
    ...getPrevPeriod(filters.expenses.subtitle),
  });
  const expensesGrowth = calcGrowth(expensesTotal, expensesPrevTotal);

  // =========================
  // Coop Contributions
  // =========================
  const { data: coopTotal, isLoading: coopLoading, isError: coopIsError, error: coopError } = useFetchTotal({
    rpcFn: "get_coop_contributions_total",
    year: filters.coop.year,
    month: filters.coop.month,
  });
  const { data: coopPrevTotal } = useFetchTotal({
    rpcFn: "get_coop_contributions_total",
    ...getPrevPeriod(filters.coop.subtitle),
  });
  const coopGrowth = calcGrowth(coopTotal, coopPrevTotal);

  /**
   * Stat Cards
   */
  const stats = [
    {
      icon: <AccountBalance />,
      iconBgColor: "bg-sky-400",
      statName: "Coop Share Capital",
      growthPercent: coopGrowth,
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
      icon: <Savings />,
      iconBgColor: "bg-lime-400",
      statName: "Club Fund Balance",
      growthPercent: cfGrowth,
      amount: clubFundsBalance ?? 0,
      subtitle: filters.fundsBalance.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          fundsBalance: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: cfBalLoading,
      error: cfBalIsError,
      errorMessage: cfBalError?.message,
    },
    {
      icon: <ReceiptLong />,
      iconBgColor: "bg-red-400",
      statName: "Club Expenses",
      growthPercent: expensesGrowth,
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
    {
      icon: <Wallet />,
      iconBgColor: "bg-purple-400",
      statName: "Club Income",
      growthPercent: incomeGrowth,
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
  ];
 
  return (
    <div>
      <div className="mb-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col lg:flex-row gap-3">
          {/* LEFT SIDE */}
          <div className="flex-1 flex flex-col gap-3">

            {/* Total Card Stats  */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((stats_items, stat_id) => (
                <StatCard key={stat_id} {...stats_items} />
              ))}
            </section>

            {/* Share Capital Area Chart */}
            <section className="border border-base-content/5 bg-base-100 rounded-2xl shadow-md min-h-[400px]">
              <div className="p-6 flex flex-col h-full">
                <div>
                  <span className="text-xl font-semibold">Share Capital Activity</span>
                  <span className="text-gray-400"> | This Year</span>
                  <p className="text-base-content/60 mb-2">Overview of total share capital contributions by month.</p>
                </div>

                <div className="w-full min-w-0">
                  <CoopContributionChart />
                </div>
              </div>
            </section>

            <DataTable
              title={"Share Capital / Coop"}
              linkPath={"/treasurer/coop-share-capital"}
              headers={["Ref No.", "Name", "Amount", "Payment Category", "Date", "Payment Method"]}
              data={coopFunds}
              isLoading={coopIsloading}
              renderRow={(row) => {
                const TABLE_PREFIX = "SCC"; 
                const matchedMember = members.find((member_column) => member_column.member_id === row.member_id);
                const isDisabled = !matchedMember; // condition (you can adjust logic)
                return (
                  <tr key={`${TABLE_PREFIX}_${row.coop_contri_id}`} className={`text-center ${isDisabled ? "opacity-60" : "cursor-pointer hover:bg-base-200/50"}`}>
                    <td className='text-xs'>{TABLE_PREFIX}_{row.coop_contri_id.toLocaleString() || "ID"}</td>
                    <td>
                      <span className={`gap-2`}>
                        {matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "System"}

                        {isDisabled && (
                          <div className="tooltip tooltip-top" data-tip="System Generated">
                            <span className="badge badge-sm badge-ghost">?</span>
                          </div>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-semibold text-success">
                      ₱ {row.amount?.toLocaleString() || "0"}
                    </td>
                    <td>
                      {row.category ? (
                        <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[row.category]}`}>
                          {row.category}
                        </span>
                      ) : (
                        <span className="badge font-semibold badge-error">Not Provided</span>
                      )}
                    </td>
                    <td className='px-4 py-2'>
                      {row.contribution_date ? new Date(row.contribution_date).toLocaleDateString() : "Not Provided"}
                    </td>
                    <td>
                      {row.payment_method ? (
                        <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row.payment_method]}`}>
                          {row.payment_method}
                        </span>
                      ) : (
                        <span className="badge font-semibold badge-error">Not Provided</span>
                      )}
                    </td>
                  </tr>
                )
              }} 
            />

            <DataTable
              title={"Club Funds"}
              linkPath={"/treasurer/club-funds"}
              headers={["Ref No.", "Name", "Amount", "Category", "Date", "Payment Method"]}
              data={clubFunds}
              isLoading={clubFundsIsLoading}
              renderRow={(row) => {
                const TABLE_PREFIX = "CFC";
                const matchedMember = members.find((member_column) => member_column.member_id === row.member_id);
                return (
                  <tr key={`${TABLE_PREFIX}_${row.contribution_id}`} className="text-center cursor-pointer hover:bg-base-200/50">
                    <td className='text-xs'>{TABLE_PREFIX}_{row.contribution_id?.toLocaleString() || "ID"}</td>

                    {/* Member Render from members table */}
                    <td>
                      <span className="gap-2">
                        {matchedMember
                          ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim()
                          : "System"}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-semibold text-success">
                      ₱ {row.amount?.toLocaleString() || "0"}
                    </td>

                    <td>
                      <span
                        className={`font-semibold ${CLUB_CATEGORY_COLORS[row.category]}`}
                      >
                        {row.category || "Not Provided"}
                      </span>
                    </td>

                    <td>{row.payment_date ? new Date(row.payment_date).toLocaleDateString() : "Not Provided"}</td>
                    <td>
                      <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[row.payment_method]}`}>
                        {row.payment_method}
                      </span>
                    </td>
                  </tr>
                )
              }}
            />

            <DataTable
              title={"Club Expenses"}
              linkPath={"/treasurer/club-expenses"}
              headers={["Ref No.", "Title", "Amount", "Category", "Date"]}
              data={fundExpenses}
              isLoading={expensesIsLoading}
              renderRow={(row) => 
                {
                  const TABLE_PREFIX = "EXP";
                  return (
                  <tr key={`${TABLE_PREFIX}_${row.transaction_id}`} className="text-center cursor-pointer hover:bg-base-200/50">
                    <td className='text-xs'>{TABLE_PREFIX}_{row.transaction_id?.toLocaleString() || "ID"}</td>
                    <td>{row.title}</td>
                    <td className="px-4 py-2 font-semibold text-success">
                      ₱ {row.amount?.toLocaleString() || "0"}
                    </td>
                    <td>
                      <span className={`font-semibold ${CLUB_CATEGORY_COLORS[row.category]}`}>
                        {row.category || "Not Provided"}
                      </span>
                    </td>
                    <td>{row.transaction_date ? new Date(row.transaction_date).toLocaleDateString() : "Not Provided"}</td>
                  </tr>
                  )
                }
              }
            />

            {/** 
              * 
              *  Income Recent Table
               */}
            <DataTable
              title={"Income"}
              linkPath={"/treasurer"} // will provide later on
              headers={["Ref No.", "Title", "Amount", "Source", "Date"]}
              data={income}
              isLoading={incomeIsLoading}
              renderRow={(row) => (
                <tr key={row.income_id} className="text-center cursor-pointer hover:bg-base-200/50">
                  <td className='text-xs'>IC_{row.income_id?.toLocaleString() || "ID"}</td>
                  <td>
                    {row.title}
                  </td>
                  <td className="px-4 py-2 font-semibold text-success">
                    ₱ {row.amount?.toLocaleString() || "0"}
                  </td>
                  <td >
                    <span className={`badge badge-soft font-semibold ${INCOME_SOURCE_COLORS[row.source]}`}>
                      {row.source}
                    </span>
                  </td>
                  <td>{row.date ? new Date(row.date).toLocaleDateString() : "Not Provided"}</td>
                </tr>
              )}
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-[30%] flex flex-col gap-3">

            {/* CLUB EXPENSES DONUT CHART */}
            <section className="card bg-base-100 shadow-md min-h-[400px] p-5 rounded-2xl">
              <div className="flex flex-col h-full">
                <div>
                  <span className="text-2xl font-semibold">Club Expenses Breakdown</span>
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

            {/* CLUB FUNDS VS EXPENSES DUAL LINE CHART */}
            <section className="card bg-base-100 shadow-md min-h-[400px] p-5 rounded-2xl">
              <div className="flex flex-col h-full">
                <div>
                  <span className="text-2xl font-semibold">Club Funds vs. Expenses</span>
                  <span className="text-gray-400"> | This Year</span>
                  <p className="mt-1 text-sm text-base-content/70">Track the yearly trends between club fund contributions and expenses.</p>
                </div>
                <div className="flex-grow">
                  <ComparisonChart />
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
