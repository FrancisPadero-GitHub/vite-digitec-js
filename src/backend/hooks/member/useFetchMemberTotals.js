import { useQuery } from "@tanstack/react-query";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber.js";
import { supabase } from "../../supabase.js";

/**
 * RPC total that takes account_number for specific members
 * This only fetches the data for the logged in member
 * @param {string} rpcFN - the name of the function inside supabase (not a table)
 * @param {date} year - and the month

 */

async function fetchMemberTotal({ queryKey }) {
  const [, { rpcFn, accountNumber, year, month }] = queryKey;

  const { data, error } = await supabase.rpc(rpcFn, {
    p_account_number: accountNumber,
    p_year: year && year !== "all" ? Number(year) : null,
    p_month: month && month !== "all" ? Number(month) : null,
  });

  if (error) throw new Error(error.message);

  return data ? Number(data) : 0; // BIGINT comes as string → cast to Number
}

export function useFetchMemberTotal({ rpcFn, year, month }) {
  const { data: loggedInAccountNumber, isLoading: accountLoading } =
    useFetchAccountNumber();
  return useQuery({
    queryKey: [
      "rpc_member_total",
      { rpcFn, accountNumber: loggedInAccountNumber, year, month },
    ],
    queryFn: fetchMemberTotal,
    enabled: !!loggedInAccountNumber && !accountLoading,
    staleTime: 1000 * 60, // 1 minute
  });
}
