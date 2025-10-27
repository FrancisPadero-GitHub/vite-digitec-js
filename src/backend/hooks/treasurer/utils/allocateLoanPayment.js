import { updateLoanStatusFromView } from "./updateLoanStatusFromView";

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
  // Helper function to ensure consistent two-decimal rounding
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // Retrieve loan_id from the reference number to identify the target loan
  const { data: loanAccount, error: loanErr } = await supabase
    .from("loan_accounts")
    .select("loan_id")
    .eq("loan_ref_number", loan_ref_number)
    .single();

  if (loanErr || !loanAccount)
    throw new Error("No loan_id found for this loan_ref_number.");

  // Used later to update the loan’s status when fully paid
  const targetLoanId = loanAccount.loan_id;

  // Tracks the portion of the payment still available for allocation
  let remaining = round(total_amount);

  // Will collect each allocation record for database insertion/logging
  let allocations = [];

  // Fetch all unpaid or partially paid schedules for this loan, sorted by due date
  const { data: schedules, error: schedErr } = await supabase
    .from("loan_payment_schedules")
    .select("*")
    .eq("loan_id", targetLoanId)
    .neq("status", "PAID") // .neq means not equal
    .order("due_date", { ascending: true });

  if (schedErr) throw schedErr;

  // Process payment allocation across each pending schedule
  for (const sched of schedules) {
    if (remaining <= 0) break; // stop when full payment is allocated

    // Determine how much has already been paid for this schedule
    const alreadyPaid = round(sched.amount_paid || 0);
    const remainingDue = round(sched.total_due - alreadyPaid);

    if (remainingDue <= 0) continue; // skip any fully paid schedule (safety check)

    // Allocate only up to the remaining due for this schedule
    const allocation = Math.min(remaining, remainingDue);
    remaining = round(remaining - allocation);

    // Split allocation proportionally across fee, interest, and principal
    const totalDue = round(sched.total_due);
    const feePortion = sched.fee_due / totalDue;
    const interestPortion = sched.interest_due / totalDue;
    const principalPortion = sched.principal_due / totalDue;

    const fees = round(allocation * feePortion);
    const interest = round(allocation * interestPortion);
    const principal = round(allocation * principalPortion);

    // Determine if this schedule is now fully paid
    const newTotalPaid = round(alreadyPaid + allocation);
    const fullyPaid = newTotalPaid >= sched.total_due;

    // Push the data to the payments table columns
    allocations.push({
      schedule_id: sched.schedule_id,
      loan_id: targetLoanId,
      account_number,
      loan_ref_number,
      payment_method,
      payment_date,
      receipt_no,
      total_amount: allocation,
      fees,
      interest,
      principal,
      status: fullyPaid ? "full" : "partial",
    });

    // Update this schedule’s payment progress in the database
    const { error: updateErr } = await supabase
      .from("loan_payment_schedules")
      .update({
        amount_paid: newTotalPaid,
        paid: fullyPaid,
        status: fullyPaid ? "PAID" : "PARTIALLY PAID",
        paid_at: new Date().toISOString(),
      })
      .eq("schedule_id", sched.schedule_id);

    if (updateErr) throw updateErr;

    // Stop early if no unallocated payment remains
    if (remaining <= 0) break;
  }

  // Handle any leftover amount that couldn’t be allocated normally (overpayment)
  // THIS IS UNUSED FOR THE MOMENT AND DOES NOTHING CAUSE THE AMOUNT LIMITER IS PLACED ON THE FORM
  
  if (remaining > 0) {
    // Try applying it to the next available unpaid schedule
    const nextSched = schedules.find((s) => s.status !== "PAID");
    if (nextSched) {
      const { error: updateErr } = await supabase
        .from("loan_payment_schedules")
        .update({
          amount_paid: round((nextSched.amount_paid || 0) + remaining),
          status: "PARTIALLY PAID",
          paid_at: new Date().toISOString(),
        })
        .eq("schedule_id", nextSched.schedule_id);

      if (updateErr) throw updateErr;

      // Record auto-applied overpayment allocation
      allocations.push({
        schedule_id: nextSched.schedule_id,
        loan_id: targetLoanId,
        account_number,
        loan_ref_number,
        payment_method,
        payment_date,
        receipt_no,
        total_amount: round(remaining),
        fees: 0,
        interest: 0,
        principal: round(remaining),
        status: "auto-applied",
      });
    } else {
      // If no unpaid schedule exists, record it as a true overpayment
      // THIS IS UNUSED FOR THE MOMENT AND DOES NOTHING CAUSE THE AMOUNT LIMITER IS PLACED ON THE FORM
      allocations.push({
        loan_id: targetLoanId,
        account_number,
        loan_ref_number,
        payment_method,
        payment_date,
        receipt_no,
        total_amount: round(remaining),
        fees: 0,
        interest: 0,
        principal: round(remaining),
        status: "overpayment",
      });
    }

    remaining = 0;
  }

  // Recheck and update the main loan status (e.g., mark as fully paid if applicable)
  updateLoanStatusFromView(supabase, targetLoanId);

  // Return all recorded allocations for auditing or confirmation
  return allocations;
}
