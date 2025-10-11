import { supabase } from "../../../backend/supabase";
import { useMemberId } from "./useFetchMemberId.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const insertLoanApp = async (formData, memberId) => {
const {
  product_id = null,
  amount = null,
  purpose = null,
  application_date = null,
} = formData;


// Construct final payload
const payload = {
  product_id: product_id ? Number(product_id) : null,
  amount: amount ? Number(amount) : null, // also normalize if needed
  purpose,
  application_date,
  status: "Pending", // default
  applicant_id: memberId,
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
