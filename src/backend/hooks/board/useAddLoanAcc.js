import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
// Removed schedule generation imports

const addLoanAcc = async (formData) => {
  const {
    application_id = null,
    product_id = null,
    account_number = null,
    loan_ref_number = null,
    principal = null,
    total_interest = null,
    amount_req = null,
    total_amount_due = null,
    status = null,
    release_date = null,
    approved_date = null,
    maturity_date = null,
    first_due = null,
  } = formData;

  const loanPayload = {
    application_id,
    product_id,
    account_number,
    loan_ref_number,
    principal,
    total_interest,
    amount_req,
    total_amount_due,
    status,
    release_date,
    approved_date,
    maturity_date,
    first_due,
  };

  const { data, error: loanError } = await supabase
    .from("loan_accounts")
    .insert(loanPayload)
    .select()
    .single();

  if (loanError) {
    throw new Error(loanError.message);
  }

  return data;
};

export const useAddLoanAcc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLoanAcc,
    onSuccess: (data) => {
      console.log("✅ Loan Account Added!", data);
      queryClient.invalidateQueries(["loan_accounts"]);
      queryClient.invalidateQueries(["loan_accounts_view"]);
    },

    onError: (error) => {
      console.error("Adding Loan account failed:", error.message);
    },
  });
};
