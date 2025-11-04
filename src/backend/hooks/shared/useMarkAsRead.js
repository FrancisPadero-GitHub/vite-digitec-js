import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

/**
 * Dynamically marks one or all notifications as read.
 * 
 * @param {Object} params
 * @param {string|number} [params.notif_id] - Specific notification ID to mark as read.
 * @param {string|number} [params.account_no] - If provided (without notif_id), marks all for that account.
 */
const markNotificationAsRead = async ({ notif_id, account_no }) => {
  const query = supabase.from("notifications").update({ is_read: true });

  if (notif_id) {
    // Single notification
    query.eq("id", notif_id);
  } else if (account_no) {
    // All notifications for a user
    query.eq("recipient_id", account_no).eq("is_read", false);
  } else {
    throw new Error("Either notif_id or account_no must be provided.");
  }

  const { error } = await query;
  if (error) throw error;
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      console.log(`Notification marked as read`);
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: false });
    },
  });
};


/**
 * How to use
 * 
 * markAsReadMutation.mutate({ notif_id: notif.id }); as single
 * 
 * markAsReadMutation.mutate({ account_no: user.account_no }); // as all
 * 
 */