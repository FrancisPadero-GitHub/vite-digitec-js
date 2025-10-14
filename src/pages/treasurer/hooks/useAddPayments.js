import { supabase } from "../../../backend/supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

// --- Insert function ---
const insertLoanPayments = async (formData) => {
  const {
    loan_id = null,
    payer_id = null,
    amount = null,
    payment_method = null,
    payment_date = null,
    receipt_no = null,
    payment_type = null,
  } = formData;

  const payload = {
    loan_id: loan_id ? Number(loan_id) : null,
    payer_id: payer_id ? Number(payer_id) : null,
    amount: amount ? Number(amount) : null,
    payment_method,
    payment_date,
    receipt_no,
    payment_type,
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
