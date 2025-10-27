/**
 * VERSION 1
 * Updates the loan_accounts status only when the outstanding_balance is zero.
 *
 * @param {object} supabase - Supabase client instance
 * @param {number} loanId - loan_id to check and update
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

  if (fetchErr) throw new Error(`Failed to fetch from view: ${fetchErr.message}`);
  if (!viewData) throw new Error("Loan not found in view");

  const outstandingBalance = round(viewData.outstanding_balance);

  // Only update status if balance is zero
  if (outstandingBalance <= 0) {
    const { error: updateErr } = await supabase
      .from("loan_accounts")
      .update({ status: "Closed" })
      .eq("loan_id", loanId);

    if (updateErr) throw new Error(`Failed to update loan status: ${updateErr.message}`);

    return { outstandingBalance, status: "Closed" };
  }

  // If balance is not zero, do nothing
  return { outstandingBalance, status: "Active" };
}

/**
 * The difference between the two is how they handle the status if the outstanding_balance is zero
 * Version 1 
 * Updates the loan_accounts table only if the outstanding balance is zero:
 * 
 * Version 2
 * Always updates the status, no matter what the outstanding balance is:
 * 
 */


/**
 * VERSION 2
 * Always updates the status, no matter what the outstanding balance is:
 * 
 * Updates the loan_accounts status based on the outstanding_balance
 * fetched from the loan_accounts_view.
 */

// export async function updateLoanStatusFromView(supabase, loanId) {
//   const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

//   // Fetch the latest data from the view
//   const { data: viewData, error: fetchErr } = await supabase
//     .from("loan_accounts_view")
//     .select("loan_id, outstanding_balance")
//     .eq("loan_id", loanId)
//     .single();

//   if (fetchErr)
//     throw new Error(`Failed to fetch from view: ${fetchErr.message}`);
//   if (!viewData) throw new Error("Loan not found in view");

//   const outstandingBalance = round(viewData.outstanding_balance);
//   const status = outstandingBalance <= 0 ? "Closed" : "Active";

//   // Update loan_accounts table
//   const { error: updateErr } = await supabase
//     .from("loan_accounts")
//     .update({ status })
//     .eq("loan_id", loanId);

//   if (updateErr)
//     throw new Error(`Failed to update loan status: ${updateErr.message}`);

//   console.log("UPDATE LOAN STATUS", outstandingBalance, status )
//   return { outstandingBalance, status };
// }
