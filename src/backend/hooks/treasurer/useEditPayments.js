import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { allocateLoanPayment } from "./utils/allocateLoanPayment";
import { useAddActivityLog } from "../shared/useAddActivityLog";


  // --- Insert function ---
  const updateLoanPayments = async (formData) => {
    // Exclude non-database fields from the payload
    const { sched_id, outstanding_balance, status, ...dbPayload } = formData;

    console.log("Columns Excluded", { sched_id, outstanding_balance, status });

    // Fetch the existing payment record
    const { data: existingPayment, error: fetchError } = await supabase
      .from("loan_payments")
      .select("total_amount")
      .eq("payment_id", dbPayload.payment_id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch existing payment: ${fetchError.message}`);
    }

    // Calculate the difference between the new and existing amounts
    const amountDifference = dbPayload.total_amount - existingPayment.total_amount;

    console.log("Amount Difference:", amountDifference);

    // Reallocate the payment difference if there is any
    if (amountDifference !== 0) {
      await allocateLoanPayment(supabase, {
        ...dbPayload,
        total_amount: amountDifference,
      });
    }

    // Update the loan payment record
    const { data, error } = await supabase
      .from("loan_payments")
      .update(dbPayload)
      .eq("payment_id", dbPayload.payment_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  // --- React hook ---
  export const useEditLoanPayments = () => {
    const queryClient = useQueryClient();
    const { mutateAsync: logActivity } = useAddActivityLog();
    return useMutation({
      mutationFn: updateLoanPayments,
      onSuccess: async (data) => {
        console.log("✅ Loan payment updated:", data);
        // Refresh any component using this query
        queryClient.invalidateQueries({ queryKey: ["loan_payments"], exact: false });
        queryClient.invalidateQueries({ queryKey: ["loan_accounts"], exact: false });
        queryClient.invalidateQueries({ queryKey: ["loan_payment_schedules"], exact: false });
        queryClient.invalidateQueries({ queryKey: ["get_funds_summary"], exact: false });
        // Log activity
        try {
          await logActivity({
            action: `Updated member payment loan ID: ${data.loan_id} for Schedule ID: ${data.schedule_id}`,
            type: "UPDATE",
          });
        } catch (err) {
          console.warn("Failed to log activity:", err.message);
        }
      },
      onError: (error) => {
        console.error("❌ Updated loan payment failed:", error.message);
      },
    });
  };
