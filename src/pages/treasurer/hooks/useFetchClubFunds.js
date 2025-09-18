import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

/**
 * @params {key} "active" - to fetch only active records
 * @returns {Promise<Array>} - a promise that resolves to an array of active club fund records
 */

async function fetchClubFunds() {
  const { data, error } = await supabase
    .from("club_funds_contributions")
    .select("*")
    .order("contribution_id", { ascending: false })
    .is("deleted_at", null); // only fetch active records

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchClubFunds() {
  return useQuery({
    queryKey: ["club_funds_contributions", "active"], // no need to specify the identifier cause it selects all data
    queryFn: fetchClubFunds,
    staleTime: 1000 * 60 * 1, // for 1 min before it is going to stale and "refetch" data
    // cacheTime: 1000 * 60 * 5, // keep in cache or keep the data for 5 minutes
  });
}
