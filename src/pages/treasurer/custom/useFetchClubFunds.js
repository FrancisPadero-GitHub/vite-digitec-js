import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

/**
 * @params {key} "active" - to fetch only active records
 * @returns {Promise<Array>} - a promise that resolves to an array of active club fund records
 */

async function fetchClubFunds({ page = 1, limit = 10 }) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await supabase
    .from("club_funds_contributions")
    .select("*",{ count: "exact" }) // fetch count for pagination
    .order("contribution_id", { ascending: false })
    .is("deleted_at", null) // only fetch active records
    .range(from, to); // specific range for pagination

  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchClubFunds(page, limit) {
  return useQuery({
    queryKey: ["club_funds_contributions", "active", page, limit], // no need to specify the identifier cause it selects all data
    queryFn: () => fetchClubFunds({ page, limit }),
    keepPreviousData: true, // smooth pagination
    staleTime: 1000 * 60 * 1, // for 1 min before it is going to stale and "refetch" data
    // cacheTime: 1000 * 60 * 5, // keep in cache or keep the data for 5 minutes
  });
}
