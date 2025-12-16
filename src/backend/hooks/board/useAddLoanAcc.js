import { supabase } from "../../supabase";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber";

// Removed schedule generation imports

const addLoanAcc = async (formData) => {
  const {
    application_id = null,
    product_id = null,
    account_number = null,
    loan_ref_number = null,
    principal = 0,
    total_interest = 0,
    amount_req = 0,
    total_amount_due = 0,
    status = null,
    release_date = null,
    approved_date = null,
    maturity_date = null,
    first_due = null,
    service_fee = 0,
    loan_term_approved = 0,
    decision_note = null,
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
    first_due,
    service_fee,
    loan_term_approved,
    decision_note,
  };

  const { data, error: loanError } = await supabase
    .from("loan_accounts")
    .insert(loanPayload)
    .select()
    .single();

  if (loanError) {
    throw new Error(loanError.message);
  }

  return data;
};

const sendTreasurerNotification = async (loanAccData, senderAccountNumber) => {
  const message = `Loan approved for member ${loanAccData.account_number}. Principal: ₱${loanAccData.principal?.toLocaleString() || "0"} | Loan Ref: ${loanAccData.loan_ref_number || "N/A"}`;

  const { error } = await supabase.rpc("send_notification", {
    p_title: "Pending release for approved loan",
    p_message: message,
    p_type: "loan_release",
    p_target: "role:treasurer",
    p_sender: senderAccountNumber,
  });

  if (error) {
    console.error("Failed to send treasurer notification:", error);
    throw error;
  }
};

const sendMemberNotification = async (loanAccData, senderAccountNumber) => {
  const message = loanAccData.decision_note?.trim()
    ? loanAccData.decision_note.trim()
    : `Your loan application has been approved. Loan Ref: ${loanAccData.loan_ref_number || "N/A"} | Approved Principal: ₱${loanAccData.principal?.toLocaleString() || "0"}`;

  const { error } = await supabase.rpc("send_notification", {
    p_title: "Loan Approved",
    p_message: message,
    p_type: "loan_application_status",
    p_target: loanAccData.account_number,
    p_sender: senderAccountNumber,
  });

  if (error) {
    console.error("Failed to send member notification:", error);
    throw error;
  }
};

export const useAddLoanAcc = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: logActivity } = useAddActivityLog();
  const { data: loggedInAccountNumber } = useFetchAccountNumber();

  return useMutation({
    mutationFn: addLoanAcc,
    onSuccess: async (data) => {
      console.log("✅ Loan Account Added!", data);
      queryClient.invalidateQueries({
        queryKey: ["loan_accounts"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["view_loan_accounts"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["get_funds_summary"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["activity_logs"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingLoanReleases"],
        exact: false,
      }); // for the badge notification
      queryClient.invalidateQueries(["notifications"]);

      // log activity
      try {
        await logActivity({
          action: `Created and approved a member loan: Loan application_id: ${data.application_id}`,
          type: "CREATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }

      // send notifications
      try {
        await sendTreasurerNotification(data, loggedInAccountNumber);
        console.log("✅ Notification sent to treasurer");
      } catch (err) {
        console.warn("Failed to send treasurer notification:", err.message);
      }
      try {
        await sendMemberNotification(data, loggedInAccountNumber);
        console.log("✅ Notification sent to member:", data.account_number);
      } catch (err) {
        console.warn("Failed to send member notification:", err.message);
      }
    },

    onError: (error) => {
      console.error("Adding Loan account failed:", error.message);
    },
  });
};
