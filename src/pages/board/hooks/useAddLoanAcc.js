import { supabase } from "../../../backend/supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const addLoanAcc = async (formData) => {
  const {
    application_id = null,
    applicant_id = null,
    product_id = null,
    account_number = null,
    principal = null,
    outstanding_balance = null,
    interest_rate = null,
    interest_method = null,
    status = null,
    release_date = null,
    maturity_date = null,
  } = formData;

  const payload = {
    application_id,
    applicant_id,
    product_id,
    account_number, 
    principal,
    outstanding_balance,
    interest_method,
    interest_rate,
    status,
    release_date,
    maturity_date
  }
  const { data, error } = await supabase
    .from("loan_accounts")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useAddLoanAcc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addLoanAcc,
    onSuccess: (data) => {
      console.log("Loan Account Added!: ", data);
      queryClient.invalidateQueries(["loan_accounts"]);
    },
    onError: (error) => {
      console.error("Adding Loan account failed", error.message);
    },
  });
};
