import { useQuery } from "@tanstack/react-query";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber";
import { supabase } from "../../supabase";

/** Fetch the member's monthly dues totals
 *
 * RPC that takes member's account number and year and returns the total monthly dues paid for that year so far
 *
 * @param {string} rpcFN - the name of the function inside supabase (not a table)
 * @param {string} queryKey.accountNumber - member's account number
 * @param {string} queryKey.year - year filter
 *
 */

async function fetchMemberMonthlyDues({ queryKey }) {
  const [, { accountNumber, year }] = queryKey;

  const { data, error } = await supabase.rpc(
    "get_monthly_dues_totals_by_member",
    {
      p_account_number: accountNumber,
      p_year: year && year !== "all" ? Number(year) : null,
    }
  );

  if (error) throw new Error(error.message);

  return data?.[0] || { total_amount: 0, latest_period: null };
}

export function useFetchMonthlyDues({ year }) {
  const { data: loggedInAccountNumber, isLoading: accountLoading } =
    useFetchAccountNumber();

  return useQuery({
    queryKey: [
      "monthly_dues_totals",
      { accountNumber: loggedInAccountNumber, year },
    ],
    queryFn: fetchMemberMonthlyDues,
    enabled: !!loggedInAccountNumber && !accountLoading,
    staleTime: 1000 * 60, // 1 minute
  });
}
