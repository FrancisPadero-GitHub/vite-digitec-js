import { supabase } from "../../../backend/supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const updateLoanApp = async (formData) => {
  const {
    application_id,
    amount_req = null,
    purpose = null,
    term = null,
    application_date = null,
    remarks = null,
  } = formData;

    if (!application_id) {
      throw new Error("Missing application_id in loan_applications for update.");
    }

  const payload = {
    amount_req,
    purpose,
    term,
    application_date,
    remarks,
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
