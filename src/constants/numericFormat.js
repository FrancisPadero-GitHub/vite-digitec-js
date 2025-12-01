// helper to format numbers in decimals
export const display = (num) =>
  Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) ?? "0.00";
