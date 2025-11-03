import dayjs from "dayjs";

// this version is for the flat rate

export default function calculateLoanAndScheduleFlatRate({
  interestRate,
  principal,
  termMonths,
  startDate = dayjs(),
  loanId = null,
  generateSchedule = false,
  serviceFeeRate = 0, // Add service fee rate (percent)
}) {
  // Convert to numbers safely
  const rate = Number(interestRate);
  const amount = Number(principal);
  const months = Number(termMonths);
  const serviceFee = amount * (Number(serviceFeeRate) / 100);

  /**
   * Approach 1 (do not deduct service fee from principal) -- LET'S USE THIS FOR NOW
   *
   * const netPrincipal = amount; // do not deduct service fee from principal
   * const totalPayable = netPrincipal + totalInterest;
   */

  /**
   * Approach 2 (deduct service fee from principal) -- NOT USING THIS FOR NOW
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
      monthlyPrincipal: 0,
      monthlyInterest: 0,
      serviceFee: 0,
      schedule: [],
    };
  }

  // Flat interest logic
  const totalInterest = amount * (rate / 100);
  const totalPayable = amount + totalInterest;

  const monthlyPrincipal = amount / months;
  const monthlyInterest = totalInterest / months;
  const monthlyPayment = monthlyPrincipal + monthlyInterest;

  // Helper function to ensure consistent two-decimal rounding
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // Optional schedule generation
  let schedule = [];
  if (generateSchedule) {
    for (let i = 0; i < months; i++) {
      const dueDate = dayjs(startDate).add(i, "month").format("YYYY-MM-DD");
      schedule.push({
        loan_id: loanId,
        installment_no: i,
        due_date: dueDate,
        principal_due: round(monthlyPrincipal),
        interest_due: round(monthlyInterest),
        total_due: round(monthlyPayment),
        paid: false,
      });
    }
  }

  return {
    totalInterest: round(totalInterest),
    totalPayable: round(totalPayable),
    monthlyPayment: round(monthlyPayment),
    monthlyPrincipal: round(monthlyPrincipal),
    monthlyInterest: round(monthlyInterest),
    serviceFee: round(serviceFee),
    schedule,
  };
}
