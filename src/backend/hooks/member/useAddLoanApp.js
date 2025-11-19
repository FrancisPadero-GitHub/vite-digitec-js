import { supabase } from "../../supabase";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber.js";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAddActivityLog } from "../shared/useAddActivityLog.js";

const insertLoanApp = async (formData, accountNumber) => {
  const {
    product_id = null,
    amount = null,
    purpose = null,
    loan_term = null,
  } = formData;

  const payload = {
    product_id,
    amount,
    purpose,
    application_date: new Date().toISOString().split('T')[0], // today is default
    status: "Pending",
    loan_term,
    account_number: accountNumber,
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

const sendNotification = async (loanAppData, senderAccountNumber) => {
  const message = `New loan application submitted by ${senderAccountNumber}. Amount: ₱${loanAppData.amount?.toLocaleString() || '0'} | Purpose: ${loanAppData.purpose || 'N/A'}`;

  const { error } = await supabase.rpc("send_notification", {
    p_title: "New Loan Application",
    p_message: message,
    p_type: "loan_application",
    p_target: "role:board",
    p_sender: senderAccountNumber,
  });

  if (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
};

export const useAddLoanApp = () => {
  const queryClient = useQueryClient();
  const { data: loggedInAccountNumber } = useFetchAccountNumber();
  const { mutateAsync: logActivity } = useAddActivityLog();


  return useMutation({
    mutationFn: (formData) => insertLoanApp(formData, loggedInAccountNumber),
    onSuccess: async (data) => {
      console.log("Loan Application Added!: ", data);
      queryClient.invalidateQueries(["loan_applications", loggedInAccountNumber,]);
      queryClient.invalidateQueries({ queryKey: ["activity_logs"], exact: false });
      queryClient.invalidateQueries(["notifications"]);

      // log activity
      try {
        await logActivity({
          action: `Created loan application (${data.account_number}): ₱${Number(data.amount).toLocaleString()}`,
          type: "CREATE",
        });
      } catch (err) {
        console.warn("Failed to log activity:", err.message);
      }

      // send notification to board members
      try {
        await sendNotification(data, loggedInAccountNumber);
        console.log("✅ Notification sent to board members");
      } catch (err) {
        console.warn("Failed to send notification:", err.message);
      }
    },
    onError: (error) => {
      console.error("Adding Loan Application failed", error.message);
    },
  });
};
