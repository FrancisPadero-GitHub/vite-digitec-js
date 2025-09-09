// src/hooks/useFetchClubFunds.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

// should also add to fetch the name of the member or something

async function fetchClubFunds() {
  const { data, error } = await supabase
    .from("club_funds_contributions")
    .select("*")
    .order("contribution_id", { descending: true });

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchClubFunds() {
  return useQuery({
    queryKey: ["club_funds_contributions"],
    queryFn: fetchClubFunds,
    // staleTime: 1000 * 60 * 1, // for 2 min before it is going to stale and "refetch" data
    // cacheTime: 1000 * 60 * 5, // keep in cache or keep the data for 5 minutes
  });
}
