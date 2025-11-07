import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

// Insert function
const insertClubfunds = async (formData) => {

  const {
    account_number = null,
    amount = 0,
    category = null,
    payment_date = null,
    payment_method = null,
    remarks = null,
  } = formData; // if the form data is empty it will fallback to these null values

  const payload = {
    account_number,
    amount,
    category,
    payment_date,
    payment_method,
    remarks,
  };

  const { data, error } = await supabase
    .from("club_funds_contributions")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message); // Let React Query handle it
  }

  return data; // Will be passed to onSuccess / mutation.data
};

// React Query mutation hook
export const useAddClubFunds = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after contribution is added successfully

  return useMutation({
    mutationFn: insertClubfunds,
    onSuccess: async (data) => {
      console.log("✅ Contribution added:", data);

      queryClient.invalidateQueries({
        queryKey: ["club_funds_contributions"],
        exact: false
      });

      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });

      // log activity
      try {
        await logActivity({
          action: `Created club fund contribution of ₱${data.amount} (${data.category}) for account ${data.account_number}`,
          type: "CREATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("❌ Add club fund contribution failed:", error.message);
    },
  });
};
