import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAddActivityLog } from "../shared/useAddActivityLog";

/**
 * Soft delete a record in a specified table
 * @param {id} transaction_id - the id of the record to be deleted
 * @param {string} table - the name of the table
 * @param {string} table_id_name - the name of the id column in the table
 * @returns
 */

const markAsDelete = async ({ table, column_name, id }) => {
  if (!id) throw new Error("Invalid ID provided for deletion");

  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq(column_name, id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const useDelete = (table) => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after a record is deleted successfully

  return useMutation({
    mutationFn: markAsDelete,
    onSuccess: async () => {
      console.log("Record marked as deleted, table:", table);
      queryClient.invalidateQueries({ queryKey: [table], exact: false }); // invalidate base table query
      queryClient.invalidateQueries({
        queryKey: [`view_${table}`],
        exact: false,
      }); // invalidate view query
      queryClient.invalidateQueries({
        queryKey: ["monthly_dues_records"],
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
