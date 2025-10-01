/**
 * Reusable personal stat card for members
 *
 * @param {ReactNode} icon - Icon element (JSX) for the card
 * @param {string} title - Title of the card
 * @param {string|number} amount - Main value/stat to display
 * @param {string} subtitle - Optional subtitle text (e.g. "This Month")
 * @param {function} onSubtitleChange - Callback when filter button clicked
 * @param {number} growthPercent - Growth percentage (positive/negative/0)
 * @param {string} growthType - Manually set type ("increase" | "decrease" | "neutral")
 * @param {boolean} loading - Loading state
 * @param {boolean} error - Error state
 * @param {string} errorMessage - Error message text
 */

function StatCardMember({
  icon,
  iconBgColor,
  title,
  amount,
  subtitle,
  onSubtitleChange,
  growthPercent,
  growthType,
  loading,
  error,
  errorMessage,
}) {
  const filters = ["All Time", "This Month", "This Year"];

  // Determine growth type
  let resolvedType;
  if (typeof growthPercent === "number") {
    if (growthPercent > 0) resolvedType = "increase";
    else if (growthPercent < 0) resolvedType = "decrease";
    else resolvedType = "neutral";
  } else {
    resolvedType = growthType ?? "neutral";
  }

  // Handle color logic
  let colorClass;
  if (resolvedType === "neutral") {
    colorClass = "text-gray-400";
  } else if (title?.toLowerCase().includes("expenses")) {
    colorClass = resolvedType === "decrease" ? "text-success" : "text-error";
  } else {
    colorClass = resolvedType === "increase" ? "text-success" : "text-error";
  }

  return (
    <div className="flex flex-col card bg-base-100/20 shadow-md rounded-2xl px-6 py-4">
      {/* Icon + Title (dead center) */}
      <div className="flex flex-col items-center justify-center mb-2">
        <div className={`w-16 h-16 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white">{icon}</span>
        </div>
        <span className="text-lg font-semibold mt-1">{title}</span>
      </div>

      {/* Filters (left aligned) */}
      <div className="flex justify-center mb-2 flex-wrap gap-1">
        {filters.map((label) => (
          <button
            key={label}
            className={`join-item btn btn-xs whitespace-nowrap 
          ${subtitle === label ? "btn-primary" : "btn-ghost text-gray-400"}`}
            onClick={() => onSubtitleChange?.(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats + Growth (left aligned) */}
      <div className="flex flex-col items-center">
        {/* Value */}
        <div className="text-2xl font-bold h-9 flex items-center">
          {loading ? (
            <span className="loading loading-spinner loading-md text-primary"></span>
          ) : error ? (
            <span className="text-error text-lg">{errorMessage}</span>
          ) : (
            <span
              className={
                amount < 0
                  ? "text-error"
                  : amount === 0
                    ? "text-gray-400"
                    : "text-success"
              }
            >
              ₱ {Number(amount ?? 0).toLocaleString()}
            </span>
          )}
        </div>

        {/* Growth */}
        <div className={`text-sm font-semibold ${colorClass}`}>
          {typeof growthPercent === "number"
            ? `${Math.abs(growthPercent)}% ${resolvedType}`
            : growthPercent}
        </div>
      </div>
    </div>

  );
}

export default StatCardMember;
