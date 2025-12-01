import { Link } from "react-router-dom";
import { useMemberRole } from "../../backend/context/useMemberRole";

function Reports() {
  const { memberRole } = useMemberRole();
  const reportButtons = [
    {
      path: `/${memberRole}/reports/income-statement`,
      label: "Income Statement",
      icon: "📊",
    },
    {
      path: `/${memberRole}/reports/member-statements`,
      label: "Member Statements",
      icon: "👥",
    },
    {
      path: `/${memberRole}/reports/loan-reports`,
      label: "Loan Reports",
      icon: "💳",
    },
    {
      path: `/${memberRole}/reports/club-coop-funds`,
      label: "Club/Coop Funds",
      icon: "🏦",
    },
    // { path: `/${memberRole}/reports/transaction-logs`, label: 'Transaction Logs', icon: '📝' },
    // { path: `/${memberRole}/reports/balance-sheet`, label: 'Balance Sheet', icon: '💰' },
    // { path: `/${memberRole}/reports/summary-charts`, label: 'Summary Charts', icon: '📈' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-lg lg:text-2xl font-bold mb-4 sm:mb-6">Reports</h1>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {reportButtons.map((report) => (
          <Link
            key={report.path}
            to={report.path}
            className="flex items-center gap-2 p-3 sm:p-4 bg-base-100 hover:bg-gray-50 hover:text-gray-800 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[56px]"
          >
            <span className="text-xl sm:text-2xl">{report.icon}</span>
            <span className="text-sm sm:text-base font-semibold">
              {report.label}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-xs text-gray-500 text-center">
        <em>More reports will be implemented in the future.</em>
      </div>
    </div>
  );
}

export default Reports;
