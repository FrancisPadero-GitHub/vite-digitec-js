import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const updateClubFunds = async (formData) => {
  const {
    contribution_id, // we need this to identify which row to update
    member_id = null,
    amount = null,
    category = null,
    payment_date = null,
    period_start = null,
    period_end = null,
    payment_method = null,
    remarks = null,
  } = formData; // if the form data is empty it will fallback to these null values

  const payload = {
    contribution_id,
    member_id,
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
  return useMutation({
    mutationFn: updateClubFunds,
    onSuccess: (data) => {
      console.log("Contribution Updated!", data);
      queryClient.invalidateQueries(["club_funds_contributions"]); // to reflect the change instantly
      queryClient.invalidateQueries(["rpc_totals"]);
    },
    onError: (error) => {
      console.error("Updating contribution failed!", error.message);
    },
  });
};
