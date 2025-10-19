import { supabase } from "../../supabase";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const insertLoanApp = async (formData, accountNumber) => {
  const {
    product_id = null,
    amount = null,
    purpose = null,
    application_date = null,
  } = formData;

  const payload = {
    product_id,
    amount,
    purpose,
    application_date,
    status: "Pending",
    account_number: accountNumber,
  };

  const { data, error } = await supabase
    .from("loan_applications")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useAddLoanApp = () => {
  const queryClient = useQueryClient();
  const { data: loggedInAccountNumber } = useFetchAccountNumber();

  return useMutation({
    mutationFn: (formData) => insertLoanApp(formData, loggedInAccountNumber),
    onSuccess: (data) => {
      console.log("Loan Application Added!: ", data);
      queryClient.invalidateQueries([
        "loan_applications",
        loggedInAccountNumber,
      ]);
    },
    onError: (error) => {
      console.error("Adding Loan Application failed", error.message);
    },
  });
};
