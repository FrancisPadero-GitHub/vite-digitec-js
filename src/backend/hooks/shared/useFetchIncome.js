import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";
/**
 * @params {key} "active" - to fetch only active records
 * @returns {Promise<Array>} - a promise that resolves to an array of active coop contribution records
 */

async function fetchIncome() {
  const { data, error } = await supabase
    .from("club_income")
    .select("*")
    .order("income_id", { ascending: false })
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchIncome() {
  return useQuery({
    queryKey: ["club_income"], // Experimental might remove later
    queryFn: fetchIncome,
    staleTime: 1000 * 60 * 1,
  });
}
