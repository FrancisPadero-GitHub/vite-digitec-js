import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { allocateLoanPayment } from "./utils/allocateLoanPayment";
import { useAddActivityLog } from "../shared/useAddActivityLog";


// --- Insert function ---
const updateLoanPayments = async (formData) => {
  // Exclude non-database fields from the payload
  const { ...dbPayload } = formData;



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
    const allocationResult = await allocateLoanPayment(supabase, {
      ...dbPayload,
      total_amount: amountDifference,
    });
    // Get the status of the main schedule worked on
    const newStatus = allocationResult[0]?.status;

    if (newStatus) {
      dbPayload.status = newStatus; // <-- SET THE CORRECT STATUS
    }
  }

  // Update the loan payment record
  const { data, error } = await supabase
    .from("loan_payments")
    .update(dbPayload)
    .eq("payment_id", dbPayload.payment_id)
    .select(`
        *,
        loan_accounts!loan_payments_loan_id_fkey (
          account_number,
          members!loan_accounts_account_number_fkey (f_name, l_name)
        )
      `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // flatten member data for easier access
  const memberData = data.loan_accounts?.members;
  return {
    ...data,
    member_name: memberData ? `${memberData.f_name} ${memberData.l_name}` : "N/A",
    account_number: data.loan_accounts?.account_number || "N/A",
  };
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
      queryClient.invalidateQueries({ queryKey: ["view_loan_payments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["view_loan_accounts"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["loan_payment_schedules"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["view_member_loan_schedules"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["view_loan_accounts"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["get_funds_summary"], exact: false });

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
