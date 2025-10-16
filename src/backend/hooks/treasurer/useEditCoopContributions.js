import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const updateCoopContributions = async (formData) => {
  const {
    coop_contri_id,
    member_id = null,
    source = null,
    amount = null,
    category = null,
    contribution_date = null,
    payment_method = null,
    remarks = null,
  } = formData;

  const payload = {
    coop_contri_id,
    member_id,
    source,
    amount,
    category,
    contribution_date,
    payment_method,
    remarks,
  };

  const { data, error } = await supabase
    .from("coop_cbu_contributions")
    .update(payload)
    .eq("coop_contri_id", coop_contri_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message); // Let React Query handle it
  }

  return data; // Will be passed to onSuccess / mutation.data
};

// React Query mutation hook
export const useEditCoopContributions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCoopContributions,
    onSuccess: (data) => {
      console.log(" Coop contribution Updated!", data);
      queryClient.invalidateQueries(["coop_cbu_contributions"]); // to reflect the change instantly
      queryClient.invalidateQueries(["rpc_totals"]);
    },
    onError: (error) => {
      console.error("Updating coop contribution failed!", error.message);
    },
  });
};
