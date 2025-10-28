import dayjs from "dayjs";

/**
 * Diminishing balance loan calculator
 *
 * Each payment has:
 * - decreasing interest
 * - increasing principal
 * - constant monthly amortization
 */
export default function calculateLoanAndScheduleReducing({
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
   * Alternative approach (do not deduct service fee from principal)
   *
   * const netPrincipal = amount; // do not deduct service fee from principal
   * const totalPayable = netPrincipal + totalInterest + serviceFee;
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
      const interestDue = balance * monthlyRate;
      const principalDue = monthlyPayment - interestDue;
      balance -= principalDue;
      totalInterest += interestDue;

      const dueDate = dayjs(startDate).add(i, "month").format("YYYY-MM-DD");

      schedule.push({
        loan_id: loanId,
        installment_no: i,
        due_date: dueDate,
        principal_due: round(principalDue),
        interest_due: round(interestDue),
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

  const totalPayable = netPrincipal + totalInterest + serviceFee;

  return {
    totalInterest: round(totalInterest),
    totalPayable: round(totalPayable),
    monthlyPayment: round(monthlyPayment),
    serviceFee: round(serviceFee),
    schedule,
  };
}
