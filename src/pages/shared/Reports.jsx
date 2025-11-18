import { Link } from 'react-router-dom'
import { useMemberRole } from '../../backend/context/useMemberRole'

function Reports() {
  const { memberRole } = useMemberRole();
  const reportButtons = [
    { path: `/${memberRole}/reports/income-statement`, label: 'Income Statement', icon: '📊' },
    { path: `/${memberRole}/reports/balance-sheet`, label: 'Balance Sheet', icon: '💰' },
    { path: `/${memberRole}/reports/member-statements`, label: 'Member Statements', icon: '👥' },
    { path: `/${memberRole}/reports/loan-reports`, label: 'Loan Reports', icon: '💳' },
    { path: `/${memberRole}/reports/club-coop-funds`, label: 'Club/Coop Funds', icon: '🏦' },
    { path: `/${memberRole}/reports/transaction-logs`, label: 'Transaction Logs', icon: '📝' },
    { path: `/${memberRole}/reports/summary-charts`, label: 'Summary Charts', icon: '📈' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportButtons.map((report) => (
          <Link
            key={report.path}
            to={report.path}
            className="flex items-center gap-3 p-6 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="text-3xl">{report.icon}</span>
            <span className="text-lg font-semibold text-gray-800">{report.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Reports
