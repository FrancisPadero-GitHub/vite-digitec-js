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
}) {
  const rate = Number(interestRate);
  const amount = Number(principal);
  const months = Number(termMonths);

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
      schedule: [],
    };
  }

  // Convert annual rate to monthly decimal
  const monthlyRate = rate / 100 / 12;

  // Monthly amortization formula:
  // Payment = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  let balance = amount;
  let totalInterest = 0;
  const round = (n) => Number((Number(n) || 0).toFixed(2));

  let schedule = [];

  if (generateSchedule) {
    for (let i = 1; i <= months; i++) {
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
    // If schedule isn't needed, just compute totals quickly
    for (let i = 1; i <= months; i++) {
      const interestDue = balance * monthlyRate;
      const principalDue = monthlyPayment - interestDue;
      balance -= principalDue;
      totalInterest += interestDue;
    }
  }

  const totalPayable = amount + totalInterest;

  return {
    totalInterest: round(totalInterest),
    totalPayable: round(totalPayable),
    monthlyPayment: round(monthlyPayment),
    schedule,
  };
}
