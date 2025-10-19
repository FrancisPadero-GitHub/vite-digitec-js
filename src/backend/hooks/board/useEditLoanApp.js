import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

/**
 * Modify members loan applications (resolve status, adjust amount_req, or delete)
 */

const updateLoanApp = async (formData) => {
  const {
    application_id,
    reviewed_by = null,
    status = null,
  } = formData;

  if (!application_id) {
    throw new Error("Missing application_id for update.");
  }

  const payload = {
    reviewed_by,
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
  return useMutation({
    mutationFn: updateLoanApp,
    onSuccess: (data) => {
      console.log("Loan Application Updated!: ", data);
      queryClient.invalidateQueries(["loan_applications", "member"]);
    },
    onError: (error) => {
      console.error("Updating Loan Application failed", error.message);
    },
  });
};
