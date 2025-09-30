import { supabase } from "../../../backend/supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const insertExpenses = async (formData) => {
  const {
    amount = null,
    title = null,
    category = null,
    description = null,
    transaction_date = null,
  } = formData;

  const payload = {
    amount,
    title,
    category,
    description,
    transaction_date,
  };

  const { data, error } = await supabase
    .from("club_funds_expenses")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useAddExpenses = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: insertExpenses,
    onSuccess: (data) => {
      console.log("Expenses Added!: ", data);
      queryClient.invalidateQueries(["club_funds_expenses"]);
      queryClient.invalidateQueries(["rpc_totals"]);
    },
    onError: (error) => {
      console.error("Adding expenses failed", error.message);
    },
  });
};
