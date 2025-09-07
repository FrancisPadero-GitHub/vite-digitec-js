import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

/**
 * Delete a member by ID
 *
 */
const deleteMember = async (id) => {
  if (!id) throw new Error("Member ID is required for delete.");

  const { error } = await supabase.from("members").delete().eq("member_id", id);

  if (error) throw new Error(`Failed to delete member: ${error.message}`);
  return id; // return deleted ID so UI can use it
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
    },
    onError: (error) => {
      console.error("Delete member failed:", error.message);
    },
  });
};
