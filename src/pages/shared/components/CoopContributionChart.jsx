import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useFetchCoopContributions } from "../../treasurer/hooks/useFetchCoopContributions";

function CoopContributionChart() {
  const { data: contributions, isLoading, isError, error } = useFetchCoopContributions();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading contributions…</div>;
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error?.message || "Failed to load contributions"}
      </div>
    );
  }

  // Aggregate contributions by month
  const monthlyTotals = {};
  contributions?.forEach((item) => {
    if (!item.contribution_date) return;

    const date = new Date(item.contribution_date);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "short" }); // Jan, Feb, etc.

    const key = `${month} ${year}`; // e.g., "Jan 2024"
    monthlyTotals[key] = (monthlyTotals[key] || 0) + (item.amount || 0);
  });

  // Convert aggregated object into array for recharts
  const data = Object.entries(monthlyTotals).map(([month, value]) => ({
    month,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 0, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" fontSize={11} />
        <YAxis fontSize={11} />
        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
        <Area
          type="monotone"
          dataKey="value"
          fill="url(#colorCapital)"
          fillOpacity={1}
          name="Total Contributions"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default CoopContributionChart;
