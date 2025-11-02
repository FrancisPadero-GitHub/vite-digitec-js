function StatCardV2({
  icon,
  iconBgColor,
  statName,
  amount,
  subtitle,
  growthPercent,
  growthType,
  loading,
  error,
  errorMessage,
}) {
  let resolvedType;
  if (typeof growthPercent === "number") {
    if (growthPercent > 0) resolvedType = "increase";
    else if (growthPercent < 0) resolvedType = "decrease";
    else resolvedType = "neutral";
  } else resolvedType = growthType ?? "increase";

  let colorClass;
  if (resolvedType === "neutral") colorClass = "text-gray-400";
  else if (statName?.toLowerCase().includes("expenses"))
    colorClass = resolvedType === "decrease" ? "text-success" : "text-error";
  else colorClass = resolvedType === "increase" ? "text-primary" : "text-error";

  return (
    <div className="card bg-base-100 shadow-md rounded-2xl px-3 py-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{statName}</h3>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`rounded-full ${iconBgColor} flex items-center justify-center 
              w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14`}
        >
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white">
            {icon}
          </span>
        </div>

        <div>
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

export default StatCardV2;
