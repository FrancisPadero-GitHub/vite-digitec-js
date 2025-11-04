import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";

const updateLoanApp = async (formData) => {
  const {
    application_id,
    amount = null,
    purpose = null,
    application_date = null,
    product_id = null,
  } = formData;

    if (!application_id) {
      throw new Error("Missing application_id in loan_applications for update.");
    }

  const payload = {
    product_id,
    amount,
    purpose,
    application_date,
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
