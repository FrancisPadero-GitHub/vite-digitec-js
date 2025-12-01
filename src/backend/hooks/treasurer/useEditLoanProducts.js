import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAddActivityLog } from "../shared/useAddActivityLog";

const updateLoanProducts = async (formData) => {
  const {
    product_id = null,
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

  if (!product_id) {
    throw new Error("Missing product_id for update.");
  }

  const payload = {
    product_id,
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

  if (!product_id) {
    throw new Error("Missing product_id for update.");
  }

  const { data, error } = await supabase
    .from("loan_products")
    .update(payload)
    .eq("product_id", product_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// React Query mutation hook
export const useEditLoanProducts = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog();

  return useMutation({
    mutationFn: updateLoanProducts,
    onSuccess: async (data) => {
      console.log("Loan Product Updated!", data);
      queryClient.invalidateQueries({
        queryKey: ["loan_products"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["activity_logs"],
        exact: false,
      });

      // log activity
      try {
        await logActivity({
          action: `Updated loan product details ID ${data.product_id}`,
          type: "UPDATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }
    },
    onError: (error) => {
      console.error("Updating contribution failed!", error.message);
    },
  });
};
