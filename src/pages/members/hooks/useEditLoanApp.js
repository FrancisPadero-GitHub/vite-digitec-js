import { supabase } from "../../../backend/supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const updateLoanApp = async (formData) => {
  const {
    application_id,
    amount = null,
    purpose = null,
    term_months = null,
    application_date = null,
  } = formData;

    if (!application_id) {
      throw new Error("Missing application_id in loan_applications for update.");
    }

  const payload = {
    amount,
    purpose,
    term_months,
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
