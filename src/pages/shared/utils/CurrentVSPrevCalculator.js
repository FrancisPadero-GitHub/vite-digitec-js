// Helper to get previous period based on subtitle
// Helper to compute previous period filter
export const getPrevPeriod = (subtitle) => {
  if (subtitle === "This Month") {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { month: prev.getMonth() + 1, year: prev.getFullYear() };
  }
  if (subtitle === "This Year") {
    return { month: null, year: new Date().getFullYear() - 1 };
  }
  return { month: null, year: null }; // All Time → no comparison
};

// Helper to compute growth percent
export const calcGrowth = (current, previous, asString = false) => {
  const c = Number(current);
  const p = Number(previous);

  // Prevent divide-by-zero or invalid values
  if (!isFinite(c) || !isFinite(p) || p === 0) return 0;

  const growth = ((c - p) / p) * 100;
  const rounded = Math.round(growth);

  return asString ? `${rounded}%` : rounded;
};

export const monthNameToNumber = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};