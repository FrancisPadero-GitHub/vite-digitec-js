import dayjs from "dayjs";

// this version is for the flat rate

export default function calcLoanSchedFlat({
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
      monthlyPrincipal: 0,
      monthlyInterest: 0,
      serviceFee: 0,
      schedule: [],
    };
  }

  // Flat interest logic
  // Use netPrincipal (after deducting service fee) for calculation
  const totalInterest = netPrincipal * (rate / 100);
  const totalPayable = netPrincipal + totalInterest;

  const monthlyPrincipal = netPrincipal / months;
  const monthlyInterest = totalInterest / months;
  const monthlyPayment = monthlyPrincipal + monthlyInterest;

  // Optional schedule generation
  let schedule = [];
  if (generateSchedule) {
    for (let i = 0; i < months; i++) {
      const dueDate = dayjs(startDate).add(i, "month").format("YYYY-MM-DD");
      schedule.push({
        loan_id: loanId,
        installment_no: i,
        due_date: dueDate,
        principal_due: monthlyPrincipal,
        interest_due: monthlyInterest,
        total_due: monthlyPayment,
        paid: false,
      });
    }
  }

  return {
    totalInterest: totalInterest,
    totalPayable: totalPayable,
    monthlyPayment: monthlyPayment,
    monthlyPrincipal: monthlyPrincipal,
    monthlyInterest: monthlyInterest,
    serviceFee: serviceFee,
    schedule,
  };
}
