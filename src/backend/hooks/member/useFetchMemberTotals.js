import { useQuery } from "@tanstack/react-query";
import { useMemberId } from "../shared/useFetchMemberId";
import { supabase } from "../../supabase.js";

/**
 * RPC total that takes member_id for specific members
 * 
 * @param {string} rpcFN - the name of the function inside supabase (not a table)
 * @param {date} year - and the month

 */

async function fetchMemberTotal({ queryKey }) {
  const [_key, { rpcFn, memberId, year, month }] = queryKey;

  const { data, error } = await supabase.rpc(rpcFn, {
    p_member_id: memberId,
    p_year: year && year !== "all" ? Number(year) : null,
    p_month: month && month !== "all" ? Number(month) : null,
  });

  if (error) throw new Error(error.message);

  return data ? Number(data) : 0; // BIGINT comes as string → cast to Number
}

export function useFetchMemberTotal({ rpcFn, year, month }) {
  const { data: memberId, isLoading: memberLoading } = useMemberId();
 
  return useQuery({
    queryFn: fetchMemberTotal,
    queryKey: [
      "rpc_member_total",
      { rpcFn, memberId, year, month }, // ✅ pass object not string
    ],
    enabled: !!memberId && !memberLoading,
    staleTime: 1000 * 60, // 1 minute
  });
}
