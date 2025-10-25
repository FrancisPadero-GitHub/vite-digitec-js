import { updateLoanStatusFromView } from "./updateLoanStatusFromView";

/**
 *
 * This version splits the overpayment to two transaction
 * 
 */



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
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // --- Fetch the loan_id using the ref number ---
  const { data: loanAccount, error: loanErr } = await supabase
    .from("loan_accounts")
    .select("loan_id")
    .eq("loan_ref_number", loan_ref_number)
    .single();

  if (loanErr || !loanAccount)
    throw new Error("No loan_id found for this loan_ref_number.");
  const targetLoanId = loanAccount.loan_id;

  // --- Initialize remaining payment ---
  let remaining = round(total_amount);
  let allocations = [];

  // --- Fetch unpaid or partially paid schedules in order ---
  const { data: schedules, error: schedErr } = await supabase
    .from("loan_payment_schedules")
    .select("*")
    .eq("loan_id", targetLoanId)
    .neq("status", "PAID") // fetch all unpaid or partially paid
    .order("due_date", { ascending: true });

  if (schedErr) throw schedErr;

  // --- Iterate through schedules and allocate payments ---
  for (const sched of schedules) {
    if (remaining <= 0) break;

    // Use amount_paid if it exists; otherwise assume 0
    const alreadyPaid = round(sched.amount_paid || 0);
    const remainingDue = round(sched.total_due - alreadyPaid);

    if (remainingDue <= 0) continue; // skip fully paid schedule (just in case)

    // --- Allocate payment up to the remaining due ---
    const allocation = Math.min(remaining, remainingDue);
    remaining = round(remaining - allocation);

    // --- Split the allocation by fee, interest, principal proportionally ---
    const totalDue = round(sched.total_due);
    const feePortion = sched.fee_due / totalDue;
    const interestPortion = sched.interest_due / totalDue;
    const principalPortion = sched.principal_due / totalDue;

    const fees = round(allocation * feePortion);
    const interest = round(allocation * interestPortion);
    const principal = round(allocation * principalPortion);

    const newTotalPaid = round(alreadyPaid + allocation);
    const fullyPaid = newTotalPaid >= sched.total_due;

    // --- Record this allocation ---
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

    // --- Update the schedule’s payment progress ---
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

    if (remaining <= 0) break; // stop if payment fully used
  }

  // --- Handle leftover overpayment (apply to next unpaid schedule’s principal) ---
  if (remaining > 0) {
    // Try to find next unpaid schedule
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
      // If no remaining schedules, treat as pure overpayment (extra principal)
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

  // --- Update loan_accounts status if fully paid ---
  updateLoanStatusFromView(supabase, targetLoanId);

  return allocations;
}
