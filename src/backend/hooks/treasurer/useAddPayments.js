  import { supabase } from "../../supabase";
  import { useQueryClient, useMutation } from "@tanstack/react-query";
  import { allocateLoanPayment } from "./utils/allocateLoanPayment";
  import { useAddActivityLog } from "../shared/useAddActivityLog";

  // --- Insert function ---
  const insertLoanPayments = async (formData) => {
    const { account_number } = formData;

    // get member info (im giving this a separate db call because i dont want to touch the allocateLoanPayment function HAHAHA)
    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .select("f_name, l_name")
      .eq("account_number", account_number)
      .single();

    if (memberError) {
      throw new Error(`Failed to get member info: ${memberError.message}`);
    }

    const member_name = `${memberData.f_name} ${memberData.l_name}`;


    // the payload is inside this hook
    const allocations = await allocateLoanPayment(supabase, formData);

    const { data, error } = await supabase
      .from("loan_payments")
      .insert(allocations)
      .select()


    if (error) {
      throw new Error(error.message);
    }

  return {
    ...data,
    member_name,
    account_number,
  };
  };

  // --- React hook ---
  export const useAddLoanPayments = () => {

    const queryClient = useQueryClient();
    const { mutateAsync: logActivity } = useAddActivityLog();

    return useMutation({
      mutationFn: insertLoanPayments,
      onSuccess: async (data) => {
        console.log("✅ Loan payment added:", data);
        // Refresh any component using this query
        queryClient.invalidateQueries({queryKey:["view_loan_payments"], exact: false});
        queryClient.invalidateQueries({queryKey: ["activity_logs"], exact: false });
        queryClient.invalidateQueries({queryKey:["loan_payment_schedules"], exact: false});
        queryClient.invalidateQueries({ queryKey: ["view_member_loan_schedules"], exact: false});
        queryClient.invalidateQueries({ queryKey: ["view_loan_accounts"], exact: false });
        queryClient.invalidateQueries({queryKey: ["get_funds_summary"], exact: false});

        // supabase's .insert() always returns an array, even for a single row
        // and we only inserted one payment, so we grab the first (and only) row
        // this is just done for logging purposes 
        const first = data[0];

        try {
          await logActivity({
            action: `Created loan payment for ${data.member_name} (${data.account_number}): ₱${Number(first.total_amount).toLocaleString()} - Loan ID: ${first.loan_id}, Schedule ID: ${first.schedule_id}`,
            type: "CREATE",
          });
        } catch (err) {
          console.warn("Failed to log activity:", err.message);
        }
      },
      onError: (error) => {
        console.error("❌ Add loan payment failed:", error.message);
      },
    });
  };
