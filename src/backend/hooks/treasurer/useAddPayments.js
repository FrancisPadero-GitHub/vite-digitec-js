import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

// --- Insert function ---
const insertLoanPayments = async (formData) => {
  const {
    loan_id = null,
    account_number = null,
    amount = null,
    payment_method = null,
    payment_date = null,
    receipt_no = null,
    loan_ref_number = null,
  } = formData;

  const payload = {
    loan_id,
    account_number,
    amount,
    payment_method,
    payment_date,
    receipt_no,
    loan_ref_number,
  };

  

  const { data, error } = await supabase
    .from("loan_payments")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// --- React hook ---
export const useAddLoanPayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertLoanPayments,
    onSuccess: (data) => {
      console.log("✅ Loan payment added:", data);
      // Refresh any component using this query
      queryClient.invalidateQueries(["loan_payments"]);
    },
    onError: (error) => {
      console.error("❌ Add loan payment failed:", error.message);
    },
  });
};
