import dayjs from "dayjs";

/**
 * Diminishing balance loan calculator
 *
 * Each payment has:
 * - decreasing interest
 * - increasing principal
 * - constant monthly amortization
 */
export default function calcLoanSchedDiminishing({
  interestRate,
  principal,
  termMonths,
  startDate = dayjs(),
  loanId = null,
  generateSchedule = false,
  serviceFeeRate = 0, // Add service fee rate (percent)
}) {
  const rate = Number(interestRate);
  const amount = Number(principal);
  const months = Number(termMonths);
  const serviceFee = amount * (Number(serviceFeeRate) / 100);
  const netPrincipal = amount - serviceFee; // Deduct service fee from principal

  /**
   * Approach 1 (do not deduct service fee from principal) -- NOT USING THIS
   *
   * const netPrincipal = amount; // do not deduct service fee from principal
   * const totalPayable = netPrincipal + totalInterest;
   */

  /**
   * Approach 2 (deduct service fee from principal) -- CURRENTLY USING THIS
   *
   * const netPrincipal = amount - serviceFee;
   * const totalPayable = netPrincipal + totalInterest;
   */

  // Validation
  if (
    !rate ||
    !amount ||
    !months ||
    isNaN(rate) ||
    isNaN(amount) ||
    isNaN(months)
  ) {
    console.warn("Invalid calculation input:", { rate, amount, months });
    return {
      totalInterest: 0,
      totalPayable: 0,
      monthlyPayment: 0,
      serviceFee: 0,
      schedule: [],
    };
  }

  // Convert annual rate to monthly decimal
  const monthlyRate = rate / 100 / 12;

  // Monthly amortization formula:
  // Payment = P * [r(1+r)^n] / [(1+r)^n - 1]
  // Use netPrincipal (after deducting service fee) for calculation
  const monthlyPayment =
    (netPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  let balance = netPrincipal;
  let totalInterest = 0;
  
  // Helper function to ensure consistent two-decimal rounding
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  let schedule = [];

  if (generateSchedule) {
    for (let i = 0; i < months; i++) {
      // 1. Round the interest calculation immediately
      const interestDue = round(balance * monthlyRate);

      // 2. Calculate principal (still might need adjustment for final payment)
      let principalDue = round(monthlyPayment - interestDue);

      // 3. Use these rounded values for all subsequent logic
      balance = round(balance - principalDue);
      totalInterest = round(totalInterest + interestDue);

      const dueDate = dayjs(startDate).add(i, "month").format("YYYY-MM-DD");

      schedule.push({
        loan_id: loanId,
        installment_no: i,
        due_date: dueDate,
        principal_due: principalDue, // Already rounded
        interest_due: interestDue, // Already rounded
        total_due: round(monthlyPayment),
        paid: false,
      });
    }
  } else {
    for (let i = 0; i < months; i++) {
      const interestDue = balance * monthlyRate;
      const principalDue = monthlyPayment - interestDue;
      balance -= principalDue;
      totalInterest += interestDue;
    }
  }

  const totalPayable = netPrincipal + totalInterest;

  return {
    totalInterest: round(totalInterest),
    totalPayable: round(totalPayable),
    monthlyPayment: round(monthlyPayment),
    serviceFee: round(serviceFee),
    schedule,  // return schedule if generated  value is automatic in db
  };
}
