// constants/Calculation.js

/**
 * Flat Interest Rate Calculation (Simple Interest - Flat per Loan Term)
 *
 * This version assumes the interest rate applies to the entire loan term,
 * not annualized. Ideal for cooperatives or microfinance setups
 * where a product defines “6% for 6 months” instead of “6% per year”.
 *
 * @param {Object} params
 * @param {number} params.interestRate - Interest rate in percent for the full term (e.g., 6 or 12)
 * @param {number} params.principal - The principal amount (loaned amount)
 * @param {number} params.termMonths - Loan term in months
 *
 * @returns {Object} {
 *  totalInterest: number,
 *  totalPayable: number,
 *  monthlyPayment: number,
 *  monthlyPrincipal: number,
 *  monthlyInterest: number
 * }
 */

export default function Calculation({ interestRate, principal, termMonths }) {
  // 1. Input Validation
  if (!interestRate || !principal || !termMonths) {
    return {
      totalInterest: 0,
      totalPayable: 0,
      monthlyPayment: 0,
      monthlyPrincipal: 0,
      monthlyInterest: 0,
    };
  }

  // 2. Convert rate to decimal
  const rate = interestRate / 100;

  // 3. Flat Interest — applied to full term (no division by 12)
  const totalInterest = principal * rate;

  // 4. Totals
  const totalPayable = principal + totalInterest;

  // 5. Monthly breakdown (flat, equal each month)
  const monthlyPrincipal = principal / termMonths;
  const monthlyInterest = totalInterest / termMonths;
  const monthlyPayment = monthlyPrincipal + monthlyInterest;

  // 6. Round values for UI
  const round = (num) => Number(num.toFixed(2));

  return {
    totalInterest: round(totalInterest),
    totalPayable: round(totalPayable),
    monthlyPayment: round(monthlyPayment),
    monthlyPrincipal: round(monthlyPrincipal),
    monthlyInterest: round(monthlyInterest),
  };
}
