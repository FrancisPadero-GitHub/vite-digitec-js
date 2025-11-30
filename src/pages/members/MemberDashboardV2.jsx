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
import { useFetchMonthlyDues } from "../../backend/hooks/member/useFetchMemberMonthlyDues";

// fetch hooks
import { useFetchClubFundsView } from '../../backend/hooks/shared/view/useFetchClubFundsView';
import { useFetchCoopView } from '../../backend/hooks/shared/view/useFetchCoopView';
import { useFetchLoanPayments } from "../../backend/hooks/shared/useFetchPayments";

// helpers
import { useMemberRole } from "../../backend/context/useMemberRole"; 

// components
import StatCardV2 from "../shared/components/StatCardV2";
import DataTableV2 from "../shared/components/DataTableV2";

// constants
import {CLUB_CATEGORY_COLORS, CAPITAL_CATEGORY_COLORS,} from "../../constants/Color";
import { display } from "../../constants/numericFormat";

function MemberDashboardV2() {
  const { memberRole } = useMemberRole();

  const navigate = useNavigate();

  // The pagination and data fetching of these 2 tables is handled inside each DataTableV2 component instance using .slice(0,5)
  // to limit to 5 recent entries.
  const { data: coopData, isLoading: coopLoading, } = useFetchCoopView({
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
    <div className="m-3">
      <div className="space-y-3">
        <h1 className="text-lg lg:text-2xl font-bold">Dashboard</h1>

        <div className="flex items-center mb-2">
          <h2 className="text-md font-semibold mr-2">Overall Totals</h2>
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
            <div className="bg-base-100 rounded-xl shadow-sm p-4 flex-1 flex flex-col gap-2">
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
              <div className="bg-base-200 rounded-xl p-4">
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
                  <div className="text-center">
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
          <DataTableV2
            title={"My Share Capital / Coop Contributions"}
            type={"compact"}
            showLinkPath={true}
            linkPath={`/${memberRole}/share-capital`}
            headers={["Ref No.", "Amount", "Payment Category", "Date"]}
            data={coopFunds} // share capital / coop
            isLoading={coopLoading}
            renderRow={(row) => {
              const TABLE_PREFIX = "SCC_";
              const id = row?.coop_contri_id || "Not Found";
              const amount = row?.amount || 0;
              const paymentCategory = row?.category;
              const contributionDate = row?.contribution_date 
                ? new Date(row.contribution_date).toLocaleDateString() 
                : "Not Found";

              return (
                <tr key={id} className="text-center hover:bg-base-200/50">
                  {/* Ref no. */}
                  <td className=" text-center font-medium text-xs">
                    {TABLE_PREFIX}{id}
                  </td>

                  {/* Amount */}
                  <td className="font-semibold text-success">
                    ₱ {display(amount)}
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

                  {/* Contribution Date */}
                  <td>
                    {contributionDate}
                  </td>
                </tr>
              )
            }}
          />

          <DataTableV2
            title={"My Club Fund Contributions"}
            type={"compact"}
            showLinkPath={true}
            linkPath={`/${memberRole}/club-funds`}
            headers={["Ref No.", "Amount", "Category", "Date"]}
            data={clubFunds}
            isLoading={clubLoading}
            renderRow={(row) => {
              const TABLE_PREFIX = "CFC_";
              const id = row?.contribution_id || "Not Found";
              const amount = row?.amount || 0;
              const category = row?.category;
              const paymentDate = row?.payment_date
                ? new Date(row.payment_date).toLocaleDateString()
                : "Not Found";

              return (
                <tr key={id} className="text-center hover:bg-base-200/50">
                  {/* Ref no. */}
                  <td className=" text-center font-medium text-xs">
                    {TABLE_PREFIX}{id}
                  </td>

                  {/* Amount */}
                  <td className="font-semibold text-success">
                    ₱ {display(amount)}
                  </td>

                  {/* Payment Category */}
                  <td>
                    {category ? (
                      <span className={`font-semibold ${CLUB_CATEGORY_COLORS[category]}`}>
                        {category}
                      </span>
                    ) : (
                      <span className="font-semibold">Not Found</span>
                    )}
                  </td>

                  {/* Contribution Date */}
                  <td>
                    {paymentDate}
                  </td>
                </tr>
              )
            }}
          />

          <DataTableV2
            title={"My Loan Payments"}
            type={"compact"}
            showLinkPath={true}
            linkPath={`/${memberRole}/coop-loans/payments`}
            headers={["Payment Ref.", "Loan Ref No.", "Amount", "Status", "Date"]}
            data={payments}
            isLoading={loanPaymentsLoading}
            renderRow={(row) => {
              const TABLE_PREFIX = "LP_";
              const id = row?.payment_id || "Not Found";
              const loanRefNumber = row?.loan_ref_number || "Not Found";
              const amount = row?.total_amount || 0;
              const status = row?.status || "Not Found";
              const paymentDate = row?.payment_date
                ? new Date(row.payment_date).toLocaleDateString()
                : "Not Found";

              return (
                <tr key={id} className="text-center hover:bg-base-200/50">
                  {/* Payment Ref. */}
                  <td className="text-center font-medium text-xs">
                    {TABLE_PREFIX}{id}
                  </td>

                  {/* Loan Ref No. */}
                  <td>
                    {loanRefNumber}
                  </td>

                  {/* Amount */}
                  <td className="font-semibold text-success">
                    ₱ {display(amount)}
                  </td>

                  {/* Status */}
                  <td className="font-semibold text-info">
                    {status}
                  </td>

                  {/* Payment Date */}
                  <td className="">
                    {paymentDate}
                  </td>
                </tr>
              )
            }}
          />
        </section>
      </div>
    </div>
  );
}

export default MemberDashboardV2;
