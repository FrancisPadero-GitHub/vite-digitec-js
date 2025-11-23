import Decimal from "decimal.js";
import { updateLoanStatusFromView } from "./updateLoanStatusFromView";

const round = (num) => new Decimal(num).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

// Unified status helper
function getScheduleStatus(amountPaid, totalDue) {
  const paid = round(amountPaid);
  const due = round(totalDue);

  if (paid.eq(0)) return "UNPAID";
  if (paid.gte(due)) return "PAID";
  return "PARTIALLY PAID";
}

/**
 * Allocates an edited payment amount to a specific schedule
 * Used when editing existing payment records
 * 
 * @param {object} supabase - Supabase client
 * @param {object} params - Payment parameters
 * @param {string} params.payment_id - Payment record ID to update
 * @param {string} params.schedule_id - Specific schedule to allocate to
 * @param {string} params.loan_ref_number - Loan reference number
 * @param {string} params.account_number - Member account number
 * @param {number} params.total_amount - New payment amount
 * @param {string} params.payment_method - Payment method
 * @param {string} params.payment_date - Payment date
 * @param {string} params.receipt_no - Receipt number
 * @returns {Promise<object>} Updated payment record with member info
 */
export async function allocateEditedPayment(
  supabase,
  {
    payment_id,
    schedule_id,
    loan_ref_number,
    account_number,
    total_amount,
    payment_method,
    payment_date,
    receipt_no,
  }
) {
    
  if (!payment_id) {
    throw new Error("payment_id is required for editing payment allocation.");
  }

  if (!schedule_id) {
    throw new Error("schedule_id is required for editing payment allocation.");
  }

  // Fetch the specific schedule
  const { data: schedule, error: schedErr } = await supabase
    .from("loan_payment_schedules")
    .select("*")
    .eq("schedule_id", schedule_id)
    .single();

  if (schedErr || !schedule) {
    throw new Error("Schedule not found for the given schedule_id.");
  }

  const targetLoanId = schedule.loan_id;
  const paymentAmount = round(total_amount);

  // Calculate allocation for this specific schedule
  const totalDue = round(schedule.total_due);
  const newTotalPaid = paymentAmount;
  const newStatus = getScheduleStatus(newTotalPaid, totalDue);

  // Calculate proportional breakdown
  const fees = round(paymentAmount.times(new Decimal(schedule.fee_due).div(totalDue)));
  const interest = round(paymentAmount.times(new Decimal(schedule.interest_due).div(totalDue)));
  const principal = round(paymentAmount.minus(fees).minus(interest));

  // Update the schedule with new payment amount
  const { error: updateErr } = await supabase
    .from("loan_payment_schedules")
    .update({
      amount_paid: newTotalPaid.toNumber(),
      paid: newStatus === "PAID",
      status: newStatus,
      paid_at: newTotalPaid.gt(0) ? new Date().toISOString() : null
    })
    .eq("schedule_id", schedule_id);

  if (updateErr) throw updateErr;

  // Update the payment record with new breakdown
  const paymentPayload = {
    schedule_id,
    loan_id: targetLoanId,
    account_number,
    loan_ref_number,
    payment_method,
    payment_date,
    receipt_no,
    total_amount: paymentAmount.toNumber(),
    fees: fees.toNumber(),
    interest: interest.toNumber(),
    principal: principal.toNumber(),
    status: newStatus
  };

  const { data: paymentData, error: paymentErr } = await supabase
    .from("loan_payments")
    .update(paymentPayload)
    .eq("payment_id", payment_id)
    .select(`
      *,
      loan_accounts!loan_payments_loan_id_fkey (
        account_number,
        members!loan_accounts_account_number_fkey (f_name, l_name)
      )
    `)
    .single();

  if (paymentErr) throw new Error(paymentErr.message);

  // Update loan status
  await updateLoanStatusFromView(supabase, targetLoanId);

  // Flatten member data for easier access
  const memberData = paymentData.loan_accounts?.members;
  return {
    ...paymentData,
    member_name: memberData ? `${memberData.f_name} ${memberData.l_name}` : "N/A",
    account_number: paymentData.loan_accounts?.account_number || "N/A",
  };
}
