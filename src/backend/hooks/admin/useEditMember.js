import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAddActivityLog } from "../shared/useAddActivityLog";

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
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after member's role is updated successfully

  return useMutation({
    mutationFn: updateMember,
    onSuccess: async (data) => {
      queryClient.invalidateQueries(["members"]);

      // log activity
      try {
        await logActivity({
          action: `Updated role of member ${data.member_id} to ${data.account_role}`,
          type: "UPDATE"
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
  });
}
