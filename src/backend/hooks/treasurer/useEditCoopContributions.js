import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

const updateCoopContributions = async (formData) => {
  const {
    coop_contri_id,
    account_number = null,
    source = null,
    amount = 0,
    category = null,
    contribution_date = null,
    payment_method = null,
    remarks = null,
  } = formData;

  if (!coop_contri_id) {
    throw new Error("Missing coop_contri_id for update.");
  }
  const payload = {
    coop_contri_id,
    account_number,
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
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after contribution is edited successfully

  return useMutation({
    mutationFn: updateCoopContributions,
    onSuccess: async (data) => {
      console.log(" Coop contribution Updated!", data);
      queryClient.invalidateQueries({queryKey:["coop_cbu_contributions"], exact: false}); // to reflect the change instantly
      queryClient.invalidateQueries({queryKey:["rpc_totals"], exact: false});

      // log activity
      try {
        await logActivity({
          action: `Updated coop share capital contribution details for account ${data.account_number}`,
          type: "UPDATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Updating coop contribution failed!", error.message);
    },
  });
};
