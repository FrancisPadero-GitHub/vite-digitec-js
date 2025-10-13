// icons
import { 
  AccountBalance,
  MonetizationOn,
  CreditScore,
  EventNote,
  Savings,
  Wallet, 
  ReceiptLong,
  AttachMoney

} from "@mui/icons-material";

// Hooks
import { useState } from "react";
import { useFetchCoopByMember } from "../members/hooks/useFetchCoopByMember";
import { useFetchClubFundsByMember } from "./hooks/useFetchClubFundsByMember";
import { useFetchMemberTotal } from "./hooks/useFetchMemberTotals";
// import { useFetchLoanAcc } from "./hooks/useFetchLoanAcc";

import { useFetchTotal } from "../shared/hooks/useFetchTotal";

// import { useFetchMemberPaySched } from "../board/hooks/useFetchMemberPaySched";

// Components
import StatCardMember from "./modal/StatCardMember";
import DataTableMember from "./modal/DataTableMember";
import LoanScheduleCardList from "../board/components/LoanScheduleCardList";

// Constant Colors
import { CLUB_CATEGORY_COLORS, PAYMENT_METHOD_COLORS, CAPITAL_CATEGORY_COLORS} from "../../constants/Color";

function MemberDashboard() {
  const { data: coopData, coopIsLoading } = useFetchCoopByMember();
  const { data: clubFundData, clubIsLoading } = useFetchClubFundsByMember();

  // const {data: loanAcc} = useFetchLoanAcc();
  // const loanAccRaw = loanAcc?.data || [];

  // const targetLoan = loanAccRaw.find(item => item.status === "Active"); // allows only 1 row to return with this policy
  // const loanId = targetLoan ? targetLoan.loan_id : null;

  // const [page, setPage] = useState(1);
  // const [limit] = useState(20);
  // const { data: loanSchedules, isLoading } = useFetchMemberPaySched(page, limit, loanId); // 1 and 12 since only 12 months is the max on this one
  // const loanSchedRaw = loanSchedules?.data || [];
  // const total = loanSchedules?.count || 0;
  
 
  
  // Filters for the cards
  const subText = "All Time";
  const [filters, setFilters] = useState({
    // Personal
    personalFunds: { month: null, year: null, subtitle: subText },
    personalCoop: { month: null, year: null, subtitle: subText },

    // Club 
    clubFunds: { month: null, year: null, subtitle: subText },
    coopFunds: { month: null, year: null, subtitle: subText },
  });

  // Helper to compute previous period filter and growthPercentage
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


  /**
   * Club Funds Personal and Club
   */
  const { data: pcfData, isLoading: pcfLoading, isError: pcfIsError, error: pcfError } = useFetchMemberTotal({
    rpcFn: "get_club_funds_total_by_member",
    year: filters.personalFunds.year,
    month: filters.personalFunds.month,
  });
  const { data: pcfPrevBal } = useFetchMemberTotal({
    rpcFn: "get_club_funds_total_by_member",
    ...getPrevPeriod(filters.personalFunds.subtitle),
    });
  const pcfGrowth = calcGrowth(pcfData, pcfPrevBal);

  const { data: clubFundsBalance, isLoading: cfBalLoading, isError: cfBalIsError, error: cfBalError } = useFetchTotal({
    rpcFn: "get_club_funds_balance",
    year: filters.clubFunds.year,
    month: filters.clubFunds.month,
  });
  const { data: cfPrevBal } = useFetchTotal({
    rpcFn: "get_club_funds_balance",
    ...getPrevPeriod(filters.clubFunds.subtitle),
  });
  const cfGrowth = calcGrowth(clubFundsBalance, cfPrevBal);

  /**
   * End of Club Funds Personal and Club
   */


  /**
   * Share / Coop Capital Personal and Club
   */
  const { data: pscData, isLoading: pscLoading, isError: pscIsError, error: pscError } = useFetchMemberTotal({
    rpcFn: "get_coop_contributions_total_by_member",
    year: filters.personalCoop.year,
    month: filters.personalCoop.month,
  });
  const { data: pscPrevBal } = useFetchMemberTotal({
    rpcFn: "get_coop_contributions_total_by_member",
    ...getPrevPeriod(filters.personalCoop.subtitle),
  });
  const pscGrowth = calcGrowth(pscData, pscPrevBal);

  // Share Capital Coop
  const { data: coopTotal, isLoading: coopLoading, isError: coopIsError, error: coopError } = useFetchTotal({
    rpcFn: "get_coop_contributions_total",
    year: filters.coopFunds.year,
    month: filters.coopFunds.month,
  });
  const { data: coopPrevTotal } = useFetchTotal({
    rpcFn: "get_coop_contributions_total",
    ...getPrevPeriod(filters.coopFunds.subtitle),
  });
  const coopGrowth = calcGrowth(coopTotal, coopPrevTotal);
  /**
   * End of Share / Coop Capital Personal and Club
   */




  const personalStats = [
    {
      icon: <AccountBalance />,
      iconBgColor: "bg-lime-400",
      title: "Club Fund",
      amount: pcfData ?? 0,
      growthPercent: pcfGrowth,
      subtitle: filters.personalFunds.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          personalFunds: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },

      loading: pcfLoading,
      error: pcfIsError,
      errorMessage: pcfError?.message,
    },

    {
      icon: <Wallet />,
      iconBgColor: "bg-sky-400",
      title: "Share / Coop Capital",
      amount: pscData ?? 0,
      growthPercent: pscGrowth,
      subtitle: filters.personalCoop.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          personalCoop: {
            subtitle: label,
            month: label === "This Month" ? new Date().getMonth() + 1 : null,
            year: label !== "All Time" ? new Date().getFullYear() : null,
          },
        }));
      },

      loading: pscLoading,
      error: pscIsError,
      errorMessage: pscError?.message,
    },
  ]


  const clubStats = [
    {
      icon: <AttachMoney />,
      iconBgColor: "bg-lime-300",
      title: "Club Fund Money",
      amount: clubFundsBalance ?? 0,
      growthPercent: cfGrowth,
      subtitle: filters.clubFunds.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          clubFunds: {
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
      icon: <Savings />,
      iconBgColor: "bg-sky-300",
      title: "Coop Total Money",
      amount: coopTotal ?? 0,
      growthPercent: coopGrowth,
      subtitle: filters.coopFunds.subtitle,
      onSubtitleChange: (label) => {
        setFilters((prev) => ({
          ...prev,
          coopFunds: {
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
  ]

  return (
    <div className="p-0 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">


        {/* Personal Dashboard */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">My Personal Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {personalStats.map((stats_items, stat_id) => (
                <StatCardMember key={stat_id} {...stats_items} />
              ))}

            </div>
          </div>
        </div>

        {/* Club Overview */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Club Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {clubStats.map((stats_items, stat_id) => (
                <StatCardMember key={stat_id} {...stats_items} />
              ))}

            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2 mb-4">
            <h2 className="card-title">
              Recent Transactions
              <span className="text-sm text-base-content/60">| Latest First</span>
            </h2>

            {/* FilterToolbar here */}
          </div>
          <DataTableMember
            title={"Share Capital / Coop"}
            linkPath={"/regular-member/regular-member-share-capital"}
            headers={["Ref No.", "Amount", "Payment Category", "Date", "Remarks"]}

            data={coopData?.data ?? []}
            isLoading={coopIsLoading}
            renderRow={(row) => {
              const TABLE_PREFIX = "SCC";
              
              return (
                <tr key={`${TABLE_PREFIX}_${row.coop_contri_id}`} className="text-center cursor-pointer hover:bg-base-200/50">
                  <td>{TABLE_PREFIX}_{row.coop_contri_id.toLocaleString() || "ID"}</td>
                  
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

                  <td>
                    {row.contribution_date ? new Date(row.contribution_date).toLocaleDateString() : "Not Provided"}
                  </td>
                  <td>
                    {row.remarks}
                  </td>

                </tr>
              )
            }}
          /> 

          <DataTableMember
            title={"Club Funds"}
            linkPath={"/regular-member/regular-member-club-funds"} // will provide later on
            headers={["Ref No.","Amount", "Category", "Date", "Payment Method"]}
            data={clubFundData?.data ?? []} // destructed it to get the data only not the count
            isLoading={clubIsLoading}
            renderRow={(row) => {
              const TABLE_PREFIX = "CFC";
              
              return (
                <tr key={`${TABLE_PREFIX}_${row.contribution_id}`} className="text-center cursor-pointer hover:bg-base-200/50">
                  <td>{TABLE_PREFIX}_{row.contribution_id?.toLocaleString() || "ID"}</td>

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

          <DataTableMember
            title={"Loan Payments"}
            linkPath={"/regular-member"}
            headers={["Ref No.", "Amount", "Payment Method", "Date", "Remarks"]}
            data={[]}
            isLoading={coopIsLoading}
            renderRow={()=>("")}
              
          /> 

        </div>
      </div>
    </div>
  )
}

export default MemberDashboard
