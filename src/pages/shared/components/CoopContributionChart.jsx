
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import React, { useMemo } from "react";

const CoopContributionChart = ({
  data = [],
  isLoading = false,
  isError = false,
  error = null
}) => {
  const currentYear = new Date().getFullYear();

  // Memoize data processing
  const finalData = useMemo(() => {
    const monthlyTotals = {};
    data?.forEach((item) => {
      if (!item.contribution_date) return;
      const date = new Date(item.contribution_date);
      const year = date.getFullYear();
      if (year !== currentYear) return;
      const monthIndex = date.getMonth();
      const key = `${year}-${monthIndex}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + (item.amount || 0);
    });
    const data_converted = Object.entries(monthlyTotals)
      .map(([key, value]) => {
        const [year, monthIndex] = key.split("-").map(Number);
        const label = new Date(year, monthIndex).toLocaleString("default", {
          month: "short",
        });
        return { month: label, value, year, monthIndex };
      })
      .sort((a, b) => a.monthIndex - b.monthIndex);
    return data_converted.map(({ month, value }) => ({ month, value }));
  }, [data, currentYear]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ height: 400 }}>
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center" style={{ height: 400 }}>
        <div className="text-center text-error">
          <p className="font-semibold">Error loading chart data</p>
          {error && <p className="text-sm">{error.message || String(error)}</p>}
        </div>
      </div>
    );
  }

  // No data state
  if (finalData.length === 0) {
    return (
      <div className="flex justify-center items-center" style={{ height: 400 }}>
        <p className="text-gray-400">No contribution data available for {currentYear}</p>
      </div>
    );
  }

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
};

export default React.memo(CoopContributionChart);
