import { supabase } from "../../../backend/supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

// Insert function
const insertClubfunds = async (formData) => {
  // Build payload safely with destructuring + null fallback
  const {
    member_id = null,
    amount = null,
    category = null,
    payment_date = null,
    period_covered = null,
    payment_method = null,
    remarks = null,
  } = formData; // if the form data is empty it will fallback to these null values

  const payload = {
    member_id,
    amount,
    category,
    payment_date,
    period_covered,
    payment_method,
    remarks,
  };

  const { data, error } = await supabase
    .from("club_funds_contributions")
    .insert([payload])
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

  return useMutation({
    mutationFn: insertClubfunds,
    onSuccess: (data) => {
      console.log("✅ Contribution added:", data);
      // Refresh the list automatically
      queryClient.invalidateQueries(["club_funds_contributions"]); // to reflect the change instantly
    },
    onError: (error) => {
      console.error("❌ Add club fund contribution failed:", error.message);
    },
  });
};
