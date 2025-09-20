

/**
 * 
 * @param {component} icon - icon from mui
 * @param {string} iconBgColor - tailwind ui styling 
 * @returns {function} Statcard- reusable card that displays stats of the tables like totals etc.
 */

const filter = ["All Time", "This Month", "This Year"];

function StatCard({
  icon,
  iconBgColor,
  statName,
  amount,
  subtitle,
  onSubtitleChange,  // callback passed from parent
  growthPercent, // will be logically implemented soon
  growthType, // will be logically implemented soon

  loading,
  error,
  errorMessage,
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

      </h3>
      <div className="flex justify-center mb-1">
        {filter.map((label) => (
          <button
            key={label}
            className={`join-item btn btn-xs ${subtitle === label ? "btn-primary" : "btn-ghost text-gray-400"
              }`}
            onClick={() => onSubtitleChange?.(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <span className="text-3xl text-white">{icon}</span>
        </div>

        <div>
          {/* Displays a loading spinner or an error if it should return */}
          <div className="text-3xl font-bold h-10 flex items-center">
            {loading ? (
              <span className="loading loading-spinner loading-md text-primary"></span>
            ) : error ? (
              <span className="text-error text-lg">{errorMessage}</span>
            ) : (
              Number(amount ?? 0).toLocaleString()
            )}
          </div>

          <div className={`text-sm font-semibold ${colorClass}`}>
            {typeof growthPercent === "number"
              ? `${Math.abs(growthPercent)}% ${resolvedType}`
              : growthPercent}
            <span className="text-warning"> vs last month</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default StatCard;
