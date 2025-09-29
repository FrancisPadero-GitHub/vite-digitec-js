import { supabase } from "../../../backend/supabase";
import { useMemberId } from "./useFetchMemberId.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const insertLoanApp = async (formData, memberId) => {
  const {
    amount_req = null,
    purpose = null,
    term = null,
    application_date = null,
    remarks = null,
  } = formData;

  const payload = {
    amount_req,
    purpose,
    term,
    application_date,
    remarks,
    member_id: memberId, // ✅ attach member_id here
  };

  const { data, error } = await supabase
    .from("loan_applications")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useAddLoanApp = () => {
  const queryClient = useQueryClient();
  const { data: memberId } = useMemberId();

  return useMutation({
    mutationFn: (formData) => insertLoanApp(formData, memberId), // ✅ pass it in
    onSuccess: (data) => {
      console.log("Loan Application Added!: ", data);
      queryClient.invalidateQueries(["loan_applications", "member"]);
    },
    onError: (error) => {
      console.error("Adding Loan Application failed", error.message);
    },
  });
};
