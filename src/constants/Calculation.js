import React from "react";

/**
 * Calculates loan details using flat interest.
 *
 * @param {number} interest - Annual interest rate in percent (e.g. 12 for 12%).
 * @param {number} principal - Total principal amount.
 * @param {number} term - Loan term in months.
 * @returns {object} - { totalInterest, totalPayable, monthlyPayment, monthlyInterest, monthlyPrincipal }
 */
function Calculation(interest, principal, term) {
  const p = Number(principal);
  const annualRate = Number(interest) / 100;
  const months = Number(term);

  if (isNaN(p) || isNaN(annualRate) || isNaN(months) || months <= 0) {
    console.error("Invalid calculation inputs.");
    return {
      totalInterest: 0,
      totalPayable: 0,
      monthlyPayment: 0,
      monthlyInterest: 0,
      monthlyPrincipal: 0,
    };
  }

  // Convert annual interest rate to monthly interest rate for flat interest
  const monthlyInterestRate = annualRate / 12;

  // Total interest = principal × annualRate × (months / 12)
  const totalInterest = p * annualRate * (months / 12);

  // Total payable = principal + total interest
  const totalPayable = p + totalInterest;

  // Monthly values for flat interest
  const monthlyPrincipal = p / months;
  const monthlyInterest = totalInterest / months;
  const monthlyPayment = monthlyPrincipal + monthlyInterest;

  return {
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayable: parseFloat(totalPayable.toFixed(2)),
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    monthlyPrincipal: parseFloat(monthlyPrincipal.toFixed(2)),
    monthlyInterest: parseFloat(monthlyInterest.toFixed(2)),
  };
}

export default Calculation;
