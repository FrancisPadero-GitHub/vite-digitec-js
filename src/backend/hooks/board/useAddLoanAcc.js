import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
// Removed schedule generation imports

const addLoanAcc = async (formData) => {
  const {
    application_id = null,
    product_id = null,
    account_number = null,
    loan_ref_number = null,
    principal = 0,
    total_interest = 0,
    amount_req = 0,
    total_amount_due = 0,
    status = null,
    release_date = null,
    approved_date = null,
    maturity_date = null,
    first_due = null,
    service_fee = 0,
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
    service_fee,
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
      queryClient.invalidateQueries({queryKey: ["loan_accounts"], exact: false});
      queryClient.invalidateQueries({queryKey: ["view_loan_accounts"], exact: false});
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });
    },

    onError: (error) => {
      console.error("Adding Loan account failed:", error.message);
    },
  });
};
