import React from "react";
import PropTypes from "prop-types";
const StatCardV2 = ({
  icon,
  iconBgColor,
  statName,
  amount,
  type,
  subtitle,
  growthPercent,
  growthType,
  loading,
  error,
  errorMessage,
}) => {
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
    <div className="card bg-base-100 shadow-md rounded-2xl px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-5 lg:py-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{statName}</h3>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
        <div
          className={`rounded-full ${iconBgColor} flex items-center justify-center 
              w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-13 lg:h-13`}
        >
          <span className="text-white">
            {icon}
          </span>
        </div>

        <div className="" >
          <div className="text-1xl font-bold flex items-center">
            {loading ? (
              <span className="loading loading-spinner loading-md text-primary"></span>
            ) : error ? (
              <span className="text-error text-lg">{errorMessage}</span>
            ) : (
              <span
                className={
                  amount < 0 || type === "expenses"
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

StatCardV2.propTypes = {
  icon: PropTypes.node,
  iconBgColor: PropTypes.string,
  statName: PropTypes.string,
  amount: PropTypes.number,
  type: PropTypes.string,
  subtitle: PropTypes.string,
  growthPercent: PropTypes.number,
  growthType: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default React.memo(StatCardV2);
