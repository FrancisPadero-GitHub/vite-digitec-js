import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AccountBalance,
  Savings,
  Wallet,
  Payments,
  AccountBalanceWalletOutlined,
  EventAvailableOutlined,
  ArrowForward,
  MoreHorizOutlined,
} from "@mui/icons-material";

// rpc hooks
import { useFetchTotal } from "../../backend/hooks/shared/useFetchTotal";
import { useFetchMemberTotal } from "../../backend/hooks/member/useFetchMemberTotals";
import { useFetchNextLoanPayment } from "../../backend/hooks/member/useFetchNextLoanPayment";
import { useFetchMonthlyDues } from "../../backend/hooks/member/useFetchMemberMonthyDues";

// fetch hooks
// view tables
import { useFetchClubFundsView } from '../../backend/hooks/shared/view/useFetchClubFundsView';
import { useFetchCoopView } from '../../backend/hooks/shared/view/useFetchCoopView';
// base tables
import { useFetchLoanPayments } from "../../backend/hooks/shared/useFetchPayments";

// helpers
import { useMemberRole } from "../../backend/context/useMemberRole"; 

// components
import StatCardV2 from "../shared/components/StatCardV2";
import DataTableMember from "./modal/DataTableMember";

// constants
import {
  CLUB_CATEGORY_COLORS,
  PAYMENT_METHOD_COLORS,
  CAPITAL_CATEGORY_COLORS,
} from "../../constants/Color";

