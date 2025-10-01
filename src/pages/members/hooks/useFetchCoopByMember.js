import { useQuery } from "@tanstack/react-query";
import { useMemberId } from "./useFetchMemberId.js";
import { supabase } from "../../../backend/supabase";

/**
 * 
 * @param {*} memberId - id to get contributions for this specific member
 * @param {*} page - the page number to fetch
 * @param {*} limit - the number of records to fetch per page
 * @returns { data, count } - returns the data (member's coop contributions) and total count of records
 */

// Paginated version is set for main table rendering
async function fetchCoopByMember(memberId, page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, error, count } = await supabase
        .from("coop_cbu_contributions")
        .select("*", {count: "exact"})
        .eq("member_id", memberId)
        .is("deleted_at", null)
        .order("coop_contri_id", {ascending: false})
        .range(from, to);

    if (error) throw new Error(error.message);
    return {data, count};
}

export function useFetchCoopByMember(page, limit) {
  // default values are these page = 1, limit = 10 if I don't pass an arguments here

  const { data: memberId, isLoading: memberLoading } = useMemberId(); //fetch memberId

  return useQuery({
    queryFn: () => fetchCoopByMember(memberId, page, limit),
    queryKey: ["coop_cbu_contributions", "member", memberId, page, limit],
    enabled: !!memberId && !memberLoading, //only run if there's memberId, and auth + memberId are done loading
    keepPreviousData: true, // keeps the pagination smoother the preserving older data on pagination
    staleTime: 1000 * 60 * 1,
  });
}