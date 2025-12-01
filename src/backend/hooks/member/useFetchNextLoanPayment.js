import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber";

/** Fetch the next loan payment for the logged-in member
 *
 * RPC that takes memmber's account number and returns the next loan paymen due
 *
 * @param {string} rpcFN - the name of the function inside supabase (not a table)
 * @param {string} queryKey.accountNumber - member's account number
 *
 */

async function fetchNextPayment({ queryKey }) {
  const [, { accountNumber }] = queryKey;

  const { data, error } = await supabase.rpc(
    "get_next_loan_payment_by_member",
    { p_account_number: accountNumber }
  );

  if (error) throw new Error(error.message);

  return data?.[0] || null;
}

export function useFetchNextLoanPayment() {
  const { data: loggedInAccountNumber, isLoading: accountLoading } =
    useFetchAccountNumber();

  return useQuery({
    queryKey: ["next_loan_payment", { accountNumber: loggedInAccountNumber }],
    queryFn: fetchNextPayment,
    enabled: !!loggedInAccountNumber && !accountLoading,
    staleTime: 1000 * 60, // 1 minute
  });
}
