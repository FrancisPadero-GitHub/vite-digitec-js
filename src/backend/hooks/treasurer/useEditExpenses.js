import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

const updateExpenses = async (formData) => {
  const {
    transaction_id, // we need this to identify which row to update
    amount = 0,
    title = null,
    category = null,
    description = null,
    transaction_date = null,
  } = formData;

  if (!transaction_id) {
    throw new Error("Missing transaction_id for update.");
  }

  const payload = {
    amount,
    title,
    category,
    description,
    transaction_date,
  };

  const { data, error } = await supabase
    .from("club_funds_expenses")
    .update(payload)
    .eq("transaction_id", transaction_id) // match row
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// --- Hook Wrapper ---
export const useEditExpenses = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after expense is edited successfully
  
  return useMutation({
    mutationFn: updateExpenses,
    onSuccess: async (data) => {
      console.log("Expenses Updated!: ", data);
      queryClient.invalidateQueries({queryKey: ["club_funds_expenses"], exact: false});
      queryClient.invalidateQueries({queryKey: ["get_funds_summary"], exact: false,});
      queryClient.invalidateQueries({queryKey: ["activity_logs"], exact: false});

      // log activity
      try {
        await logActivity({
          action: `Updated club expense details for ${data.title}: ₱${Number(data.amount).toLocaleString()} - ${data.category}`,
          type: "UPDATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Updating expenses failed", error.message);
    },
  });
};
