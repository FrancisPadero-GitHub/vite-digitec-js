import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/** 
 * Fetch individual monthly dues records (for building payment grids/tables)
 * 
 * @param {string|null} accountNumber - specific member's account number, or null for all members
 * @param {number|string|null} year - year filter (null/"all" for all years)
 * 
 * @returns Query result with array of monthly dues records
 */

async function fetchMonthlyDuesRecords({ accountNumber, year }) {
  const { data, error } = await supabase.rpc("get_monthly_dues_records", {
    p_account_number: accountNumber || null,
    p_year: year && year !== "all" ? Number(year) : null,
  });

  if (error) throw new Error(error.message);
  return data || [];
}

export function useFetchMonthlyDuesRecords({ year = null, accountNumber = null } = {}) {
  return useQuery({
    queryKey: ["monthly_dues_records", { accountNumber, year }],
    queryFn: () => fetchMonthlyDuesRecords({ accountNumber, year }),
    staleTime: 1000 * 60 // 1 minute
  });
}