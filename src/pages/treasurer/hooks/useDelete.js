import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

/**
 * Soft delete a record in a specified table
 * @param {id} transaction_id - the id of the record to be deleted
 * @param {string} table - the name of the table
 * @param {string} table_id_name - the name of the id column in the table
 * @returns
 */

const markAsDelete = async ({ table, column_name, id }) => {
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

  return useMutation({
    mutationFn: markAsDelete,
    onSuccess: () => {
      console.log("Record marked as deleted, table:", table);
      queryClient.invalidateQueries([table]);
      queryClient.invalidateQueries(["rpc_totals"]);
    },
    onError: (error) => {
      console.error("Failed to delete", error.message);
    },
  });
};
