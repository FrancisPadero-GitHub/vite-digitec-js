import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import calculateLoanAndSchedule from "../../../constants/calculateLoanAndSchedule";

const addLoanAcc = async (formData) => {
  const {
    application_id = null,
    product_id = null,
    account_number = null,
    loan_ref_number = null,
    principal = null,
    amount_req = null,
    total_amount_due = null,
    status = null,
    release_date = null,
    approved_date = null,
    maturity_date = null,
  } = formData;

  const loanPayload = {
    application_id,
    product_id,
    account_number,
    loan_ref_number,
    principal,
    amount_req,
    total_amount_due,
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
      const { schedule } = calculateLoanAndSchedule({
        loanId: loan.loan_id,
        principal: formData.principal,
        interestRate: formData.interest_rate,
        termMonths: formData.loan_term,
        startDate: loan.approved_date,
        generateSchedule: true,
      });

      console.log("Generated schedules after loan insert:", schedule);

      if (schedule.length > 0) {
        // Attach loan_ref_number to each schedule entry
        const scheduleWithRef = schedule.map((item) => ({
          ...item,
          loan_ref_number: formData.loan_ref_number, // use from the created loan
        }));

        const { error: scheduleError } = await supabase
          .from("loan_payment_schedules")
          .insert(scheduleWithRef);

        if (scheduleError) {
          console.error(
            "Failed to insert payment schedules:",
            scheduleError.message
          );
        } else {
          console.log("Successfully inserted payment schedules into DB.");
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
