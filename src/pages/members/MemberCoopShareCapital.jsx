import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Wallet, AccountBalance } from "@mui/icons-material";

// fetch hooks
import { useFetchCoop } from "../../backend/hooks/shared/useFetchCoop";
import { useFetchMemberTotal } from "../../backend/hooks/member/useFetchMemberTotals";
import { useFetchTotal } from "../../backend/hooks/shared/useFetchTotal";

// components
import DataTableV2 from "../shared/components/DataTableV2";
import FilterToolbar from "../shared/components/FilterToolbar";
import CoopShareCapitalReceiptModal from "../treasurer/modals/CoopShareCapitalReceiptModal";
import StatCardV2 from "../shared/components/StatCardV2";

// constants
import {
  CAPITAL_CATEGORY_COLORS,
  PAYMENT_METHOD_COLORS,
} from "../../constants/Color";

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";
import { display } from "../../constants/numericFormat";
import { calcGrowth } from "../shared/utils/CurrentVSPrevCalculator";

const monthNameToNumber = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

function MemberCoopShareCapital() {
  // useQuery hook to fetch member's coop contributions
  const {
    data: coopData,
    isLoading,
    error,
    isError,
  } = useFetchCoop({ useLoggedInMember: true });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // View modal state
  const [viewContributionData, setViewContributionData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(true);

  const openViewModal = (data) => {
    setViewContributionData(data);
  };

  const closeViewModal = () => {
    setViewContributionData(null);
  };

  // Derived filters for totals
  const currentYear = new Date().getFullYear();
  const monthForTotals = monthFilter ? monthNameToNumber[monthFilter] : null;
  const yearForTotals = yearFilter ? Number(yearFilter) : null;
  const effectiveYearForTotals = yearForTotals ?? currentYear;

  const prevPeriod = (() => {
    if (monthForTotals) {
      const base = new Date(effectiveYearForTotals, monthForTotals - 1, 1);
      const prev = new Date(base);
      prev.setMonth(base.getMonth() - 1);
      return { month: prev.getMonth() + 1, year: prev.getFullYear() };
    }
    if (yearForTotals) return { month: null, year: yearForTotals - 1 };
    return { month: null, year: null };
  })();

  const totalsSubtitle = monthForTotals
    ? `${monthFilter} ${effectiveYearForTotals}`
    : yearForTotals
      ? `${yearForTotals}`
      : "All Time";

  // Fetch personal and overall totals (current period)
  const { data: personalCoopFunds, isLoading: personalLoading } =
    useFetchMemberTotal({
      rpcFn: "get_coop_contributions_total_by_member",
      year: yearForTotals,
      month: monthForTotals,
    });

  const { data: totalSummary, isLoading: loadingCurrent } = useFetchTotal({
    rpcFn: "get_funds_summary",
    year: yearForTotals,
    month: monthForTotals,
    key: `member-coop-current-${totalsSubtitle}`,
  });

  // Fetch previous period for growth calculation
  const { data: prevSummary, isLoading: loadingPrev } = useFetchTotal({
    rpcFn: "get_funds_summary",
    month: prevPeriod.month,
    year: prevPeriod.year,
    key: `member-coop-prev-${totalsSubtitle}`,
  });

  const loading = personalLoading || loadingCurrent || loadingPrev;

  const stats = useMemo(() => {
    const c = totalSummary || {};
    const p = prevSummary || {};
    return [
      {
        statName: "My Coop Share Capital",
        amount: Number(personalCoopFunds ?? 0),
        growthPercent: 0,
        iconBgColor: "bg-blue-400",
        icon: <Wallet />,
        subtitle: totalsSubtitle,
        loading: loading,
        error: false,
        errorMessage: "",
      },
      {
        statName: "Total Coop Share Capital",
        amount: Number(c.club_total_coop ?? 0),
        growthPercent: calcGrowth(c.club_total_coop, p.club_total_coop),
        iconBgColor: "bg-sky-400",
        icon: <AccountBalance />,
        subtitle: totalsSubtitle,
        loading: loading,
        error: false,
        errorMessage: "",
      },
    ];
  }, [personalCoopFunds, totalSummary, prevSummary, loading, totalsSubtitle]);

  // Reduces the amount of filtering per change so its good delay
  const debouncedSearch = useDebounce(searchTerm, 250);

  const TABLE_PREFIX = "SCC"; // unique ID prefix
  const coopRaw = coopData?.data || [];

  const coop = coopRaw.filter((row) => {
    const generatedId = `${TABLE_PREFIX}_${row.coop_contri_id}`;

    // Match search (id)
    const matchesSearch =
      debouncedSearch === "" ||
      generatedId.toLowerCase().includes(debouncedSearch.toLowerCase());

    // Match filters
    const matchesCategory =
      categoryFilter === "" || row.category === categoryFilter;
    const matchesPaymentMethod =
      paymentMethodFilter == "" || row.payment_method == paymentMethodFilter;

    const date = row.contribution_date ? new Date(row.contribution_date) : null;
    const matchesYear =
      yearFilter === "" ||
      (date && date.getFullYear().toString() === yearFilter);

    // To avoid subtext displaying numbers instead of month names
    // I had to convert the values from the monthFilter to numbers for comparison
    const filterMonthNumber = monthFilter
      ? monthNameToNumber[monthFilter]
      : null;
    const matchesMonth =
      monthFilter === "" || (date && date.getMonth() + 1 === filterMonthNumber);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPaymentMethod &&
      matchesYear &&
      matchesMonth
    );
  });

  // Dynamically generate year options for the past 5 years including current year
  // to get rid of the hard coded years
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year.toString() };
  });

  // for the subtext of data table
  // just for fancy subtext in line with active filters
  const activeFiltersText =
    [
      debouncedSearch ? `Search: "${debouncedSearch}"` : null,
      categoryFilter ? `${categoryFilter}` : null,
      paymentMethodFilter ? `${paymentMethodFilter}` : null,
      yearFilter ? `${yearFilter}` : null,
      monthFilter ? `${monthFilter}` : null,
    ]
      .filter(Boolean)
      .join(" - ") || "Showing all contributions";

  // clear filters button
  const handleClearFilters = () => {
    setSearchTerm("");
    setPaymentMethodFilter("");
    setCategoryFilter("");
    setYearFilter("");
    setMonthFilter("");
  };

  return (
    <div className="m-3 mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
        <FilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={handleClearFilters}
          dropdowns={[
            {
              label: "Category",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: "Initial", value: "Initial" },
                { label: "Monthly", value: "Monthly" },
              ],
            },
            {
              label: "Method",
              value: paymentMethodFilter,
              onChange: setPaymentMethodFilter,
              options: [
                { label: "Cash", value: "Cash" },
                { label: "GCash", value: "GCash" },
                { label: "Bank", value: "Bank" },
              ],
            },
            {
              label: "Year",
              value: yearFilter,
              onChange: setYearFilter,
              options: yearOptions,
            },
            {
              label: "Month",
              value: monthFilter,
              onChange: setMonthFilter,
              options: [
                { label: "January", value: "January" },
                { label: "February", value: "February" },
                { label: "March", value: "March" },
                { label: "April", value: "April" },
                { label: "May", value: "May" },
                { label: "June", value: "June" },
                { label: "July", value: "July" },
                { label: "August", value: "August" },
                { label: "September", value: "September" },
                { label: "October", value: "October" },
                { label: "November", value: "November" },
                { label: "December", value: "December" },
              ],
            },
          ]}
        />
      </div>

      {/* Collapsible Stats Card */}
      <div className="space-y-2">
        <button
          onClick={() => setIsStatsVisible(!isStatsVisible)}
          className="btn btn-sm btn-ghost gap-2"
          type="button"
        >
          {isStatsVisible ? (
            <>
              <ChevronUp size={18} />
              Hide Summary
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              Show Summary
            </>
          )}
        </button>
        {isStatsVisible && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Summary Totals</span>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <StatCardV2 key={i} {...s} />
              ))}
            </div>
          </div>
        )}
      </div>

      <DataTableV2
        title="My Share Capital / Coop Contributions"
        subtext={activeFiltersText}
        showLinkPath={false}
        headers={["Ref No.", "Amount", "Category", "Date", "Method"]}
        filterActive={activeFiltersText !== "Showing all contributions"}
        data={coop}
        isLoading={isLoading}
        isError={isError}
        error={error}
        renderRow={(row) => {
          const id = row?.coop_contri_id || "Not Found";
          const amount = row?.amount || 0;
          const paymentCategory = row?.category;
          const contributionDate = row?.contribution_date
            ? new Date(row.contribution_date).toLocaleDateString()
            : "Not Found";
          const paymentMethod = row?.payment_method || "Not Found";

          return (
            <tr
              key={id}
              onClick={() => openViewModal(row)}
              className="text-center cursor-pointer hover:bg-base-200/50"
            >
              {/* Ref no. */}
              <td className=" text-center font-medium text-xs">
                {TABLE_PREFIX}_{id}
              </td>

              {/* Amount */}
              <td className="font-semibold text-success">
                ₱ {display(amount)}
              </td>

              {/* Payment Category */}
              <td>
                {paymentCategory ? (
                  <span
                    className={`badge badge-soft font-semibold ${CAPITAL_CATEGORY_COLORS[paymentCategory]}`}
                  >
                    {paymentCategory}
                  </span>
                ) : (
                  <span className="badge font-semibold badge-error">
                    Not Found
                  </span>
                )}
              </td>

              {/* Contribution Date */}
              <td>{contributionDate}</td>

              {/* Payment Method */}
              <td>
                {paymentMethod ? (
                  <span
                    className={`badge badge-soft font-semibold ${PAYMENT_METHOD_COLORS[paymentMethod]}`}
                  >
                    {paymentMethod}
                  </span>
                ) : (
                  <span className="badge font-semibold badge-error">
                    Not Found
                  </span>
                )}
              </td>
            </tr>
          );
        }}
      />

      {/* Receipt Modal */}
      <CoopShareCapitalReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        contribution={viewContributionData}
      />

      {/* View Contribution Details Modal */}
      {viewContributionData && (
        <dialog open className="modal overflow-hidden">
          <div className="modal-box max-w-sm md:max-w-2xl w-full flex flex-col max-h-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-bold">Contribution Details</h3>
              <div
                className={`badge badge-lg font-semibold ${
                  viewContributionData.category === "Initial"
                    ? "badge-info"
                    : viewContributionData.category === "Monthly"
                      ? "badge-success"
                      : "badge-warning"
                }`}
              >
                {viewContributionData.category}
              </div>
            </div>

            <div className="overflow-y-auto overflow-x-hidden flex-1">
              <div className="bg-base-200 p-3 rounded-lg mb-3">
                <h4 className="text-xs font-bold text-gray-600 mb-2">
                  Account Information
                </h4>
                <div className="flex flex-col lg:flex-row lg:justify-between gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Account Number
                    </label>
                    <div className="text-sm font-semibold">
                      {viewContributionData.account_number}
                    </div>
                  </div>
                  <div className="self-center lg:self-end">
                    <button
                      onClick={() => setShowReceipt(true)}
                      className="btn btn-warning max-h-6"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
                <h4 className="text-xs font-bold text-gray-600 mb-2">
                  Contribution Information
                </h4>
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Contribution ID
                    </label>
                    <div className="text-sm font-mono font-bold">
                      CSC_{viewContributionData.coop_contri_id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Receipt No.
                    </label>
                    <div className="text-sm font-mono font-bold">
                      {viewContributionData.receipt_no || "--"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Date
                    </label>
                    <div className="text-sm font-semibold">
                      {new Date(
                        viewContributionData.contribution_date
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Payment Method
                    </label>
                    <div className="text-sm font-semibold">
                      {viewContributionData.payment_method}
                    </div>
                  </div>
                </div>
                {viewContributionData.remarks && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Remarks
                    </label>
                    <div className="text-sm text-gray-700">
                      {viewContributionData.remarks}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-base-100 p-3 rounded-lg border border-base-300 mb-3">
                <h4 className="text-xs font-bold text-gray-600 mb-2">Amount</h4>
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold">Total Amount</span>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-400">
                      <span className="text-lg font-bold text-green-900">
                        ₱{display(viewContributionData.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 mt-2 flex-shrink-0">
              <div className="modal-action mt-0">
                <button onClick={closeViewModal} className="btn btn-sm">
                  Close
                </button>
              </div>
            </div>
          </div>

          <form
            method="dialog"
            className="modal-backdrop"
            onSubmit={closeViewModal}
          >
            <button aria-label="Close"></button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default MemberCoopShareCapital;
