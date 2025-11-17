import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber";

/**
 * Calls Supabase RPC to send an announcement.
 * This is for the announcement so the target for this is would be as all as in
 * all members will recieve an announcement.
 *
 * @param {Object} params
 * @param {string} params.message - The announcement message.
 * @param {string} [params.type] - Type of announcement (info, warning, alert, etc.).
 * @param {string|number|string[]} [params.target] - Recipient ID(s) or 'all'.
 * @param {string|number|null} [params.sender_id] - Account number of sender.
 */
const sendAnnouncement = async ({ message, type = "general", target = "all", sender_id = null }) => {
  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty.");
  }

  console.log("📤 Calling send_notification with:", { message, type, target, sender_id });

  const { data, error } = await supabase.rpc("send_notification", {
    p_message: message,
    p_type: type,
    p_target: target,
    p_sender: sender_id,
  });

  console.log("📥 RPC Response:", { data, error });

  if (error) {
    console.error("❌ RPC Error:", error);
    throw error;
  }

  return data;
};

/**
 * React Query hook to send announcements dynamically.
 * Automatically uses the logged-in user’s account number.
 */
export function useSendAnnouncement() {
  const queryClient = useQueryClient();
  const { data: accountNumber } = useFetchAccountNumber();

  return useMutation({
    mutationFn: ({ message, type = "general", target = "all" }) =>
      sendAnnouncement({
        message,
        type,
        target,
        sender_id: accountNumber
      }),

    onSuccess: (data) => {
      console.log("✅ Announcement sent successfully - Response:", data);
      queryClient.invalidateQueries(["notifications"]);
    },

    onError: (error) => {
      console.error("❌ Failed to send announcement:", error);
    },
  });
}
