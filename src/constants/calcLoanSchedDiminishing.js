import dayjs from "dayjs";
import { Decimal } from "decimal.js";

// ---
// Helper function to round a Decimal to 2 decimal places
// This uses "half up" rounding, which is standard for finance.
// ---
const round = (num) => num.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/**
 * Diminishing balance loan calculator (using precise decimal math)
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
  serviceFeeRate = 0,
}) {
  // Use regular Numbers for validation and counters
  const rateNum = Number(interestRate);
  const amountNum = Number(principal);
  const monthsNum = Number(termMonths);
  const serviceFeeRateNum = Number(serviceFeeRate);

  // --- Start Decimal Calculations ---
  // Convert all inputs to Decimal objects for precise math
  const D_amount = new Decimal(amountNum);
  const D_serviceFeeRate = new Decimal(serviceFeeRateNum);

  // Calculate service fee and net principal using Decimals
  const D_serviceFee = round(D_amount.times(D_serviceFeeRate).div(100));
  const D_netPrincipal = D_amount.minus(D_serviceFee);

  // Validation
  if (
    !rateNum ||
    !amountNum ||
    !monthsNum ||
    isNaN(rateNum) ||
    isNaN(amountNum) ||
    isNaN(monthsNum) ||
    D_netPrincipal.isNegative()
  ) {
    console.warn("Invalid calculation input:", {
      rate: rateNum,
      amount: amountNum,
      months: monthsNum,
    });
    // Return standard numbers
    return {
      totalInterest: 0,
      totalPayable: 0,
      monthlyPayment: 0,
      serviceFee: 0,
      schedule: [],
    };
  }

  // Convert annual rate to monthly decimal
  const D_monthlyRate = new Decimal(rateNum).div(100).div(12);

  // Monthly amortization formula:
  // Payment = P * [r(1+r)^n] / [(1+r)^n - 1]
  const D_one = new Decimal(1);
  const D_onePlusRate = D_one.plus(D_monthlyRate);
  const D_powOnePlusRate = D_onePlusRate.pow(monthsNum);

  const D_numerator =
    D_netPrincipal.times(D_monthlyRate).times(D_powOnePlusRate);
  const D_denominator = D_powOnePlusRate.minus(D_one);

  // The monthly payment is a final currency value, so round it.
  const D_monthlyPayment = round(D_numerator.div(D_denominator));

  // Initialize loop variables as Decimals
  let D_balance = D_netPrincipal;
  let D_totalInterest = new Decimal(0);

  let schedule = [];

  // This loop logic must be identical whether generating a schedule or not
  // to ensure totalInterest is always the same.
  for (let i = 0; i < monthsNum; i++) {
    // 1. Calculate and round interest
    const D_interestDue = round(D_balance.times(D_monthlyRate));

    let D_principalDue;
    let D_totalDue;

    if (i === monthsNum - 1) {
      // 2a. Last payment: Principal is the entire remaining balance
      D_principalDue = D_balance;
      D_totalDue = round(D_balance.plus(D_interestDue));
      D_balance = new Decimal(0); // Clear balance exactly
    } else {
      // 2b. Normal payment: Principal is payment minus interest
      D_principalDue = round(D_monthlyPayment.minus(D_interestDue));
      D_totalDue = D_monthlyPayment; // Total due is the standard payment
      // 3. Update balance using rounded principal
      D_balance = D_balance.minus(D_principalDue);
    }

    // 4. Add the rounded interest to the total
    D_totalInterest = D_totalInterest.plus(D_interestDue);

    if (generateSchedule) {
      const dueDate = dayjs(startDate).add(i, "month").format("YYYY-MM-DD");

      schedule.push({
        loan_id: loanId,
        installment_no: i,
        due_date: dueDate,
        // Convert Decimals back to standard Numbers for the schedule object.
        // This is safe because they are already rounded to 2 decimal places.
        principal_due: D_principalDue.toNumber(),
        interest_due: D_interestDue.toNumber(),
        total_due: D_totalDue.toNumber(),
        paid: false,
      });
    }
  }

  const D_totalPayable = D_netPrincipal.plus(D_totalInterest);

  // Convert final Decimals back to standard Numbers for the return object
  return {
    totalInterest: round(D_totalInterest).toNumber(),
    totalPayable: round(D_totalPayable).toNumber(),
    monthlyPayment: D_monthlyPayment.toNumber(),
    serviceFee: D_serviceFee.toNumber(),
    schedule,
  };
}
