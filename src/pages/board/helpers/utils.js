
// HELPER FUNCTIONS & VARIABLES
// To avoid timezone issues with date inputs, we convert dates to local date strings
export function getLocalDateString(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

// For the loan reference number generation
export function genLoanRefNo(loanAppID) {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2); // last 2 digits of year
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const id = String(loanAppID).padStart(4, "0"); // 4 digits instead of 6
  const rand = Math.floor(10 + Math.random() * 90); // 2 digits
  return `L${y}${m}${d}-${id}${rand}`;
}
