import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * Soft-delete notifications.
 * - Single delete: pass { notif_id }
 * - Delete all for a user: pass { account_no }
 */
const deleteNotifications = async ({ notif_id, account_no }) => {
  const query = supabase.from("notifications").update({ deleted_at: new Date().toISOString() });

  if (notif_id) {
    query.eq("id", notif_id);
  } else if (account_no) {
    query.eq("recipient_id", account_no);
  } else {
    throw new Error("Either notif_id or account_no must be provided to delete notifications.");
  }

  const { error } = await query;
  if (error) throw error;
};

export const useDeleteNotif = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotifications,
    onSuccess: async (_data, variables) => {
      const { notif_id, account_no } = variables || {};
      console.log("Notification delete succeeded", { notif_id, account_no });

      // Invalidate notifications queries so UI re-fetches (view filters deleted_at)
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: false });

      // if we deleted all for a user, ensure other notification pockets refresh
      if (account_no) {
        queryClient.invalidateQueries({ queryKey: ["pendingLoanReleases"], exact: false });
      }
    },
    onError: (error) => {
      console.error("Failed to delete notifications", error.message || error);
    },
  });
};

export default useDeleteNotif;
