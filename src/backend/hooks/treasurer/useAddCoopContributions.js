import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const insertCoopContributions = async (formData) => {
  const {
    member_id = null,
    source = null,
    amount = null,
    category = null,
    contribution_date = null,
    payment_method = null,
    remarks = null,
  } = formData;

  const payload = { member_id, source, amount, category, contribution_date, payment_method, remarks };

  const { data, error } = await supabase
    .from("coop_cbu_contributions")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useAddCoopContributions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertCoopContributions,
    onSuccess: (data) => {
      console.log("Successfully insert data: ", data);
      queryClient.invalidateQueries(["coop_cbu_contributions"]);
      queryClient.invalidateQueries(["rpc_totals"]);
    },
    onError: (error) => {
      console.error("Something went wrong: ", error.message);
    },
  });
};
