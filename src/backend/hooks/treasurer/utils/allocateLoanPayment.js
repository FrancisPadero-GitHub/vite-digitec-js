import Decimal from "decimal.js";
import { updateLoanStatusFromView } from "./updateLoanStatusFromView";

const round = (num) =>
  new Decimal(num).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

// Unified status helper
function getScheduleStatus(amountPaid, totalDue) {
  const paid = round(amountPaid);
  const due = round(totalDue);

  if (paid.eq(0)) return "UNPAID";
  if (paid.gte(due)) return "PAID";
  return "PARTIALLY PAID";
}
// This is for the old edit reverse allocation logic if there is a difference on the amount paid
async function reversePaymentAllocation(
  supabase,
  targetLoanId,
  amountToReverse
) {
  let remaining = round(amountToReverse);

  const { data: schedules, error: schedErr } = await supabase
    .from("loan_payment_schedules")
    .select("*")
    .eq("loan_id", targetLoanId)
    .neq("amount_paid", 0)
    .order("due_date", { ascending: false });

  if (schedErr) throw schedErr;

  for (const sched of schedules) {
    if (remaining.lte(0)) break;

    const alreadyPaid = round(sched.amount_paid || 0);
    const reversal = Decimal.min(remaining, alreadyPaid);

    const newTotalPaid = round(alreadyPaid.minus(reversal));
    remaining = round(remaining.minus(reversal));

    const newStatus = getScheduleStatus(newTotalPaid, sched.total_due);

    const { error: updateErr } = await supabase
      .from("loan_payment_schedules")
      .update({
        amount_paid: newTotalPaid.toNumber(),
        paid: newStatus === "PAID",
        status: newStatus,
        paid_at: newTotalPaid.gt(0) ? sched.paid_at : null,
      })
      .eq("schedule_id", sched.schedule_id);

    if (updateErr) throw updateErr;
  }

  updateLoanStatusFromView(supabase, targetLoanId);
  return [];
}

export async function allocateLoanPayment(
  supabase,
  {
    loan_ref_number,
    account_number,
    total_amount,
    payment_method,
    payment_date,
    receipt_no,
  }
) {
  const { data: loanAccount, error: loanErr } = await supabase
    .from("loan_accounts")
    .select("loan_id")
    .eq("loan_ref_number", loan_ref_number)
    .single();

  if (loanErr || !loanAccount)
    throw new Error("No loan_id found for this loan_ref_number.");

  const targetLoanId = loanAccount.loan_id;

  let remaining = round(total_amount);
  let allocations = [];

  if (remaining.lt(0)) {
    return await reversePaymentAllocation(
      supabase,
      targetLoanId,
      remaining.abs()
    );
  }

  const { data: schedules, error: schedErr } = await supabase
    .from("loan_payment_schedules")
    .select("*")
    .eq("loan_id", targetLoanId)
    .order("due_date", { ascending: true });

  if (schedErr) throw schedErr;

  for (const sched of schedules) {
    if (remaining.lte(0)) break;

    const alreadyPaid = round(sched.amount_paid || 0);
    const remainingDue = round(new Decimal(sched.total_due).minus(alreadyPaid));
    if (remainingDue.lte(0)) continue;

    const allocation = Decimal.min(remaining, remainingDue);
    const newTotalPaid = round(alreadyPaid.plus(allocation));
    const newStatus = getScheduleStatus(newTotalPaid, sched.total_due);

    remaining = round(remaining.minus(allocation));

    const fees = round(
      allocation.times(new Decimal(sched.fee_due).div(sched.total_due))
    );
    const interest = round(
      allocation.times(new Decimal(sched.interest_due).div(sched.total_due))
    );
    const principal = round(allocation.minus(fees).minus(interest));

    allocations.push({
      schedule_id: sched.schedule_id,
      loan_id: targetLoanId,
      account_number,
      loan_ref_number,
      payment_method,
      payment_date,
      receipt_no,
      total_amount: allocation.toNumber(),
      fees: fees.toNumber(),
      interest: interest.toNumber(),
      principal: principal.toNumber(),
      status: newStatus,
    });

    const { error: updateErr } = await supabase
      .from("loan_payment_schedules")
      .update({
        amount_paid: newTotalPaid.toNumber(),
        paid: newStatus === "PAID",
        status: newStatus,
        paid_at: new Date().toISOString(),
      })
      .eq("schedule_id", sched.schedule_id);

    if (updateErr) throw updateErr;
  }

  // Overpayment
  if (remaining.gt(0)) {
    allocations.push({
      loan_id: targetLoanId,
      account_number,
      loan_ref_number,
      payment_method,
      payment_date,
      receipt_no,
      total_amount: remaining.toNumber(),
      fees: 0,
      interest: 0,
      principal: remaining.toNumber(),
      status: "OVERPAYMENT",
    });

    remaining = new Decimal(0);
  }

  updateLoanStatusFromView(supabase, targetLoanId);

  return allocations;
}
