import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

const updateMember = async ({ member_id, account_role }) => {
  const payload = { account_role };

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
      queryClient.invalidateQueries(["members"]);
    },
  });
}
