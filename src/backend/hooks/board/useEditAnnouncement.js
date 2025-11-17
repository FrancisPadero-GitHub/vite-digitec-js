import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

/**
 * Updates an existing announcement/notification.
 *
 * @param {Object} params
 * @param {number} params.id - The notification ID to update.
 * @param {string} [params.message] - The updated message.
 * @param {string} [params.type] - The updated type.
 */
const editAnnouncement = async ({ id, message, type }) => {
  if (!id) {
    throw new Error("Notification ID is required.");
  }

  const updates = {};
  if (message !== undefined) updates.message = message;
  if (type !== undefined) updates.type = type;

  if (Object.keys(updates).length === 0) {
    throw new Error("No fields to update.");
  }

  const { data, error } = await supabase
    .from("notifications")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("❌ Update Error:", error);
    throw error;
  }

  return data;
};

/**
 * React Query hook to edit an announcement.
 */
export function useEditAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editAnnouncement,

    onSuccess: () => {
      console.log("✅ Announcement updated successfully");
      queryClient.invalidateQueries(["notifications"]);
    },

    onError: (error) => {
      console.error("❌ Failed to update announcement:", error);
    },
  });
}
