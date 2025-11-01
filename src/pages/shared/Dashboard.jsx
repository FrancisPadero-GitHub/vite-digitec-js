import { Savings, AccountBalance, Wallet, ReceiptLong } from '@mui/icons-material';

// hooks
import { useState } from 'react';
// RPC FUNCTION ALL IN ONE (expenses, club funds, income, coop share capital)
// rpc hook
import { useFetchTotal } from '../../backend/hooks/shared/useFetchTotal'; 

// Hooks for the four quick recent tables
// Fetch hooks on main tables
import { useFetchExpenses } from '../../backend/hooks/shared/useFetchExpenses';
import { useFetchClubFunds } from '../../backend/hooks/shared/useFetchClubFunds';
import { useFetchCoop } from '../../backend/hooks/shared/useFetchCoop';

// helper 
import { useMembers } from '../../backend/hooks/shared/useFetchMembers';
import { useMemberRole } from '../../backend/context/useMemberRole';

// constants
import { PAYMENT_METHOD_COLORS, CLUB_CATEGORY_COLORS, INCOME_SOURCE_COLORS, CAPITAL_CATEGORY_COLORS} from '../../constants/Color';

// components
import StatCard from './components/StatCard';
import ExpensesChart from './components/ExpensesChart';
import CoopContributionChart from './components/CoopContributionChart';
import ComparisonChart from './components/ComparisonChart';
import DataTable from './components/DataTable';



