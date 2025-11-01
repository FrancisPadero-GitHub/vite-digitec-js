  import { supabase } from "../../supabase";
  import { useQueryClient, useMutation } from "@tanstack/react-query";
  import { allocateLoanPayment } from "./utils/allocateLoanPayment";


  // --- Insert function ---
  const insertLoanPayments = async (formData) => {

    // the payload is inside this hook
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
        queryClient.invalidateQueries({queryKey:["loan_payments"], exact: false});
        queryClient.invalidateQueries({queryKey:["loan_payment_schedules"], exact: false});
        queryClient.invalidateQueries({
          queryKey: ["get_funds_summary"],
          exact: false,
        });
      },
      onError: (error) => {
        console.error("❌ Add loan payment failed:", error.message);
      },
    });
  };
