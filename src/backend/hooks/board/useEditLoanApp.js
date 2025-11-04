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
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useEditLoanApp = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog();

  return useMutation({
    mutationFn: updateLoanApp,
    onSuccess: async (data) => {
      console.log("Loan Application Updated!: ", data);
      queryClient.invalidateQueries({queryKey: ["view_loan_applications"], exact: false});
      queryClient.invalidateQueries({ queryKey: ["activity_logs"], exact: false });
      // log activity
      try {
        await logActivity({
          action: `Updated loan application ID ${data.application_id}`,
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
