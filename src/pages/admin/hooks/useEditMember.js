import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

const updateMember = async ({ member_id, account_type }) => {
  const payload = { account_type };

  const { data, error } = await supabase
    .from("members")
    .update(payload)
    .eq("member_id", member_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update account type: ${error.message}`);
  }

  return data;
};

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      // Refresh the users list to reflect the role change
      queryClient.invalidateQueries(["members"]);
    },
  });
}
