import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

async function fetchMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("member_id", { ascending: false })
    .is("deleted_at", null)

  if (error) throw new Error(error.message);
  return data;
}

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
    staleTime: 1000 * 60 * 1, // for 2 min before it is going to stale and "refetch" data
    // cacheTime: 1000 * 60 * 5, // keep in cache or keep the data for 5 minutes
  });
}
