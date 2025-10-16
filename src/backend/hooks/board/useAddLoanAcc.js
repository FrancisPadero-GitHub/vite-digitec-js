import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import generateSchedule from "../../../constants/GenPaymentSchedule";

const addLoanAcc = async (formData) => {
  const {
    application_id = null,
    applicant_id = null,
    product_id = null,
    account_number = null,
    principal = null,
    outstanding_balance = null,
    status = null,
    release_date = null,
    approved_date = null,
    maturity_date = null,
  } = formData;

  const loanPayload = {
    application_id,
    applicant_id,
    product_id,
    account_number,
    principal,
    outstanding_balance,
    status,
    release_date,
    approved_date,
    maturity_date,
  };

  const { data: loanData, error: loanError } = await supabase
    .from("loan_accounts")
    .insert(loanPayload)
    .select()
    .single();

  if (loanError) {
    throw new Error(loanError.message);
  }

  // Only return the loanData. Schedules will be generated in onSuccess
  return { loan: loanData, formData };
};

export const useAddLoanAcc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLoanAcc,
    /**
     * After it successfully insert the record
     * it will generate the payment schedules for it respectively
     * 
     * 
     */
    onSuccess: async ({ loan, formData }) => {

      // console.log("Form data", formData)

      // Generate payment schedule after loan is successfully created
      const schedules = generateSchedule({
        loanId: loan.loan_id,
        principal: formData.principal,
        interestRate: formData.interest_rate,
        termMonths: formData.loan_term,
        startDate: loan.approved_date,
      });

      // console.log("Generated schedules after loan insert:", schedules);

      // to make sure that schedules does indeed generate schedules otherwise return an error
      
      if (schedules.length > 0) {
        const { error: scheduleError } = await supabase
          .from("loan_payment_schedules")
          .insert(schedules);

        if (scheduleError) {
          console.error(
            "Failed to insert payment schedules:",
            scheduleError.message
          );
        }
      }

      queryClient.invalidateQueries(["loan_accounts"]);
      queryClient.invalidateQueries(["loan_payment_schedules"]);
    },

    onError: (error) => {
      console.error("Adding Loan account failed:", error.message);
    },
  });
};
