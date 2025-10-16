import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * Fetch members with pagination
 * 
 * @param {number} page - Current page number
 * @param {number} limit - Number of records per page
 * @returns { data, count } - Members for that page and total count
 */

async function fetchMembers(page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await supabase
    .from("members")
    .select("*", { count: "exact" }) 
    .order("member_id", { ascending: false })
    .is("deleted_at", null)
    .range(from, to); 

  if (error) throw new Error(error.message);
  return { data, count };
}

export function useMembers(page, limit) {
  return useQuery({
    queryKey: ["members", page, limit], 
    queryFn: () => fetchMembers(page, limit),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1, 
  });
}