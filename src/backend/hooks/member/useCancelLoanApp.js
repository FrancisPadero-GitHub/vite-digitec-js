import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

/**
 * Reason that this is a separate hook is to simplify the mutation function
 * since cancelling a loan application only requires updating the status field.
 * and if I use the useEditLoanApp hook, it would require passing all fields again.
 * If I not pass value to it while not using the onSubmit form, it will overwrite existing values with null.
 * 
 * Im still gonna find a way to optimize the passing of formData in payloads in the future.
 */

const cancelLoanApp = async (formData) => {
  const {
    application_id,
    status = null,
  } = formData;

    if (!application_id) {
      throw new Error("Missing application_id in loan_applications for update.");
    }

  const payload = {
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

export const useCancelLoanApp = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog();

  return useMutation({
    mutationFn: cancelLoanApp,
    onSuccess: async (data) => {
      console.log("Loan Application Updated!: ", data);
      queryClient.invalidateQueries({ queryKey: ["loan_applications"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["activity_logs"], exact: false });
      // log activity
      try {
        await logActivity({
          action: `Member updated loan application. Application ID: ${data.application_id}`,
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
