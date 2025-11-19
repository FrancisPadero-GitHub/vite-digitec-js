import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

/**
 * Modify members loan applications (resolve status, adjust amount_req, or delete)
 */

const updateLoanApp = async (formData) => {
  const {
    application_id,
    reviewed_by = null,
    updated_at = null,
    status = null,
  } = formData;

  if (!application_id) {
    throw new Error("Missing application_id for update.");
  }

  const payload = {
    reviewed_by,
    updated_at,
    status,
  };

  const { data, error } = await supabase
    .from("loan_applications")
    .update(payload)
    .eq("application_id", application_id)
    .select(`
      *,
      members!loan_applications_account_number_fkey (f_name,l_name,account_number)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // flatten member data to use in activity log
  const memberData = data.members;
  return {
    ...data,
    member_name: memberData ? `${memberData.f_name} ${memberData.l_name}` : data.account_number
  };
};

export const useEditLoanApp = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog();

  return useMutation({
    mutationFn: updateLoanApp,
    onSuccess: async (data) => {
      console.log("Loan Application Updated!: ", data);
      queryClient.invalidateQueries({ queryKey: ["view_loan_applications"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["pendingLoanApplications"], exact: false }); // for the badge notification
      queryClient.invalidateQueries({ queryKey: ["activity_logs"], exact: false });

      // log activity
      try {
        await logActivity({
          action: `Updated loan application for ${data.member_name} (${data.account_number}): ${data.status}`,
          type: "UPDATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Updating Loan Application failed", error.message);
    },
  });
};
