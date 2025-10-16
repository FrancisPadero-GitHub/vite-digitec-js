import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * THIS IS AN RPC function that I do its available in supabase functions to view totals
 * A row is not included in the calculation of the total if its column
 * deleted_at has a date value
 * 
 * Also this is dynamic so it fetches what RPC you want in supabase
 * 
 * @param {string} rpcFN - the name of the function inside supabase (not a table)
 * @param {date} year - and the month

 */

async function fetchTotal({ queryKey }) {
  const [_key, { rpcFn, year, month }] = queryKey;
  const { data, error } = await supabase
  .rpc(rpcFn, {
    // p_year: year === "all" ? null : year, // if the p_year receives a "all" value it sets the default to null which fetches unfiltered total
    // p_month: month === "all" ? null : month,
    p_year: year,
    p_month: month,
  });
  if (error) throw new Error(error.message);
  return data;
}

export function useFetchTotal({ rpcFn, year, month }) {
  return useQuery({
    // Temporary queyrKey might change it to something practical later on
    queryKey: ["rpc_totals", { rpcFn, year, month }],
    queryFn: fetchTotal,
    staleTime: 1000 * 60 * 1,
  });
}
