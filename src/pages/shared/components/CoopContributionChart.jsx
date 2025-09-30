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

  const currentYear = new Date().getFullYear();
  const monthlyTotals = {};

  // Aggregate contributions only for current year
  contributions?.forEach((item) => {
    if (!item.contribution_date) return;

    const date = new Date(item.contribution_date);
    const year = date.getFullYear();

    if (year !== currentYear) return; // skip anything not this year

    const monthIndex = date.getMonth(); // 0 = Jan, 11 = Dec
    const key = `${year}-${monthIndex}`;

    monthlyTotals[key] = (monthlyTotals[key] || 0) + (item.amount || 0);
  });

  // Convert into chart-friendly array
  const data = Object.entries(monthlyTotals)
    .map(([key, value]) => {
      const [year, monthIndex] = key.split("-").map(Number);
      const label = new Date(year, monthIndex).toLocaleString("default", {
        month: "short",
      });
      return { month: label, value, year, monthIndex };
    })
    .sort((a, b) => a.monthIndex - b.monthIndex); // Jan → Dec

  // Final clean array for Recharts
  const finalData = data.map(({ month, value }) => ({ month, value }));


  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={finalData} margin={{ top: 20, right:25, left: -15, bottom: 10 }}>
        <defs>
          <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
            <stop offset="50%" stopColor="#82ca9d" stopOpacity={0.8} />
            <stop offset="90%" stopColor="#82ca9d" stopOpacity={0} />
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
