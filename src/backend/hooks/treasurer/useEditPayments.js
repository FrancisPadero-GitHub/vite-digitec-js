import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { allocateEditedPayment } from "./utils/allocateEditedPayment";
import { useAddActivityLog } from "../shared/useAddActivityLog";

// --- Insert function ---
const updateLoanPayments = async (formData) => {
  const { ...dbPayload } = formData;

  if (!dbPayload.payment_id) {
    throw new Error("Payment ID is required for updating loan payments.");
  }

  if (!dbPayload.schedule_id) {
    throw new Error("Schedule ID is required for updating loan payments.");
  }

  // Reallocate payment to the specific schedule with the new amount
  // This handles both schedule and payment record updates
  const result = await allocateEditedPayment(supabase, {
    payment_id: dbPayload.payment_id,
    schedule_id: dbPayload.schedule_id,
    loan_ref_number: dbPayload.loan_ref_number,
    account_number: dbPayload.account_number,
    total_amount: dbPayload.total_amount,
    payment_method: dbPayload.payment_method,
    payment_date: dbPayload.payment_date,
    receipt_no: dbPayload.receipt_no,
  });

  return result;
}; // --- React hook ---
export const useEditLoanPayments = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog();
  return useMutation({
    mutationFn: updateLoanPayments,
    onSuccess: async (data) => {
      console.log("✅ Loan payment updated:", data);
      // Refresh any component using this query
      queryClient.invalidateQueries({
        queryKey: ["view_loan_payments"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["view_loan_accounts"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["loan_payment_schedules"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["view_member_loan_schedules"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["view_loan_accounts"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });

      // Log activity
      try {
        await logActivity({
          action: `Updated loan payment for ${data.member_name} (${data.account_number}): ₱${Number(data.total_amount).toLocaleString()} - Loan ID: ${data.loan_id}, Schedule ID: ${data.schedule_id}`,
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

/**
 * Reallocation logic
 * so the initial idea is that it will reallocate only if there is a change in the amount
 * because I was catering the overpayments on this function
 *
 * UPDATE: this will be commented out due how reallocation works on edits on payment schedules
 * it updates the latest payment schedule only not the specific schedule being edited along side with the payment
 * record. So any edits on the payment amount will just adjust the latest schedule accordingly.
 */
// Calculate the difference between the new and existing amounts

//   if (!dbPayload.payment_id) {
//   throw new Error("Payment ID is required for updating loan payments.");
// }

// // Fetch the existing payment record
// const { data: existingPayment, error: fetchError } = await supabase
//   .from("loan_payments")
//   .select("total_amount")
//   .eq("payment_id", dbPayload.payment_id)
//   .single();

// if (fetchError) {
//   throw new Error(`Failed to fetch existing payment: ${fetchError.message}`);
// }

// const amountDifference = dbPayload.total_amount - existingPayment.total_amount;

// // console.log("Amount Difference:", amountDifference);

// // Reallocate the payment difference if there is any
// if (amountDifference !== 0) {
//   const allocationResult = await allocateLoanPayment(supabase, {
//     ...dbPayload,
//     total_amount: amountDifference,
//   });
//   // Get the status of the main schedule worked on
//   const newStatus = allocationResult[0]?.status;

//   if (newStatus) {
//     dbPayload.status = newStatus; // <-- SET THE CORRECT STATUS
//   }
// }
// End of Reallocation logic
