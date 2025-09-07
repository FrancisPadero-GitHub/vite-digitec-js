import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

/**
 * Update an existing member by ID
 * 
 */
const updateMember = async ({ id, updates }) => {
  if (!id) throw new Error("Member ID is required for update.");

  const { data, error } = await supabase
    .from("members")
    .update(updates)
    .eq("member_id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update member: ${error.message}`);
  return data;
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries(["members"]);
    },
    onError: (error) => {
      console.error("Update member failed:", error.message);
    },
  });
};
