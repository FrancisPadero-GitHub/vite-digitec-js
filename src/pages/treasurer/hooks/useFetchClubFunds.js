import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

async function fetchClubFunds() {
  const { data, error } = await supabase
    .from("club_funds_contributions")
    .select("*")
    .order("contribution_id", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchClubFunds() {
  return useQuery({
    queryKey: ["club_funds_contributions"], // no need to specify the identifier cause it selects all data
    queryFn: fetchClubFunds,
    staleTime: 1000 * 60 * 1, // for 1 min before it is going to stale and "refetch" data
    // cacheTime: 1000 * 60 * 5, // keep in cache or keep the data for 5 minutes
  });
}
