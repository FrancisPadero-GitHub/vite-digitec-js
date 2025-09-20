import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {useFetchExpenses} from "../../treasurer/hooks/useFetchExpenses";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#B84EFF"];

function ExpensesChart() {
  const { data: fundExpenses, isLoading, isError, error } = useFetchExpenses();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading expenses…</div>;
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error?.message || "Failed to load expenses"}
      </div>
    );
  }

  // Transform API data into chart-friendly format
  const data =
    fundExpenses?.map((exp) => ({
      name: exp.category || exp.description || "Uncategorized",
      value: exp.amount ?? 0,
    })) || [];

  // Compute total
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="45%"
          outerRadius="75%"
          paddingAngle={3}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
        <Legend verticalAlign="bottom" height={36} />

        {/* Center label for total */}
        <foreignObject
          x="40%"
          y="42%"
          width="20%"
          height="20%"
          style={{ pointerEvents: "none" }}
        >
          <div className="text-center text-sm font-semibold text-base-content">
            Total: ₱{total.toLocaleString()}
          </div>
        </foreignObject>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default ExpensesChart;
