import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

// Used to release a Loan Accounts

const updateLoanAcc = async (formData) => {
  const {
    loan_id = null,
    release_date = null,
  } = formData;


  const payload = {
    release_date,
  };

  const { data, error } = await supabase
    .from("loan_accounts")
    .update(payload)
    .eq("loan_id", loan_id) 
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};


export const useEditLoanAcc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLoanAcc,
    onSuccess: (data) => {
      console.log("Loan Released!: ", data);
      queryClient.invalidateQueries(["loan_accounts"]);
    },
    onError: (error) => {
      console.error("Loan Failed Release", error.message);
    },
  });
};
