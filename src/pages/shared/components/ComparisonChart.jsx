import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

function ComparisonChart({
  clubFundsData = [],
  expensesData = [],
  isLoading = false,
  isError = false,
  error = null
}) {

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ height: 300 }}>
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center" style={{ height: 300 }}>
        <div className="text-center text-error">
          <p className="font-semibold">Error loading chart data</p>
          {error && <p className="text-sm">{error.message || String(error)}</p>}
        </div>
      </div>
    );
  }

  // Aggregate and normalize both datasets by date
  const mergedData = {};

  // Add club funds
  clubFundsData?.forEach((item) => {
    if (!item.payment_date) return;
    const date = new Date(item.payment_date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!mergedData[date]) mergedData[date] = { date };
    mergedData[date].clubFunds =
      (mergedData[date].clubFunds || 0) + (item.amount || 0);
  });

  // Add expenses
  expensesData?.forEach((item) => {
    if (!item.transaction_date) return;
    const date = new Date(item.transaction_date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!mergedData[date]) mergedData[date] = { date };
    mergedData[date].clubExpenses =
      (mergedData[date].clubExpenses || 0) + (item.amount || 0);
  });

  // Convert to array and sort chronologically
  const data = Object.values(mergedData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // No data state
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center" style={{ height: 300 }}>
        <p className="text-gray-400">No comparison data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 40, right: 10, bottom: 10, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={11} />
        <YAxis fontSize={11} />
        <Tooltip
          formatter={(value) => `₱${Number(value).toLocaleString()}`}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend verticalAlign="bottom" height={36} iconSize={12} />
        <Line
          type="monotone"
          dataKey="clubFunds"
          stroke="#10B981"
          strokeWidth={3}
          name="Club Funds"
          dot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="clubExpenses"
          stroke="#EF4444"
          strokeWidth={3}
          name="Club Expenses"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ComparisonChart;
