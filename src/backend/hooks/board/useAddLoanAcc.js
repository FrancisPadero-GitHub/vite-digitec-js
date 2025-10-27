import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import calculateLoanAndScheduleFlatRate from "../../../constants/calculateLoanAndScheduleFlatRate";
import calculateLoanAndScheduleReducing from "../../../constants/calculateLoanAndScheduleReducing";

const addLoanAcc = async (formData) => {
  const {
    application_id = null,
    product_id = null,
    account_number = null,
    loan_ref_number = null,
    principal = null,
    total_interest = null,
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
    total_interest,
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

  return { loan: loanData, formData };
};

export const useAddLoanAcc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLoanAcc,

    onSuccess: async ({ loan, formData }) => {
      console.log("✅ Loan Account Added!", loan);

      const {
        interest_rate,
        loan_term,
        interest_method, // should be either "FLAT" or "DIMINISHING"
        principal,
        first_due,
        loan_ref_number,
      } = formData;

      // Choose which calculator to use NOTE THIS TWO HAVE DIFFERENT CALCULATION METHODS
      let scheduleData = [];
      if (interest_method === "Flat Rate") {
        const { schedule } = calculateLoanAndScheduleFlatRate({
          loanId: loan.loan_id,
          principal,
          interestRate: interest_rate,
          termMonths: loan_term,
          startDate: first_due,
          generateSchedule: true,
        });
        scheduleData = schedule;
      } else if (interest_method === "Reducing") {
        const { schedule } = calculateLoanAndScheduleReducing({
          loanId: loan.loan_id,
          principal,
          interestRate: interest_rate,
          termMonths: loan_term,
          startDate: first_due,
          generateSchedule: true,
        });
        scheduleData = schedule;
      } else {
        console.warn("Unknown interest type — skipping schedule generation.");
        return;
      }

      console.log("Generated schedules:", scheduleData);

      if (scheduleData.length > 0) {
        // Attach loan_ref_number to each schedule entry
        const scheduleWithRef = scheduleData.map((item) => ({
          ...item,
          loan_ref_number,
        }));

        const { error: scheduleError } = await supabase
          .from("loan_payment_schedules")
          .insert(scheduleWithRef);

        if (scheduleError) {
          console.error("Failed to insert payment schedules:", scheduleError.message);
        } else {
          console.log("✅ Successfully inserted payment schedules into DB.");
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
