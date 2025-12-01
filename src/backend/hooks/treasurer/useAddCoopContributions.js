import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

const insertCoopContributions = async (formData) => {
  const {
    account_number = null,
    source = null,
    amount = 0,
    category = null,
    contribution_date = null,
    payment_method = null,
    remarks = null,
  } = formData;

  const payload = {
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
    .insert(payload)
    .select(
      `
      *,
      members!coop_cbu_contributions_account_number_fkey (f_name, l_name)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const memberData = data.members;
  return {
    ...data,
    member_name: memberData
      ? `${memberData.f_name} ${memberData.l_name}`
      : "N/A",
  };
};

export const useAddCoopContributions = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after contribution is added successfully

  return useMutation({
    mutationFn: insertCoopContributions,
    onSuccess: async (data) => {
      console.log("Successfully insert data: ", data);
      queryClient.invalidateQueries({
        queryKey: ["view_coop_share_capital_contributions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });

      // log activity
      try {
        await logActivity({
          action: `Created coop share capital contribution for ${data.member_name} (${data.account_number}): ₱${Number(data.amount).toLocaleString()} - ${data.category}`,
          type: "CREATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Something went wrong: ", error.message);
    },
  });
};
