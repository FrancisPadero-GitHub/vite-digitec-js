// This version doesn't split the transaction but split the amount on the amount_paid in the payment_schedulesimport { updateLoanStatusFromView } from "./updateLoanStatusFromView";
import { updateLoanStatusFromView } from "./updateLoanStatusFromView";

/**
 * Allocate a single payment across loan schedules.
 * Updates amount_paid in schedules but creates only one payment transaction.
 */
export async function allocateLoanPayment(
  supabase,
  { loan_ref_number, account_number, total_amount, payment_method, payment_date, receipt_no }
) {
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // --- Fetch the loan_id using the ref number ---
  const { data: loanAccount, error: loanErr } = await supabase
    .from("loan_accounts")
    .select("loan_id")
    .eq("loan_ref_number", loan_ref_number)
    .single();

  if (loanErr || !loanAccount) throw new Error("No loan_id found for this loan_ref_number.");
  const targetLoanId = loanAccount.loan_id;

  let remaining = round(total_amount);

  // fetch payment schedules
  const { data: schedules, error: schedErr } = await supabase
    .from("loan_payment_schedules")
    .select("*")
    .eq("loan_id", targetLoanId)
    .order("due_date", { ascending: true });

  if (schedErr) throw schedErr;

  // --- Allocate payment across schedules ---
  for (const sched of schedules) {
    if (remaining <= 0) break;

    const alreadyPaid = round(sched.amount_paid || 0);
    const remainingDue = round(sched.total_due - alreadyPaid);

    if (remainingDue <= 0) continue;

    const allocation = Math.min(remaining, remainingDue);
    remaining = round(remaining - allocation);

    const totalDue = round(sched.total_due);
    const feePortion = sched.fee_due / totalDue;
    const interestPortion = sched.interest_due / totalDue;
    const principalPortion = sched.principal_due / totalDue;

    const fees = round(allocation * feePortion);
    const interest = round(allocation * interestPortion);
    const principal = round(allocation * principalPortion);

    const newTotalPaid = round(alreadyPaid + allocation);
    const fullyPaid = newTotalPaid >= sched.total_due;

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
  }

  // --- Record a single payment transaction ---
  const { error: paymentErr } = await supabase
    .from("loan_payments")
    .insert([
      {
        loan_ref_number,
        account_number,
        total_amount,
        payment_method,
        payment_date,
        receipt_no,
      },
    ]);

  if (paymentErr) throw paymentErr;

  // --- Update loan_accounts status ---
  await updateLoanStatusFromView(supabase, targetLoanId);

  return { loan_ref_number, account_number, total_amount, applied_to_schedules: schedules.length };
}
