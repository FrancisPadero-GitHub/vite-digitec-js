import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

const updateClubFunds = async (formData) => {
  const {
    contribution_id, // we need this to identify which row to update
    account_number = null,
    amount = 0,
    category = null,
    payment_date = null,
    period_start = null,
    period_end = null,
    payment_method = null,
    remarks = null,
  } = formData; // if the form data is empty it will fallback to these null values

  if (!contribution_id) {
    throw new Error("Missing contribution_id for update.");
  }

  const payload = {
    contribution_id,
    account_number,
    amount,
    category,
    payment_date,
    period_start,
    period_end,
    payment_method,
    remarks,
  };

  const { data, error } = await supabase
    .from("club_funds_contributions")
    .update(payload)
    .eq("contribution_id", contribution_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message); // Let React Query handle it
  }

  return data; // Will be passed to onSuccess / mutation.data
};

// React Query mutation hook
export const useEditClubFunds = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after contribution is edited successfully

  return useMutation({
    mutationFn: updateClubFunds,
    onSuccess: async (data) => {
      console.log("Contribution Updated!", data);
      queryClient.invalidateQueries({ queryKey: ["club_funds_contributions"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["rpc_totals"], exact: false });

      // log activity
      try {
        await logActivity({
          action: `Updated club fund contribution details for account ${data.account_number}`,
          type: "UPDATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Updating contribution failed!", error.message);
    },
  });
};
