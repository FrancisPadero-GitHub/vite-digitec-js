import { updateLoanStatusFromView } from "./updateLoanStatusFromView";
import Decimal from "decimal.js";

/**
 * Reverses payment allocation when reducing a payment amount.
 * Subtracts from the most recently paid schedules in reverse order.
 */
async function reversePaymentAllocation(supabase, targetLoanId, amountToReverse) {
  let remaining = new Decimal(amountToReverse);

  // Fetch all paid or partially paid schedules for this loan, sorted by due date (descending - most recent first)
  const { data: schedules, error: schedErr } = await supabase
    .from("loan_payment_schedules")
    .select("*")
    .eq("loan_id", targetLoanId)
    .neq("amount_paid", 0)
    .order("due_date", { ascending: false });

  if (schedErr) throw schedErr;

  for (const sched of schedules) {
    if (remaining.lte(0)) break;

    const alreadyPaid = new Decimal(sched.amount_paid || 0);
    if (alreadyPaid.lte(0)) continue;

    const reversal = Decimal.min(remaining, alreadyPaid);
    remaining = remaining.minus(reversal);

    const newTotalPaid = alreadyPaid.minus(reversal);
    const fullyPaid = newTotalPaid.gte(sched.total_due);
    const partiallyPaid = newTotalPaid.gt(0) && newTotalPaid.lt(sched.total_due);

    const { error: updateErr } = await supabase
      .from("loan_payment_schedules")
      .update({
        amount_paid: newTotalPaid.toNumber(),
        paid: fullyPaid,
        status: fullyPaid ? "PAID" : partiallyPaid ? "PARTIALLY PAID" : "UNPAID",
        paid_at: newTotalPaid.gt(0) ? sched.paid_at : null,
      })
      .eq("schedule_id", sched.schedule_id);

    if (updateErr) throw updateErr;

    if (remaining.lte(0)) break;
  }

  updateLoanStatusFromView(supabase, targetLoanId);
  return [];
}

/**
 * Allocates a loan payment across multiple scheduled payments.
 *
 * Note:
 *   This version previously supported splitting overpayments into two separate
 *   transactions, but that logic is currently disabled per ECTEC policy.
 *   Overpayments are not officially supported yet.
 */

export async function allocateLoanPayment(
  supabase,
  {
    // Extracted from formData – only the relevant payment fields are needed
    loan_ref_number,
    account_number,
    total_amount,
    payment_method,
    payment_date,
    receipt_no,
  }
) {
  // Retrieve loan_id from the reference number to identify the target loan
  const { data: loanAccount, error: loanErr } = await supabase
    .from("loan_accounts")
    .select("loan_id")
    .eq("loan_ref_number", loan_ref_number)
    .single();

  if (loanErr || !loanAccount)
    throw new Error("No loan_id found for this loan_ref_number.");

  const targetLoanId = loanAccount.loan_id;
  let remaining = new Decimal(total_amount);
  let allocations = [];

  if (remaining.isNeg()) {
    return await reversePaymentAllocation(supabase, targetLoanId, remaining.abs().toNumber());
  }

  const { data: schedules, error: schedErr } = await supabase
    .from("loan_payment_schedules")
    .select("*")
    .eq("loan_id", targetLoanId)
    .neq("status", "PAID")
    .order("due_date", { ascending: true });

  if (schedErr) throw schedErr;

  for (const sched of schedules) {
    if (remaining.lte(0)) break;

    const alreadyPaid = new Decimal(sched.amount_paid || 0);
    const remainingDue = new Decimal(sched.total_due).minus(alreadyPaid);
    if (remainingDue.lte(0)) continue;

    const allocation = Decimal.min(remaining, remainingDue);
    remaining = remaining.minus(allocation);

    const totalDue = new Decimal(sched.total_due);
    const feePortion = new Decimal(sched.fee_due).div(totalDue);
    const interestPortion = new Decimal(sched.interest_due).div(totalDue);

    const fees = allocation.mul(feePortion);
    const interest = allocation.mul(interestPortion);
    const principal = allocation.minus(fees).minus(interest);

    const calculatedSum = fees.plus(interest).plus(principal);
    if (!calculatedSum.eq(allocation)) {
      console.warn(`Allocation mismatch: ${calculatedSum.toNumber()} vs ${allocation.toNumber()}`);
    }

    const newTotalPaid = alreadyPaid.plus(allocation);
    const fullyPaid = newTotalPaid.gte(sched.total_due);

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
      status: fullyPaid ? "Full" : "Partial",
    });

    const { error: updateErr } = await supabase
      .from("loan_payment_schedules")
      .update({
        amount_paid: newTotalPaid.toNumber(),
        paid: fullyPaid,
        status: fullyPaid ? "PAID" : "PARTIALLY PAID",
        paid_at: new Date().toISOString(),
      })
      .eq("schedule_id", sched.schedule_id);

    if (updateErr) throw updateErr;

    if (remaining.lte(0)) break;
  }

  // Handle any leftover amount that couldn’t be allocated normally (overpayment)
  if (remaining.gt(0)) {
    const nextSched = schedules.find((s) => s.status !== "PAID");
    if (nextSched) {
      const nextPaid = new Decimal(nextSched.amount_paid || 0).plus(remaining);
      const { error: updateErr } = await supabase
        .from("loan_payment_schedules")
        .update({
          amount_paid: nextPaid.toNumber(),
          status: "PARTIALLY PAID",
          paid_at: new Date().toISOString(),
        })
        .eq("schedule_id", nextSched.schedule_id);

      if (updateErr) throw updateErr;

      allocations.push({
        schedule_id: nextSched.schedule_id,
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
        status: "auto-applied",
      });
    } else {
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
        status: "overpayment",
      });
    }
    remaining = new Decimal(0);
  }

  updateLoanStatusFromView(supabase, targetLoanId);
  return allocations;
}