function MemberDashboardV2() {
  const { memberRole } = useMemberRole();

  const navigate = useNavigate();

  // The pagination and data fetching of these 2 tables is handled inside each DataTable component instance using .slice(0,5)
  // to limit to 5 recent entries.
  const { data: coopData, isLoading: coopLoading } = useFetchCoopView({
    useLoggedInMember: true,
  });
  const coopFunds = coopData?.data || [];

  const { data: clubFundData, isLoading: clubLoading } = useFetchClubFundsView({
    useLoggedInMember: true,
  });
  const clubFunds = clubFundData?.data || [];

  // To Fix
  const { data: loanPayments, isLoading: loanPaymentsLoading } =
    useFetchLoanPayments({ page: 1, limit: 20, useLoggedInMember: true });
  const payments = loanPayments?.data || [];


  // Filter state (universal)
  const [filters, setFilters] = useState({
    overAll: { month: null, year: null, subtitle: "All Time" },
  });

  // Helpers
  const getPrevPeriod = (subtitle) => {
    if (subtitle === "This Month") {
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { month: prev.getMonth() + 1, year: prev.getFullYear() };
    }
    if (subtitle === "This Year") {
      return { month: null, year: new Date().getFullYear() - 1 };
    }
    return { month: null, year: null };
  };

  const calcGrowth = (current, previous) => {
    const c = Number(current);
    const p = Number(previous);
    if (!isFinite(c) || !isFinite(p) || p === 0) return 0;
    return Math.round(((c - p) / p) * 100);
  };

  // RPC Totals (Personal + Club)
  const { 
    data: currentSummary,
    isLoading: currentLoading,
    isError: currentError,
    error: currentErrorMsg, 
  } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: filters.overAll.year,
    month: filters.overAll.month,
    key: "member-funds-summary-current",
  });

  const { 
    data: prevSummary,
    isLoading: prevLoading,
    isError: prevError,
    error: prevErrorMsg,
   } = useFetchTotal({
    rpcFn: "get_funds_summary",
    ...getPrevPeriod(filters.overAll.subtitle),
    key: "member-funds-summary-prev",
  });

  const { data: personalClubFunds } = useFetchMemberTotal({
    rpcFn: "get_club_funds_total_by_member",
    year: filters.overAll.year,
    month: filters.overAll.month,
  });

  const { data: personalCoopFunds } = useFetchMemberTotal({
    rpcFn: "get_coop_contributions_total_by_member",
    year: filters.overAll.year,
    month: filters.overAll.month,
  });

  const { data: monthlyDues, isLoading: monthlyDuesLoading } =
    useFetchMonthlyDues({ year: new Date().getFullYear() });

  const { data: nextPayment, isLoading: nextPaymentLoading } =
    useFetchNextLoanPayment();

  const loading = currentLoading || prevLoading || monthlyDuesLoading || nextPaymentLoading;
  const error = currentError || prevError;
  const errorMessage = currentErrorMsg?.message || prevErrorMsg?.message || "Failed to load totals";

  // Memoized Stats
  const stats = useMemo(() => {
    const c = currentSummary || {};
    const p = prevSummary || {};

    return [
      {
        statName: "My Coop Share Capital",
        amount: Number(personalCoopFunds ?? 0),
        growthPercent: calcGrowth(personalCoopFunds, 0),
        iconBgColor: "bg-blue-400",
        icon: <Wallet />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: "Total Coop Share Capital",
        amount: Number(c.club_total_coop ?? 0),
        growthPercent: calcGrowth(c.club_total_coop, p.club_total_coop),
        iconBgColor: "bg-sky-400",
        icon: <AccountBalance />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: "My Club Funds",
        amount: Number(personalClubFunds ?? 0),
        growthPercent: calcGrowth(personalClubFunds, 0),
        iconBgColor: "bg-green-400",
        icon: <Payments />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
      {
        statName: "Total Club Funds",
        amount: Number(c.club_balance ?? 0),
        growthPercent: calcGrowth(c.club_balance, p.club_balance),
        iconBgColor: "bg-lime-400",
        icon: <Savings />,
        loading: loading,
        error: error,
        errorMessage: errorMessage,
      },
    ];
  }, [currentSummary, prevSummary, personalClubFunds, personalCoopFunds, loading, error, errorMessage]);

  const monthlyDuesAmount = monthlyDues?.total_amount ?? 0;
  const monthlyDuesDate = monthlyDues?.latest_period
    ? new Date(monthlyDues.latest_period).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const nextPaymentAmount = nextPayment?.total_due ?? 0;
  const nextPaymentDate = nextPayment?.due_date
    ? new Date(nextPayment.due_date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "No upcoming payments";

  return (
    <div className="p-0 min-h-screen space-y-6">
      <h1 className="text-2xl font-bold mr-2">Dashboard</h1>

      <div className="flex items-center mb-2">
        <h2 className="text-xl font-semibold mr-2">Overall Totals</h2>
        {/* Universal Filter */}
        <div className="dropdown dropdown-right">
          <label tabIndex={0} className="btn btn-sm">
            <MoreHorizOutlined/>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36"
          >
            {["All Time", "This Year", "This Month"].map((label) => (
              <li key={label}>
                <button
                  onClick={() =>
                    setFilters({
                      overAll: {
                        subtitle: label,
                        month: label === "This Month" ? new Date().getMonth() + 1 : null,
                        year: label !== "All Time" ? new Date().getFullYear() : null,
                      },
                    })
                  }
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6 xl:items-stretch">
        {/* LEFT */}
        <div className="xl:col-span-2">
          <div className="bg-base-100 rounded-xl shadow-sm p-6">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map((item, index) => (
                <StatCardV2 key={index} {...item} subtitle={filters.overAll.subtitle} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT*/}
        <div className="xl:col-span-1 flex">
          <div className="bg-base-100 rounded-xl shadow-sm p-6 flex-1 flex flex-col gap-2">
            {/* Monthly Dues Card */}
            <div className="bg-blue-500 rounded-xl p-5 text-white mt-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EventAvailableOutlined fontSize="small" />
                  <h3 className="text-lg font-medium">Monthly Dues (This Year)</h3>
                </div>
                <button onClick={() => navigate('/regular-member/club-funds')} className="btn btn-circle btn-sm btn-ghost text-white">
                  <ArrowForward fontSize="small" />
                </button>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {loading ? (
                    <span className="loading loading-spinner loading-md"></span>
                  ) : (
                    `₱${monthlyDuesAmount.toLocaleString()}`
                  )}
                </div>
              </div>
              
              <p className="text-xs">
                {loading ? ("Loading...") : (`As of ${monthlyDuesDate}`)}
              </p>
            </div>

            {/* Next Loan Payment Card */}
            <div className="bg-base-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2 text-base-content/70 justify-between">
                <div className="flex items-center gap-2">
                  <AccountBalanceWalletOutlined fontSize="small" />
                  <h3 className="text-lg font-semibold">Next Loan Payment</h3>
                </div>
                <button onClick={() => navigate('/regular-member/coop-loans/loan-payments')} className="btn btn-circle btn-sm btn-ghost text-base-content/70">
                  <ArrowForward fontSize="small" />
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-base-content/50">Loading...</p>
              ) : nextPaymentAmount > 0 ? (
                <>
                  <div className="text-3xl font-bold text-red-500">₱{nextPaymentAmount.toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 badge badge-soft badge-error text-xs font-medium">Due Soon:</span>
                    <p className="text-xs text-base-content/70">{nextPaymentDate}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <div className="text-lg font-medium text-base-content/60">No Active Loans</div>
                  <p className="text-xs text-base-content/50">You have no upcoming loan payments</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Transactions */}
      <section className="bg-base-100 rounded-xl shadow-sm p-6 space-y-6">

        <DataTableMember
          title="My Share Capital / Coop Contributions"
          linkPath={`/${memberRole}/share-capital`}
          headers={["Ref No.", "Amount", "Payment Category", "Date", "Payment Method"]}
          data={coopFunds}
          isLoading={coopLoading}
          renderRow={(row) => {
            const TABLE_PREFIX = "SCC_";
            const id = row.coop_contri_id;
            const amount = row.amount;
            const paymentCategory = row.category;
            const contributionDate = new Date(row.contribution_date).toLocaleDateString();
            const paymentMethod = row.payment_method;

            return (
              <tr key={id} className="text-center hover:bg-base-200/50">
                 {/* Ref no. */}
                <td className=" text-center font-medium text-xs">
                  {TABLE_PREFIX}{id}
                </td>

                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {amount?.toLocaleString() || "0"}
                </td>
                {/* Payment Category */}
                <td>
                  {paymentCategory ? (
                    <span className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[paymentCategory]}`}>
                      {paymentCategory}
                    </span>
                  ) : (
                    <span className="badge font-semibold badge-error">Not Found</span>
                  )}
                </td>
                {/* Payment Method */}
                <td>
                  <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}>
                    {paymentMethod}
                  </span>
                </td>
                {/* Contribution Date */}
                <td className=''>
                  {contributionDate ? new Date(contributionDate).toLocaleDateString() : "Not Found"}
                </td>
              </tr>
            )
          }}
        />

        <DataTableMember
          title="My Club Funds"
          linkPath={`/${memberRole}/club-funds`}
          headers={["Ref No.", "Amount", "Category", "Date", "Payment Method"]}
          data={clubFunds}
          isLoading={clubLoading}
          renderRow={(row) => {
            const TABLE_PREFIX = "CFC_";
            const id = row.contribution_id;
            const amount = row.amount;
            const category = row.category;
            const paymentDate = new Date(row.payment_date).toLocaleDateString();
            const paymentMethod = row.payment_method;

            return (
              <tr key={id} className="text-center hover:bg-base-200/50">
                {/* Ref No. */}
                <td className="text-center font-medium text-xs">
                  {TABLE_PREFIX}{id}
                </td>

                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {amount?.toLocaleString() || "0"}
                </td>

                {/* Category */}
                <td>
                  <span className={`font-semibold ${CLUB_CATEGORY_COLORS[category]}`}>
                    {category}
                  </span>
                </td>

                {/* Payment Method */}
                <td>
                  <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}>
                    {paymentMethod}
                  </span>
                </td>

                {/* Payment Date */}
                <td className="">
                  {paymentDate || "Not Found"}
                </td>
              </tr>
            )
          }}
        />

        <DataTableMember
          title="My Loan Payments"
          linkPath={`/${memberRole}/coop-loans/loan-payments`}
          headers={[
            "Payment Ref.",
            "Loan Ref No.",
            "Amount",
            "Status",
            "Payment Method",
            "Date",
          ]}
          data={payments}
          isLoading={loanPaymentsLoading}
          renderRow={(row) => {
            const TABLE_PREFIX = "LP_";
            const id = row.payment_id;
            const loanRefNumber = row.loan_ref_number;
            const amount = row.total_amount;
            const status = row.status;
            const paymentMethod = row.payment_method;
            const paymentDate = new Date(row.payment_date).toLocaleDateString();

            return (
              <tr key={id} className="text-center hover:bg-base-200/70">
                {/* Payment Ref. */}
                <td className="text-center font-medium text-xs">
                  {TABLE_PREFIX}{id}
                </td>

                {/* Loan Ref No. */}
                <td>
                  {loanRefNumber || "Not Found"}
                </td>

                {/* Amount */}
                <td className="font-semibold text-success">
                  ₱ {amount?.toLocaleString() || "0"}
                </td>

                {/* Status */}
                <td className="font-semibold text-info">
                  {status}
                </td>

                {/* Payment Method */}
                <td>
                  <span className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}>
                    {paymentMethod}
                  </span>
                </td>

                {/* Payment Date */}
                <td className="">
                  {paymentDate || "Not Found"}
                </td>
              </tr>
            )
          }}
        />
      </section>
    </div>
  );
}

export default MemberDashboardV2;
