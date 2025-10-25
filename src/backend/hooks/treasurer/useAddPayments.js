  import { supabase } from "../../supabase";
  import { useQueryClient, useMutation } from "@tanstack/react-query";
  import { allocateLoanPayment } from "./utils/allocateLoanPayment";


  // --- Insert function ---
  const insertLoanPayments = async (formData) => {
    const allocations = await allocateLoanPayment(supabase, formData);


    const { data, error } = await supabase
      .from("loan_payments")
      .insert(allocations)
      .select()


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
