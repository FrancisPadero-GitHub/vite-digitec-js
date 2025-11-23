import {useState, Fragment, useMemo} from 'react'
import { Savings, AccountBalance, Wallet, ReceiptLong, TrendingUp, LocalAtm, AccountBalanceWallet, MonetizationOn, AccountBox, CreditCard, RequestQuoteOutlined, Receipt } from '@mui/icons-material';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import dayjs from 'dayjs';

// fetch hooks
import { useFetchClubFundsView } from '../../backend/hooks/shared/view/useFetchClubFundsView';
import { useFetchCoopView } from '../../backend/hooks/shared/view/useFetchCoopView';
import { useFetchExpenses } from '../../backend/hooks/shared/useFetchExpenses';
import { useFetchActivityLogs } from '../../backend/hooks/shared/useFetchActivityLogs';

// rpc fetch
import { useFetchTotal } from '../../backend/hooks/shared/useFetchTotal';

// helper 
import { useMemberRole } from '../../backend/context/useMemberRole';
import { display } from '../../constants/numericFormat';

// components
import DataTableV2 from './components/DataTableV2';
import CoopContributionChart from './components/CoopContributionChart';
import ExpensesChart from './components/ExpensesChart';
import ComparisonChart from './components/ComparisonChart';
import StatCardV2 from './components/StatCardV2';

// constants
import { CLUB_CATEGORY_COLORS, CAPITAL_CATEGORY_COLORS, ACTIVITY_LOGS_TYPE_COLORS} from '../../constants/Color';
import placeHolderAvatar from '../../assets/placeholder-avatar.png';

