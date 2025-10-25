/**
 * Updates the loan_accounts status based on the outstanding_balance
 * fetched from the loan_accounts_view.
 *
 * @param {object} supabase - Supabase client instance
 * @param {number} loanId - loan_id to update
 * @returns {object} - { outstandingBalance, status } after update
 */
export async function updateLoanStatusFromView(supabase, loanId) {
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  // Fetch the latest data from the view
  const { data: viewData, error: fetchErr } = await supabase
    .from("loan_accounts_view")
    .select("loan_id, outstanding_balance")
    .eq("loan_id", loanId)
    .single();

  if (fetchErr)
    throw new Error(`Failed to fetch from view: ${fetchErr.message}`);
  if (!viewData) throw new Error("Loan not found in view");

  const outstandingBalance = round(viewData.outstanding_balance);
  const status = outstandingBalance <= 0 ? "PAID" : "ONGOING";

  // Update loan_accounts table
  const { error: updateErr } = await supabase
    .from("loan_accounts")
    .update({ status })
    .eq("loan_id", loanId);

  if (updateErr)
    throw new Error(`Failed to update loan status: ${updateErr.message}`);

  console.log("UPDATE LOAN STATUS", outstandingBalance, status )
  return { outstandingBalance, status };
}