function Dashboard() {
  const { memberRole } = useMemberRole();

  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];

  const { data: coop_data, isLoading: coopIsloading } = useFetchCoop({page: 1, limit: 10});
  const coopFunds = coop_data?.data || [];

  const { data: club_funds_data, isLoading: clubFundsIsLoading } = useFetchClubFunds({page: 1, limit: 10});
  const clubFunds = club_funds_data?.data || [];

  const { data: expenses_data, isLoading: expensesIsLoading } = useFetchExpenses({page: 1, limit: 10});
  const expenses = expenses_data?.data || [];

  // Filters for the cards
  const subText = "All Time";
  const [filters, setFilters] = useState({
    income: { month: null, year: null, subtitle: subText },
    fundsBalance: { month: null, year: null, subtitle: subText },
    expenses: { month: null, year: null, subtitle: subText },
    coop: { month: null, year: null, subtitle: subText },
    overAll: { month: null, year: null, subtitle: subText },
    releaseLoan: { month: null, year: null, subtitle: subText },
    interestIncome: { month: null, year: null, subtitle: subText },
    feeIncome: { month: null, year: null, subtitle: subText },
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
    const c = Number(current);
    const p = Number(previous);

    // Prevent divide-by-zero or invalid values
    if (!isFinite(c) || !isFinite(p) || p === 0) return 0;

    const growth = ((c - p) / p) * 100;
    const rounded = Math.round(growth);

    return asString ? `${rounded}%` : rounded;
  };

  // =========================
  // Coop Contributions
  // =========================
  const { data: coopTotal, isLoading: coopLoading, isError: coopIsError, error: coopError } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.coop.year,
    month: filters.coop.month,
    key: "coop",
  });
  const currCoopVal = Number(coopTotal?.club_total_coop ?? 0);

  const { data: coopPrevTotal } = useFetchTotal({
    rpcFn: "get_funds_summary",
    key: "coop-prev", // ✅ give prev query a unique key
    ...getPrevPeriod(filters.coop.subtitle),
  });
  const prevCoopVal = Number(coopPrevTotal?.club_total_coop ?? 0);
  const coopGrowth = calcGrowth(currCoopVal, prevCoopVal);


  // =========================
  // Club Fund Balance
  // =========================
  const { data: clubFundsBalance, isLoading: cfBalLoading, isError: cfBalIsError, error: cfBalError } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.fundsBalance.year,
    month: filters.fundsBalance.month,
    key: "fundsBalance",
  });
  const currClubFundsVal = Number(clubFundsBalance?.club_balance ?? 0);

  const { data: cfPrevBal } = useFetchTotal({
    rpcFn: "get_funds_summary",
    key: "fundsBalance-prev", // ✅ unique cache key for prev
    ...getPrevPeriod(filters.fundsBalance.subtitle),
  });
  const prevClubFundsVal = Number(cfPrevBal?.club_balance ?? 0);
  const cfGrowth = calcGrowth(currClubFundsVal, prevClubFundsVal);


  // =========================
  // Expenses
  // =========================
  const { data: expensesTotal, isLoading: expensesLoading, isError: expensesIsError, error: expensesError } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.expenses.year,
    month: filters.expenses.month,
    key: "expenses",
  });
  const currExpensesVal = Number(expensesTotal?.club_total_expenses ?? 0); // ✅ correct column name
  const { data: expensesPrevTotal } = useFetchTotal({
    rpcFn: "get_funds_summary",
    key: "expenses-prev", // ✅ again, unique key
    ...getPrevPeriod(filters.expenses.subtitle),
  });
  const prevExpensesVal = Number(expensesPrevTotal?.club_total_expenses ?? 0);
  const expensesGrowth = calcGrowth(currExpensesVal, prevExpensesVal);


  // =========================
  // Income
  // =========================
  const { data: incomeTotal, isLoading: incomeLoading, isError: incomeIsError, error: incomeError } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.income.year,
    month: filters.income.month,
    key: "income",
  });
  const currIncomeVal = Number(incomeTotal?.club_total_income ?? 0);

  const { data: incomePrevTotal } = useFetchTotal({
    rpcFn: "get_funds_summary",
    key: "income-prev", // ✅ unique key
    ...getPrevPeriod(filters.income.subtitle),
  });
  const prevIncomeVal = Number(incomePrevTotal?.club_total_income ?? 0);
  const incomeGrowth = calcGrowth(currIncomeVal, prevIncomeVal);

  // =========================
  // Loan Release To Members 
  // =========================
  const { data: loanReleaseTotal, isLoading: loanReleaseLoading, isError: loanReleaseIsError, error: loanReleaseError } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.releaseLoan.year,
    month: filters.releaseLoan.month,
    key: "releaseTotal",
  });
  const currLoanReleaseVal = Number(loanReleaseTotal?.coop_total_principal_released ?? 0);

  const { data: loanReleasePrevTotal } = useFetchTotal({
    rpcFn: "get_funds_summary",
    key: "releaseTotal-prev", // ✅ unique key
    ...getPrevPeriod(filters.releaseLoan.subtitle),
  });
  const prevLoanReleaseVal = Number(loanReleasePrevTotal?.coop_total_principal_released ?? 0);
  const loanReleaseGrowth = calcGrowth(currLoanReleaseVal, prevLoanReleaseVal);

  // =========================
  // Total Interest Income from Loans Released
  // =========================
  const { data: interestIncomeTotal, isLoading: interestIncomeLoading, isError: interestIncomeIsError, error: interestIncomeError } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.interestIncome.year,
    month: filters.interestIncome.month,
    key: "releaseTotal",
  });
  const currinterestIncomeVal = Number(interestIncomeTotal?.club_total_interest_income ?? 0);

  const { data: interestIncomePrevTotal } = useFetchTotal({
    rpcFn: "get_funds_summary",
    key: "releaseTotal-prev", // ✅ unique key
    ...getPrevPeriod(filters.interestIncome.subtitle),
  });
  const previnterestIncomeVal = Number(interestIncomePrevTotal?.club_total_interest_income ?? 0);
  const interestIncomeGrowth = calcGrowth(currinterestIncomeVal, previnterestIncomeVal);

  // =========================
  // Total Fee Income from Loans Released
  // =========================
  const { data: feeIncomeTotal, isLoading: feeIncomeLoading, isError: feeIncomeIsError, error: feeIncomeError } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.feeIncome.year,
    month: filters.feeIncome.month,
    key: "releaseTotal",
  });
  const currfeeIncomeVal = Number(feeIncomeTotal?.club_total_fees_income ?? 0);

  const { data: feeIncomePrevTotal } = useFetchTotal({
    rpcFn: "get_funds_summary",
    key: "releaseTotal-prev", // ✅ unique key
    ...getPrevPeriod(filters.feeIncome.subtitle),
  });
  const prevfeeIncomeVal = Number(feeIncomePrevTotal?.club_total_fees_income ?? 0);
  const feeIncomeGrowth = calcGrowth(currfeeIncomeVal, prevfeeIncomeVal);

  // =========================
  // Overall Total Cash
  // =========================
  const { data: overAllTotal, isLoading: overAllLoading, isError: overAllIsError, error: overAllError } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.overAll.year,
    month: filters.overAll.month,
    key: "overAll",
  });
  const curroverAllVal = Number(overAllTotal?.overall_total_cash ?? 0);

  const { data: overAllPrevTotal } = useFetchTotal({
    rpcFn: "get_funds_summary",
    key: "overAll-prev", // ✅ unique key
    ...getPrevPeriod(filters.overAll.subtitle),
  });
  const prevoverAllVal = Number(overAllPrevTotal?.overall_total_cash ?? 0);
  const overAllGrowth = calcGrowth(curroverAllVal, prevoverAllVal);





  /**
   * Stat Cards
   */
  const stats = [
    {
      icon: <AccountBalance />,
      iconBgColor: "bg-sky-400",
      statName: "Coop Share Capital",
      growthPercent: coopGrowth,
      amount: currCoopVal,
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
      amount: currClubFundsVal,
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
      amount: currExpensesVal,
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
      growthPercent: incomeGrowth ?? 0,
      amount: currIncomeVal ?? 0,
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
      icon: <Wallet />,
      iconBgColor: "bg-purple-400",
      statName: "Total Interest Income",
      growthPercent: interestIncomeGrowth ?? 0,
      amount: currinterestIncomeVal,
      subtitle: filters.interestIncome.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          interestIncome: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: interestIncomeLoading,
      error: interestIncomeIsError,
      errorMessage: interestIncomeError?.message,
    },
    {
      icon: <Wallet />,
      iconBgColor: "bg-purple-400",
      statName: "Total Fee Income", 
      growthPercent: feeIncomeGrowth ?? 0,
      amount: currfeeIncomeVal,
      subtitle: filters.feeIncome.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          feeIncome: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: feeIncomeLoading,
      error: feeIncomeIsError,
      errorMessage: feeIncomeError?.message,
    },
    {
      icon: <Savings />,
      iconBgColor: "bg-lime-400",
      statName: "Total Loan Released",
      growthPercent: loanReleaseGrowth,
      amount: currLoanReleaseVal,
      subtitle: filters.releaseLoan.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          releaseLoan: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: loanReleaseLoading,
      error: loanReleaseIsError,
      errorMessage: loanReleaseError?.message,
    },
    {
      icon: <AccountBalance />,
      iconBgColor: "bg-sky-400",
      statName: "Overall Total Cash",
      growthPercent: overAllGrowth,
      amount: curroverAllVal,
      subtitle: filters.overAll.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          overAll: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },
      loading: overAllLoading,
      error: overAllIsError,
      errorMessage: overAllError?.message,
    },
  ];
 
  return (
      <div className="mb-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col md:flex-col lg:flex-row xl:flex-row gap-4">

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
              linkPath={`/${memberRole}/coop-share-capital`}
              headers={["Ref No.","Account No", "Name", "Amount", "Payment Category", "Date", "Payment Method"]}
              data={coopFunds} // share capital / coop
              isLoading={coopIsloading}
              renderRow={(row) => {
                const TABLE_PREFIX = "SCC"; 
                const matchedMember = members.find((member_column) => member_column.account_number === row.account_number);
                const fullName = matchedMember ? `${matchedMember?.f_name} ${matchedMember?.l_name}`.trim() : "System";
                const isDisabled = !matchedMember; // condition (you can adjust logic)
                return (
                  <tr key={`${TABLE_PREFIX}_${row.coop_contri_id}`}
                       className={`text-center ${isDisabled ? "opacity-90" : "cursor-pointer hover:bg-base-200/50"}`}>
                    <td className='px-4 py-2'>{TABLE_PREFIX}_{row.coop_contri_id.toLocaleString() || "ID"}</td>
                    <td className='px-4 py-2'>{matchedMember?.account_number || "System"}</td>
                    <td className='px-4 py-2'>
                      <span className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]">{fullName}</span>
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
              linkPath={`/${memberRole}/club-funds`}
              headers={["Ref No.", "Name", "Amount", "Category", "Date", "Payment Method"]}
              data={clubFunds}
              isLoading={clubFundsIsLoading}
              renderRow={(row) => {
                const TABLE_PREFIX = "CFC";
                const matchedMember = members.find((member_column) => member_column.member_id === row.member_id);
                const fullName = matchedMember ? `${matchedMember.f_name ?? ""} ${matchedMember.l_name ?? ""}`.trim() : "Not Found";
                return (
                  <tr key={`${TABLE_PREFIX}_${row.contribution_id}`} className="text-center cursor-pointer hover:bg-base-200/50">
                    <td className='text-xs'>{TABLE_PREFIX}_{row.contribution_id?.toLocaleString() || "ID"}</td>

                    {/* Member Render from members table */}
                    <td>
                      <span className="gap-2">
                        {fullName}
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
              linkPath={`/${memberRole}/club-expenses`}
              headers={["Ref No.", "Title", "Amount", "Category", "Date"]}
              data={expenses}
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
          </div>

          {/* RIGHT SIDE */}
        <div className="w-full md:w-full lg:w-[25%] xl:w-[35%] flex flex-col gap-3">

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
  );
}

export default Dashboard;