function DashboardV2() {
  const { memberRole } = useMemberRole();

  // The pagination and data fetching of these 3 tables is handled inside each DataTableV2 component instance using .slice(0,5)
  // to limit to 5 recent entries.
  const { data: coop_data, isLoading: coopIsloading, isError: coopIsError, error: coopError } = useFetchCoopView({});
  const coopFunds = coop_data?.data || [];

  const { data: club_funds_data, isLoading: clubFundsIsLoading, isError: clubFundsIsError, error: clubFundsError } = useFetchClubFundsView({});
  const clubFunds = club_funds_data?.data || [];

  const { data: expenses_data, isLoading: expensesIsLoading, isError: expensesIsError, error: expensesError } = useFetchExpenses({});
  const expenses = expenses_data?.data || [];

  const { data: activity_logs_data, isLoading: activityLogsIsLoading, isError: activityLogsIsError, error: activityLogsError } = useFetchActivityLogs({});
  const activityLogs = activity_logs_data?.data || [];

  // Navigation
  const navigate = useNavigate();
  const openProfile = (memberId) => {
    if (memberId) {
      navigate(`/${memberRole}/member-profile/${memberId}`);
    } else {
      toast.error("Member ID not found");
    }
  };

  // Filters state for the start cards and totals
  const [filters, setFilters] = useState({
    overAll: { month: null, year: null, subtitle: "All Time"},
  });

  // Helper to get previous period based on subtitle
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


  // RPC totals 
  const {
    data: currentSummary,
    isLoading: currentLoading,
    isError: currentError,
    error: currentErrorMsg,
  } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.overAll.year,
    month: filters.overAll.month,
    key: "funds-summary-current",
  });

  const {
    data: prevSummary,
    isLoading: prevLoading,
    isError: prevError,
    error: prevErrorMsg,
  } = useFetchTotal({
    rpcFn: "get_funds_summary",
    ...getPrevPeriod(filters.overAll.subtitle),
    key: "funds-summary-prev",
  });


  const loading = currentLoading || prevLoading;
  const error = currentError || prevError;
  const errorMessage = currentErrorMsg?.message || prevErrorMsg?.message || "Failed to load totals";

  // --- Compute Stats ---
  const stats = useMemo(() => {
    const c = currentSummary || {};
    const p = prevSummary || {};

    return [
      {
        statName: "Club Fund Balance",
        amount: Number(c.club_balance ?? 0),
        growthPercent: calcGrowth(c.club_balance, p.club_balance),
        iconBgColor: "bg-emerald-500",
        icon: <AccountBox />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: "Club Expenses",
        amount: Number(c.club_total_expenses ?? 0),
        type: "expenses",
        growthPercent: calcGrowth(c.club_total_expenses, p.club_total_expenses),
        iconBgColor: "bg-rose-500",
        icon: <ReceiptLong />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: "Coop Share Capital",
        amount: Number(c.club_total_coop ?? 0),
        growthPercent: calcGrowth(c.club_total_coop, p.club_total_coop),
        iconBgColor: "bg-blue-500",
        icon: <AccountBalance />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: " Loan Released",
        amount: Number(c.coop_total_principal_released ?? 0),
        growthPercent: calcGrowth(c.coop_total_principal_released, p.coop_total_principal_released),
        iconBgColor: "bg-amber-500",
        icon: <MonetizationOn />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: " Service Fee",
        amount: Number(c.club_total_service_fee_income ?? 0),
        growthPercent: calcGrowth(c.club_total_service_fee_income, p.club_total_service_fee_income),
        iconBgColor: "bg-cyan-500",
        icon: <Receipt />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: " Interest Income",
        amount: Number(c.club_total_interest_income ?? 0),
        growthPercent: calcGrowth(c.club_total_interest_income, p.club_total_interest_income),
        iconBgColor: "bg-violet-500",
        icon: <TrendingUp />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: " Fee Income",
        amount: Number(c.club_total_fees_income ?? 0),
        growthPercent: calcGrowth(c.club_total_fees_income, p.club_total_fees_income),
        iconBgColor: "bg-teal-500",
        icon: <LocalAtm />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: "Club Income",
        amount: Number(c.club_total_income ?? 0),
        growthPercent: calcGrowth(c.club_total_income, p.club_total_income),
        iconBgColor: "bg-purple-500",
        icon: <AccountBalanceWallet />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: "Overall Total Cash",
        amount: Number(c.overall_total_cash ?? 0),
        growthPercent: calcGrowth(c.overall_total_cash, p.overall_total_cash),
        iconBgColor: "bg-indigo-500",
        icon: <CreditCard />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
    ];
  }, [currentSummary, prevSummary, loading, error, errorMessage]);

  return (
    <div className="m-2 sm:m-3 lg:m-4">
      <Toaster position="bottom-left"/>
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold px-2 sm:px-0">Dashboard</h1>
        <div className="flex flex-col xl:flex-row gap-4">
          {/* LEFT SIDE - Main Content */}
          <div className="flex-1 flex flex-col gap-4 lg:gap-6">
            {/* Total Card Stats  */}
            <section className="mb-2 sm:mb-4 px-2 sm:px-0">
              <div className="flex items-center mb-3">
                <h2 className="text-lg sm:text-xl font-semibold mr-2">Overall Totals</h2>
                {/* Universal Filter */}
                <div className="dropdown dropdown-bottom sm:dropdown-right">
                  <label tabIndex={0} className="btn btn-sm btn-ghost">
                    <MoreHorizOutlinedIcon />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box z-[1] w-36 p-2 shadow-sm border border-base-300"
                  >
                    {["All Time", "This Month", "This Year"].map((date_label) => (
                      <li key={date_label}>
                        <button
                          className={`text-sm ${filters.overAll.subtitle === date_label
                              ? "text-primary font-semibold"
                              : "text-gray-500"
                            }`}
                          onClick={() =>
                            setFilters({
                              overAll: {
                                ...filters.overAll,
                                subtitle: date_label,
                                ...(date_label === "All Time"
                                  ? { month: null, year: null }
                                  : date_label === "This Month"
                                    ? {
                                      month: new Date().getMonth() + 1,
                                      year: new Date().getFullYear(),
                                    }
                                    : { month: null, year: new Date().getFullYear() }),
                              },
                            })
                          }
                        >
                          {date_label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Cards Grid - Responsive */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {stats.map((s, i) => (
                  <StatCardV2 key={i} {...s} subtitle={filters.overAll.subtitle} />
                ))}
              </div>
            </section>

            {/* Share Capital Area Chart */}
            <section className="border border-base-content/5 bg-base-100 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md min-h-[300px] sm:min-h-[400px] p-4 sm:p-6">
              <div className="p-2 sm:p-0 flex flex-col h-full">
                <div className="mb-4">
                  <span className="text-lg sm:text-xl lg:text-2xl font-semibold">Share Capital Activity</span>
                  <span className="text-gray-400 text-sm sm:text-base"> | This Year</span>
                  <p className="text-base-content/60 text-sm sm:text-base mt-1">Overview of total share capital contributions by month.</p>
                </div>
                <div className="w-full min-w-0 flex-1">
                  <CoopContributionChart
                    data={coopFunds}
                    isLoading={coopIsloading}
                    isError={coopIsError}
                    error={coopError}
                  />
                </div>
              </div>
            </section>

            {/* Data Tables */}
            <div className="space-y-4 lg:space-y-6">
              <DataTableV2
                title={"Share Capital / Coop"}
                type={"compact"}
                showLinkPath={true}
                linkPath={`/${memberRole}/coop-share-capital`}
                headers={["Ref No.", "Account No", "Name", "Amount", "Payment Category", "Date"]}
                data={coopFunds}
                isLoading={coopIsloading}
                renderRow={(row) => {
                  const TABLE_PREFIX = "SCC_";
                  const id = row?.coop_contri_id || "Not Found";
                  const memberId = row?.member_id || null;
                  const accountNo = row?.account_number || "System";
                  const avatarUrl = row?.avatar_url || placeHolderAvatar;
                  const fullName = row?.full_name || "Not Found";
                  const amount = row?.amount || 0;
                  const paymentCategory = row?.category || "Not Found";
                  const contributionDate = row?.contribution_date || "Not Found";
                  const isDisabled = !row?.full_name;
                  return (
                    <tr key={id}
                        className={`text-center ${isDisabled ?
                        "opacity-90" : "cursor-pointer hover:bg-base-200/50"}`}
                    >
                      <td className="text-xs sm:text-sm font-medium px-2 py-3">
                        {TABLE_PREFIX}{id}
                      </td>
                      <td className="text-xs sm:text-sm font-medium px-2 py-3 hover:underline"
                        onClick={() => openProfile(memberId)}
                      >
                        {accountNo}
                      </td>
                      <td className="px-2 py-3">
                        <span className="flex items-center gap-2 sm:gap-3">
                          <Fragment>
                            <div className="avatar">
                              <div className="mask mask-circle w-8 h-8 sm:w-10 sm:h-10">
                                <img
                                  src={avatarUrl}
                                  alt={fullName}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <span className="flex items-center gap-1 sm:gap-2">
                              <span className="hidden xs:inline truncate max-w-[80px] sm:max-w-[120px]">{fullName}</span>
                              <span className="xs:hidden text-xs truncate max-w-[60px]">{fullName.split(' ')[0]}</span>
                              {isDisabled && (
                                <div className="tooltip tooltip-top" data-tip="System Generated">
                                  <span className="badge badge-xs sm:badge-sm badge-ghost">?</span>
                                </div>
                              )}
                            </span>
                          </Fragment>
                        </span>
                      </td>
                      <td className="font-semibold text-success text-xs sm:text-sm px-2 py-3">
                        ₱ {display(amount)}
                      </td>
                      <td className="px-2 py-3">
                        {paymentCategory ? (
                          <span className={`badge badge-soft font-semibold text-xs ${CAPITAL_CATEGORY_COLORS[paymentCategory]}`}>
                            <span className="hidden sm:inline">{paymentCategory}</span>
                            <span className="sm:hidden">{paymentCategory.split(' ')[0]}</span>
                          </span>
                        ) : (
                          <span className="badge font-semibold badge-error text-xs">N/A</span>
                        )}
                      </td>
                      <td className="text-xs sm:text-sm px-2 py-3">
                        {contributionDate ? new Date(contributionDate).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  )
                }}
              />
              
              <DataTableV2
                title={"Club Funds"}
                type={"compact"}
                showLinkPath={true}
                linkPath={`/${memberRole}/club-funds`}
                headers={["Ref No.", "Account No.", "Name", "Amount", "Category", "Date"]}
                data={clubFunds}
                isLoading={clubFundsIsLoading}
                renderRow={(row) => {
                  const TABLE_PREFIX = "CFC_"
                  const id = row?.contribution_id || "Not Found";
                  const memberId = row?.member_id || null;
                  const accountNo = row?.account_number || "Not Found";
                  const fullName = row?.full_name || "Not Found";
                  const avatarUrl = row?.avatar_url || placeHolderAvatar;
                  const amount = row?.amount || 0;
                  const clubCategory = row?.category || "Not Found";
                  const paymentDate = row?.payment_date || "Not Found";
                  return (
                    <tr key={id}
                      className="text-center cursor-pointer hover:bg-base-200/50"
                    >
                      <td className="text-xs sm:text-sm font-medium px-2 py-3">
                        {TABLE_PREFIX}{id}
                      </td>
                      <td className="text-xs sm:text-sm font-medium px-2 py-3 hover:underline"
                        onClick={() => openProfile(memberId)}
                      >
                        {accountNo || "N/A"}
                      </td>
                      <td className="px-2 py-3">
                        <span className="flex items-center gap-2 sm:gap-3">
                          <Fragment>
                            <div className="avatar">
                              <div className="mask mask-circle w-8 h-8 sm:w-10 sm:h-10">
                                <img
                                  src={avatarUrl}
                                  alt={fullName}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <span className="hidden xs:inline truncate max-w-[80px] sm:max-w-[120px]">{fullName}</span>
                            <span className="xs:hidden text-xs truncate max-w-[60px]">{fullName.split(' ')[0]}</span>
                          </Fragment>
                        </span>
                      </td>
                      <td className="font-semibold text-success text-xs sm:text-sm px-2 py-3">
                        ₱ {display(amount)}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`font-semibold text-xs sm:text-sm ${CLUB_CATEGORY_COLORS[clubCategory]}`}
                        >
                          <span className="hidden sm:inline">{clubCategory}</span>
                          <span className="sm:hidden">{clubCategory.split(' ')[0]}</span>
                        </span>
                      </td>
                      <td className="text-xs sm:text-sm px-2 py-3">
                        {new Date(paymentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                }}
              />
              
              <DataTableV2
                title={"Club Expenses"}
                type={"compact"}
                showLinkPath={true}
                linkPath={`/${memberRole}/club-expenses`}
                headers={["Ref No.", "Title", "Amount", "Category", "Date"]}
                data={expenses}
                isLoading={expensesIsLoading}
                renderRow={(row) => {
                  const TABLE_PREFIX = "EXP_";
                  const id = row?.transaction_id || "Not Found";
                  const title = row?.title || "Not Found";
                  const amount = row?.amount || 0;
                  const category = row?.category || "Not Found";
                  const transactionDate = row?.transaction_date || "Not Found";
                  return (
                    <tr key={id}
                      className="text-center cursor-pointer hover:bg-base-200/50"
                    >
                      <td className="text-xs sm:text-sm font-medium px-2 py-3">
                        {TABLE_PREFIX}{id}
                      </td>
                      <td className="text-xs sm:text-sm font-medium px-2 py-3 truncate max-w-[120px] sm:max-w-none">
                        {title}
                      </td>
                      <td className="font-semibold text-error text-xs sm:text-sm px-2 py-3">
                        ₱ {display(amount)}
                      </td>
                      <td className="px-2 py-3">
                        <span className={`font-semibold text-xs sm:text-sm ${CLUB_CATEGORY_COLORS[category]}`}>
                          <span className="hidden sm:inline">{category}</span>
                          <span className="sm:hidden">{category.split(' ')[0]}</span>
                        </span>
                      </td>
                      <td className="text-xs sm:text-sm px-2 py-3">
                        {new Date(transactionDate).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                }}
              />
            </div>
          </div>

          {/* RIGHT SIDE - Sidebar */}
          <div className="w-full xl:w-[350px] 2xl:w-[400px] flex flex-col gap-4 lg:gap-6">
            {/* RECENT ACTIVITIES */}
            <section className="card bg-base-100 shadow-sm sm:shadow-md min-h-[300px] sm:min-h-[400px] p-4 sm:p-5 rounded-xl sm:rounded-2xl">
              <div className="flex flex-row justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Recent Activity</h2>
                <button 
                  onClick={() => navigate(`/${memberRole}/activity-logs`)} 
                  className="btn btn-link no-underline text-primary hover:underline p-0 min-h-0 h-auto text-sm sm:text-base"
                >
                  See More ➜
                </button>
              </div>
              
              {activityLogsIsLoading ? (
                <div className="flex justify-center items-center h-40 sm:h-64">
                  <span className="loading loading-spinner loading-sm sm:loading-md"></span>
                </div>
              ) : activityLogsIsError ? (
                <div className="text-center text-error py-6 sm:py-8 text-sm sm:text-base">
                  {activityLogsError?.message || "Unknown error"}
                </div>
              ) : (
                <ul className="space-y-3 sm:space-y-4 relative before:absolute before:top-0 before:bottom-0 before:left-2.5 before:w-px before:bg-base-300">      
                  {activityLogs?.slice(0, 6).map((log, index) => {
                    const dotColor = ACTIVITY_LOGS_TYPE_COLORS[log.type] || 'bg-primary';
                    return (
                      <li key={log.activity_log_id || index} className="relative pl-6 sm:pl-8">
                        <span className={`badge ${dotColor} w-2 h-2 sm:w-3 sm:h-3 p-0 rounded-full absolute left-1 sm:left-1 top-1.5`}></span>
                        <div className="text-xs sm:text-sm leading-tight">
                          <p className="font-medium line-clamp-2">{log.action}</p>
                          <p className="text-xs text-base-content/50 mt-1">
                            {dayjs(log.timestamp).format('MMM D, YYYY h:mm A')}
                          </p>
                        </div>
                        {index !== activityLogs.length - 1 && (<div className="mt-2 sm:mt-3 border-b border-base-200" />)}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* CLUB EXPENSES DONUT CHART */}
            <section className="card bg-base-100 shadow-sm sm:shadow-md min-h-[300px] sm:min-h-[400px] p-4 sm:p-5 rounded-xl sm:rounded-2xl">
              <div className="flex flex-col h-full">
                <div className="mb-3">
                  <span className="text-lg sm:text-xl font-semibold">Club Expenses Breakdown</span>
                  <span className="text-gray-400 text-sm sm:text-base"> | All Time</span>
                  <p className="ext-xs sm:text-sm text-base-content/100">
                    Distribution of club expenses by category
                  </p>
                </div>
                <div className="flex-grow">
                  <ExpensesChart
                    data={expenses}
                    isLoading={expensesIsLoading}
                    isError={expensesIsError}
                    error={expensesError}
                  />
                </div>
              </div>
            </section>

            {/* CLUB FUNDS VS EXPENSES DUAL LINE CHART */}
            <section className="card bg-base-100 shadow-sm sm:shadow-md min-h-[300px] sm:min-h-[400px] p-4 sm:p-5 rounded-xl sm:rounded-2xl">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <span className="text-lg sm:text-xl font-semibold">Club Funds vs. Expenses</span>
                  <span className="text-gray-400 text-sm sm:text-base"> | This Year</span>
                  <p className="mt-1 text-xs sm:text-sm text-base-content/70">
                    Track yearly trends between club funds and expenses.
                  </p>
                </div>
                <div className="flex-grow">
                  <ComparisonChart
                    clubFundsData={clubFunds}
                    expensesData={expenses}
                    isLoading={clubFundsIsLoading || expensesIsLoading}
                    isError={clubFundsIsError || expensesIsError}
                    error={clubFundsError || expensesError}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>  
    </div>
  )
}

export default DashboardV2