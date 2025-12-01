import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAddActivityLog } from "../shared/useAddActivityLog";
import { allocateLoanPayment } from "./utils/allocateLoanPayment";

/**
 * Soft delete a record in a specified table
 * @param {id} transaction_id - the id of the record to be deleted
 * @param {string} table - the name of the table
 * @param {string} table_id_name - the name of the id column in the table
 * @returns
 */

const markAsDelete = async ({ table, column_name, id }) => {
  if (!id) throw new Error("Invalid ID provided for deletion");

  // Fetch the existing payment record to get the amount and loan details
  const { data: existingPayment, error: fetchError } = await supabase
    .from(table)
    .select(
      "total_amount, loan_ref_number, account_number, payment_method, payment_date, receipt_no"
    )
    .eq(column_name, id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch existing payment: ${fetchError.message}`);
  }

  // Calculate the amount to reverse (negative of the payment amount)
  const amountToReverse = -existingPayment.total_amount;

  // Reverse the payment allocation in payment schedules
  if (amountToReverse !== 0) {
    await allocateLoanPayment(supabase, {
      loan_ref_number: existingPayment.loan_ref_number,
      account_number: existingPayment.account_number,
      total_amount: amountToReverse,
      payment_method: existingPayment.payment_method,
      payment_date: existingPayment.payment_date,
      receipt_no: existingPayment.receipt_no,
    });
  }

  // Mark the payment record as deleted
  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq(column_name, id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const useDeletePayment = (table) => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after a record is deleted successfully

  return useMutation({
    mutationFn: markAsDelete,
    onSuccess: async () => {
      console.log("Record marked as deleted, table:", table);
      queryClient.invalidateQueries({ queryKey: [table], exact: false });
      queryClient.invalidateQueries({
        queryKey: [`view_${table}`],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["loan_payment_schedules"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });

      // log activity
      try {
        await logActivity({
          action: `Deleted a record from ${table}`,
          type: "DELETE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Failed to delete", error.message);
    },
  });
};
