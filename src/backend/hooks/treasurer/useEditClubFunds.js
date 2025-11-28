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
    payment_method = null,
    remarks = null,
    period_start = null,
    period_end = null,
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
    payment_method,
    remarks,
    period_start,
    period_end,
  };

  // Update row and pull in member info
  const { data, error } = await supabase
    .from("club_funds_contributions")
    .update(payload)
    .eq("contribution_id", contribution_id)
    .select(
      `
      *,
      members!club_funds_contributions_account_number_fkey (f_name,l_name)
    `
    )
    .single();

  if (error) {
    throw new Error(error.message); // Let React Query handle it
  }

  // flatten member data to use in activity log
  const memberData = data.members;
  return {
    ...data,
    member_name: memberData
      ? `${memberData.f_name} ${memberData.l_name}`
      : account_number,
  };
};

// React Query mutation hook
export const useEditClubFunds = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after contribution is edited successfully

  return useMutation({
    mutationFn: updateClubFunds,
    onSuccess: async (data) => {
      console.log("Contribution Updated!", data);
      queryClient.invalidateQueries({
        queryKey: ["view_club_fund_contributions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["monthly_dues_records"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });

      // log activity
      try {
        await logActivity({
          action: `Updated club fund contribution details for ${data.member_name} (${data.account_number}): ₱${Number(data.amount).toLocaleString()} via ${data.payment_method} - ${data.category}`,
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
