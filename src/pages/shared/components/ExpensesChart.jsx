import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";
import { useFetchExpenses } from "../../treasurer/hooks/useFetchExpenses";

const COLORS = [
  "#6366F1",
  "#22C55E",
  "#FACC15",
  "#F97316",
  "#EC4899",
  "#14B8A6",
];

function ExpensesChart() {
  const { data: fundExpenses, isLoading, isError, error } = useFetchExpenses();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-72 text-red-500 font-medium">
        Error: {error?.message || "Failed to load expenses"}
      </div>
    );
  }

  // Group and sum by category
  const grouped =
    fundExpenses?.reduce((acc, exp) => {
      const key = exp.category || exp.description || "Uncategorized";
      acc[key] = (acc[key] || 0) + (exp.amount ?? 0);
      return acc;
    }, {}) ?? {};

  const data = Object.entries(grouped).map(([name, value]) => ({
    name,
    value,
  }));

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="w-full h-auto px-4 py-6">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={3}
            cornerRadius={6}
            labelLine={false}
          >
            {data.map((_, index) => (
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

export default ExpensesChart;
