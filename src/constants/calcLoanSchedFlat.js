import dayjs from "dayjs";
import { Decimal } from "decimal.js";

// ---
// Helper function to round a Decimal to 2 decimal places
// This uses "half up" rounding, which is standard for finance.
// ---
const round = (num) => num.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/**
 * Flat rate loan calculator (using precise decimal math)
 */
export default function calcLoanSchedFlat({
  interestRate,
  principal,
  termMonths,
  startDate = dayjs(),
  loanId = null,
  generateSchedule = false,
  serviceFeeRate = 0, // Add service fee rate (percent)
}) {
  // Use regular Numbers for validation and counters
  const rateNum = Number(interestRate);
  const amountNum = Number(principal);
  const monthsNum = Number(termMonths);
  const serviceFeeRateNum = Number(serviceFeeRate);

  // --- Start Decimal Calculations ---
  // Convert all inputs to Decimal objects for precise math
  const D_rate = new Decimal(rateNum);
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

  // --- Flat Interest Logic (with Decimals) ---

  // 1. Calculate totals (and round them, as they are final currency values)
  const D_totalInterest = round(D_netPrincipal.times(D_rate).div(100));
  const D_totalPayable = D_netPrincipal.plus(D_totalInterest);

  // 2. Calculate standard monthly payments (and round them)
  const D_monthlyPrincipal = round(D_netPrincipal.div(monthsNum));
  const D_monthlyInterest = round(D_totalInterest.div(monthsNum));
  const D_monthlyPayment = D_monthlyPrincipal.plus(D_monthlyInterest);

  // 3. Handle remainders
  // We must do this because (monthly * months) might not equal the total
  // due to rounding (e.g., 33.33 * 3 = 99.99, not 100.00)
  const D_totalPrincipalRounded = D_monthlyPrincipal.times(monthsNum);
  const D_principalRemainder = D_netPrincipal.minus(D_totalPrincipalRounded);

  const D_totalInterestRounded = D_monthlyInterest.times(monthsNum);
  const D_interestRemainder = D_totalInterest.minus(D_totalInterestRounded);

  // The last payment will be adjusted by these remainder amounts
  const D_finalPrincipal = D_monthlyPrincipal.plus(D_principalRemainder);
  const D_finalInterest = D_monthlyInterest.plus(D_interestRemainder);
  const D_finalTotalDue = D_finalPrincipal.plus(D_finalInterest);

  // Optional schedule generation
  let schedule = [];
  if (generateSchedule) {
    for (let i = 0; i < monthsNum; i++) {
      const dueDate = dayjs(startDate).add(i, "month").format("YYYY-MM-DD");

      // Is this the last payment?
      const isLastPayment = i === monthsNum - 1;

      schedule.push({
        loan_id: loanId,
        installment_no: i,
        due_date: dueDate,
        // Use adjusted final payment values if this is the last installment
        principal_due: (isLastPayment
          ? D_finalPrincipal
          : D_monthlyPrincipal
        ).toNumber(),
        interest_due: (isLastPayment
          ? D_finalInterest
          : D_monthlyInterest
        ).toNumber(),
        total_due: (isLastPayment
          ? D_finalTotalDue
          : D_monthlyPayment
        ).toNumber(),
        paid: false,
      });
    }
  }

  // Return the standard monthly amounts
  return {
    totalInterest: D_totalInterest.toNumber(),
    totalPayable: D_totalPayable.toNumber(),
    monthlyPayment: D_monthlyPayment.toNumber(),
    monthlyPrincipal: D_monthlyPrincipal.toNumber(),
    monthlyInterest: D_monthlyInterest.toNumber(),
    serviceFee: D_serviceFee.toNumber(),
    schedule,
  };
}
