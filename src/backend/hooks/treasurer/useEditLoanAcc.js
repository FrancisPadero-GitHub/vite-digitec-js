import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import calcLoanSchedFlat from "../../../constants/calcLoanSchedFlat";
import calcLoanSchedDiminishing from "../../../constants/calcLoanSchedDiminishing";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber";

/**
 * This is used to update loan account for release and generate payment schedules
 * This is called when releasing a loan in treasurer
 * 
 */

const updateLoanAcc = async (formData) => {
  const {
    loan_id = null,
    release_date = null,
    interest_rate = 0,
    loan_term = 0,
    interest_method = null,
    net_principal = 0,
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
  if (interest_method === "flat") {
    const { schedule } = calcLoanSchedFlat({
      loanId: loan_id,
      principal: net_principal,
      interestRate: interest_rate,
      termMonths: loan_term,
      startDate: first_due,
      generateSchedule: true,
    });
    scheduleData = schedule;
  } else if (interest_method === "diminishing") {
    const { schedule } = calcLoanSchedDiminishing({
      loanId: loan_id,
      principal: net_principal,
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

const sendNotification = async (loanAccData, senderAccountNumber) => {
  const message = `Your loan has been released! Amount: ₱${loanAccData.principal?.toLocaleString() || '0'} | Loan Ref: ${loanAccData.loan_ref_number || 'N/A'}. Check your loan account for details.`;

  const { error } = await supabase.rpc("send_notification", {
    p_message: message,
    p_type: "loan_application_status",
    p_target: loanAccData.account_number,
    p_sender: senderAccountNumber,
  });

  if (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
};

export const useEditLoanAcc = () => {
  const queryClient = useQueryClient();
  const { data: loggedInAccountNumber } = useFetchAccountNumber();

  return useMutation({
    mutationFn: updateLoanAcc,
    onSuccess: async (result) => {
      console.log("Loan Released!: ", result.loanAccount);
      if (result.scheduleResult?.success) {
        console.log("Payment schedules inserted:", result.scheduleResult.rows.length);
      } else if (result.scheduleResult?.error) {
        console.warn("Schedule insertion error:", result.scheduleResult.error);
      }
      queryClient.invalidateQueries({ queryKey: ["loan_accounts"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["view_loan_accounts"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["loan_payment_schedules"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });
      queryClient.invalidateQueries(["notifications"]);

      // send notification to the specific member
      try {
        await sendNotification(result.loanAccount, loggedInAccountNumber);
        console.log("✅ Notification sent to member:", result.loanAccount.account_number);
      } catch (err) {
        console.warn("Failed to send notification:", err.message);
      }
    },
    onError: (error) => {
      console.error("Loan Failed Release", error.message);
    },
  });
};
