import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../supabase";

/**
 * Dynamic Supabase RPC fetcher this version requires account number to be able to find the
 * member's totals
 * used for
 * coop share capital and club funds
 *
 * RPC name for the two in supabase are
 * get_club_funds_total_by_member
 * get_coop_contributions_total_by_member
 *
 * Fetches totals based on the function name and time filters
 *
 */
async function rpcTotal({ queryKey }) {
  const [, { rpcFn, accountNumber, year, month }] = queryKey;

  if (!rpcFn) throw new Error("rpcFn and key is missing or undefined");

  const { data, error } = await supabase.rpc(rpcFn, {
    p_account_number: accountNumber ?? null,
    p_year: year && year !== "all" ? Number(year) : null,
    p_month: month && month !== "all" ? Number(month) : null,
  });

  if (error) throw new Error(error.message);

  // If the RPC returns a numeric aggregate (BIGINT as string), cast to Number
  if (data === null || typeof data === "undefined") return 0;
  return typeof data === "string" || typeof data === "number"
    ? Number(data)
    : data;
}

export function useRpcTotal({ rpcFn, accountNumber, year, month }) {
  return useQuery({
    queryKey: ["rpc_total", { rpcFn, accountNumber, year, month }],
    queryFn: rpcTotal,
    enabled: Boolean(rpcFn),
    staleTime: 1000 * 60, // 1 minute
  });
}
