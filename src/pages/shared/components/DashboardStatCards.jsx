import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"; // Example icons

function StatCard({
  icon,
  iconBgColor,
  statName,
  amount,
  subtitle = "This Week",
  growthPercent,
  growthType,
}) {
  const resolvedType =
    typeof growthPercent === "number"
      ? growthPercent >= 0
        ? "increase"
        : "decrease"
      : growthType ?? "increase";

  const colorClass =
    resolvedType === "increase" ? "text-primary" : "text-error";

  return (
    <div className="card bg-base-100 shadow-md rounded-2xl px-6 py-4">
      <h3 className="mb-2">
        <span className="text-lg font-semibold">{statName}</span>
        <span className="text-gray-400"> | {subtitle}</span>
      </h3>

      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-full ${iconBgColor} flex items-center justify-center`}
        >
          <span className="text-3xl text-white">{icon}</span>
        </div>

        <div>
          <div className="text-3xl font-bold">
            {amount.toLocaleString()}
          </div>
          <div className={`text-sm font-semibold ${colorClass}`}>
            {typeof growthPercent === "number"
              ? `${Math.abs(growthPercent)}% ${resolvedType}`
              : growthPercent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
