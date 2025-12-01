import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";
import Proptypes from "prop-types";

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#FACC15",
  "#F97316",
  "#EC4899",
  "#14B8A6",
];

function ExpensesChart({
  data = [],
  isLoading = false,
  isError = false,
  error = null,
}) {
  // Group and sum by category
  const grouped =
    data?.reduce((acc, exp) => {
      const key = exp.category || exp.description || "Uncategorized";
      acc[key] = (acc[key] || 0) + (exp.amount ?? 0);
      return acc;
    }, {}) ?? {};

  const data_converted = Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }));

  const total = data_converted.reduce((sum, entry) => sum + entry.value, 0);

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
  if (data_converted.length === 0) {
    return (
      <div className="flex justify-center items-center" style={{ height: 300 }}>
        <p className="text-gray-400">No expense data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-auto px-4 py-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data_converted}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={3}
            cornerRadius={6}
            labelLine={false}
          >
            {data_converted.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}

            {/* Center total using a custom label */}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <foreignObject
                      x={viewBox.cx - 60}
                      y={viewBox.cy - 70}
                      width={120}
                      height={60}
                      style={{ pointerEvents: "none" }}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-xs text-base-content/60">
                          Total
                        </span>
                        <span className="text-lg font-bold text-base-content">
                          ₱{total.toLocaleString()}
                        </span>
                      </div>
                    </foreignObject>
                  );
                }
                return null;
              }}
            />
          </Pie>

          <Tooltip
            formatter={(value) => `₱${value.toLocaleString()}`}
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
            }}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: "20px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

ExpensesChart.propTypes = {
  data: Proptypes.array,
  isLoading: Proptypes.bool,
  isError: Proptypes.bool,
  error: Proptypes.object,
};

export default ExpensesChart;
