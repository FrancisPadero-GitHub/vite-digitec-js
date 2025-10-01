

/**
 * 
 * @param {component} icon - icon from mui
 * @param {string} iconBgColor - tailwind ui styling 
 * @returns {function} Statcard- reusable card that displays stats of the tables like totals etc.
 */

const filter = ["All Time", "This Month", "This Year"]; // date_label

function StatCard({
  icon,
  iconBgColor,
  statName,
  amount,
  subtitle,
  onSubtitleChange, 
  growthPercent,
  growthType, 

  loading,
  error,
  errorMessage,
}) {


  // Determine growth type (increase, decrease, neutral)
  let resolvedType;
  if (typeof growthPercent === "number") {
    if (growthPercent > 0) {
      resolvedType = "increase";
    } else if (growthPercent < 0) {
      resolvedType = "decrease";
    } else {
      resolvedType = "neutral";
    }
  } else {
    resolvedType = growthType ?? "increase";
  }

  // Handle color logic
  let colorClass;
  if (resolvedType === "neutral") {
    colorClass = "text-gray-400"; // ✅ neutral gray
  } else if (statName?.toLowerCase().includes("expenses")) {
    // ✅ Flip the logic for expenses
    colorClass =
      resolvedType === "decrease" ? "text-success" : "text-error";
  } else {
    colorClass =
      resolvedType === "increase" ? "text-primary" : "text-error";
  }


  return (
    <div className="card bg-base-100 shadow-md rounded-2xl px-6 py-4">
      <h3 className="mb-2">
        <span className="text-lg font-semibold">{statName}</span>

      </h3>
      <div className="flex justify-center mb-1 flex-wrap gap-1">
        {filter.map((date_label) => (
          <button
            key={date_label}
            className={`join-item btn btn-xs 
        whitespace-nowrap text-[10px] sm:text-xs md:text-sm 
        ${subtitle === date_label ? "btn-primary" : "btn-ghost text-gray-400"}`}
            onClick={() => onSubtitleChange?.(date_label)}
          >
            {date_label}
          </button>
        ))}
      </div>


      <div className="flex items-center gap-4">
        <div className={`rounded-full ${iconBgColor} flex items-center justify-center 
              w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14`}>
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white">{icon}</span>
        </div>

        <div>
          {/* Displays a loading spinner or an error if it should return */}
          <div className="text-2xl font-bold h-9 flex items-center">
            {loading ? (
              <span className="loading loading-spinner loading-md text-primary"></span>
            ) : error ? (
              <span className="text-error text-lg">{errorMessage}</span>
            ) : (
              <span
                className={
                  amount < 0
                    ? "text-error" // red if negative
                    : amount === 0
                      ? "text-gray-400" // gray if zero
                      : "text-success" // green (or keep default)
                }
              >
               ₱ {Number(amount ?? 0).toLocaleString()}
              </span>
            )}
          </div>

          <div className={`text-sm font-semibold ${colorClass}`}>
            {typeof growthPercent === "number"
              ? `${Math.abs(growthPercent)}% ${resolvedType}`
              : growthPercent}
            {/* <span className="text-warning"> vs last month</span> */}
          </div>
        </div>
      </div>

    </div>
  );
}

export default StatCard;
