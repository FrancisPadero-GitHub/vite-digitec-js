import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

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
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after expense is added successfully

  return useMutation({
    mutationFn: insertExpenses,
    onSuccess: async (data) => {
      console.log("Expenses Added!: ", data);
      queryClient.invalidateQueries(["club_funds_expenses"]);
      queryClient.invalidateQueries(["rpc_totals"]);

      // log activity
      try {
        await logActivity({
          action: `Created club expense of ₱${data.amount} for ${data.category}`,
          type: "CREATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Adding expenses failed", error.message);
    },
  });
};
