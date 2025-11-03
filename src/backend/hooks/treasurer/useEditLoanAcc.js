import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import calculateLoanAndScheduleFlatRate from "../../../constants/calculateLoanAndScheduleFlatRate";
import calculateLoanAndScheduleReducing from "../../../constants/calculateLoanAndScheduleReducing";

// Used to release a Loan Accounts

const updateLoanAcc = async (formData) => {
  const {
    loan_id = null,
    release_date = null,
    interest_rate = 0,
    loan_term = 0,
    interest_method = null,
    principal = 0,
    first_due = null,
    loan_ref_number = null,
  } = formData;

  if (!loan_id) {
    throw new Error("Missing loan_id for update.");
  }

  const payload = {
    status: "Active",
    release_date,
    first_due,
  };
  
  const { data, error } = await supabase
    .from("loan_accounts")
    .update(payload)
    .eq("loan_id", loan_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Generate payment schedules on release
  let scheduleData = [];
  if (interest_method === "Flat Rate") {
    const { schedule } = calculateLoanAndScheduleFlatRate({
      loanId: loan_id,
      principal,
      interestRate: interest_rate,
      termMonths: loan_term,
      startDate: first_due,
      generateSchedule: true,
    });
    scheduleData = schedule;
  } else if (interest_method === "Reducing") {
    const { schedule } = calculateLoanAndScheduleReducing({
      loanId: loan_id,
      principal,
      interestRate: interest_rate,
      termMonths: loan_term,
      startDate: first_due,
      generateSchedule: true,
    });
    scheduleData = schedule;
  } else {
    console.warn("Unknown interest type — skipping schedule generation.");
    return data;
  }

  let scheduleInsertResult = null;
  if (scheduleData.length > 0) {
    const scheduleWithRef = scheduleData.map((item) => ({
      ...item,
      loan_ref_number,
    }));

    const { data: scheduleRows, error: scheduleError } = await supabase
      .from("loan_payment_schedules")
      .insert(scheduleWithRef)
      .select();

    scheduleInsertResult = {
      success: !scheduleError,
      error: scheduleError?.message || null,
      rows: scheduleRows || [],
    };
  }

  return {
    loanAccount: data,
    scheduleResult: scheduleInsertResult,
  };
};


export const useEditLoanAcc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLoanAcc,
    onSuccess: (result) => {
      console.log("Loan Released!: ", result.loanAccount);
      if (result.scheduleResult?.success) {
        console.log("Payment schedules inserted:", result.scheduleResult.rows.length);
      } else if (result.scheduleResult?.error) {
        console.warn("Schedule insertion error:", result.scheduleResult.error);
      }
      queryClient.invalidateQueries({queryKey:["loan_accounts"], exact: false});
      queryClient.invalidateQueries({queryKey:["view_loan_accounts_v2"], exact: false});
      queryClient.invalidateQueries({queryKey:["loan_payment_schedules"], exact: false});
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });
    },
    onError: (error) => {
      console.error("Loan Failed Release", error.message);
    },
  });
};
