import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAddActivityLog } from "../shared/useAddActivityLog";

const addLoanProduct = async (formData) => {
  const {
    name = null,
    interest_method = null,
    interest_rate = null,
    penalty_rate = null,
    service_fee = null,
    repayment_freq = null,
    min_amount = null,
    max_amount = null,
    min_term_months = null,
    max_term_months = null,
  } = formData;

  const payload = {
    name,
    interest_method,
    interest_rate,
    penalty_rate,
    service_fee,
    repayment_freq,
    min_amount,
    max_amount,
    min_term_months,
    max_term_months,
  };

  const { data, error } = await supabase
    .from("loan_products")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useAddLoanProduct = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog(); // log activity after contribution is edited successfully

  return useMutation({
    mutationFn: addLoanProduct,
    onSuccess: async (data) => {
      console.log("Loan Product Added!: ", data);
      queryClient.invalidateQueries({ queryKey: ["loan_products"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["activity_logs"], exact: false });
      try {
        await logActivity({
          action: `Added loan product ${data?.name}`,
          type: "CREATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Adding loan product failed", error.message);
    },
  });
};
