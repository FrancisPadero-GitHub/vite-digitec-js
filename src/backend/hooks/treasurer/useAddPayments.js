  import { supabase } from "../../supabase";
  import { useQueryClient, useMutation } from "@tanstack/react-query";
  import { allocateLoanPayment } from "./utils/allocateLoanPayment";
  import { useAddActivityLog } from "../shared/useAddActivityLog";


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
    const { mutateAsync: logActivity } = useAddActivityLog();

    return useMutation({
      mutationFn: insertLoanPayments,
      onSuccess: async (data) => {
        console.log("✅ Loan payment added:", data);
        // Refresh any component using this query
        queryClient.invalidateQueries({queryKey:["view_loan_payments"], exact: false});
        queryClient.invalidateQueries({queryKey: ["activity_logs"], exact: false });
        queryClient.invalidateQueries({queryKey:["loan_payment_schedules"], exact: false});
        queryClient.invalidateQueries({ queryKey: ["view_member_loan_schedules"], exact: false});
        queryClient.invalidateQueries({ queryKey: ["view_loan_accounts"], exact: false });
        queryClient.invalidateQueries({queryKey: ["get_funds_summary"], exact: false});
        // Log activity
        try {
          await logActivity({
            action: `Created member payment loan ID: ${data.loan_id} for Schedule ID: ${data.schedule_id}`,
            type: "CREATE",
          });
        } catch (err) {
          console.warn("Failed to log activity:", err.message);
        }
      },
      onError: (error) => {
        console.error("❌ Add loan payment failed:", error.message);
      },
    });
  };
