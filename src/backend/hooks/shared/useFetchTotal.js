import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * Dynamic Supabase RPC fetcher
 * Fetches totals based on the function name and time filters
 */
async function fetchTotal({ queryKey }) {
  const [rpcFn, key, year, month] = queryKey; // ✅ matches new queryKey shape

  if (!rpcFn && !key) throw new Error("rpcFn and key is missing or undefined");

  const { data, error } = await supabase.rpc(rpcFn, {
    p_year: year || null,
    p_month: month || null,
  });

  if (error) throw new Error(error.message);
  return data?.[0];
}

export function useFetchTotal({ rpcFn, key, year, month }) {
  return useQuery({
    queryKey: [rpcFn, key, year, month], // ✅ unique and consistent
    queryFn: fetchTotal,
    enabled: Boolean(rpcFn),
    staleTime: 1000 * 60, // 1 minute
  });
}
