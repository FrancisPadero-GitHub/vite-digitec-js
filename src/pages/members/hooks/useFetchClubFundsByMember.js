import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../backend/context/AuthProvider.jsx";
import { useMemberId } from "./useFetchMemberId.js";
import { supabase } from "../../../backend/supabase";

/**
 * 
 * @param {*} memberId - id to get club funds for this specific member
 * @param {*} page - the page number to fetch
 * @param {*} limit - the number of records to fetch per page
 * @returns { data, count } - returns the data (member's club funds) and total count of records
 */

// Paginated version is set for main table rendering
async function fetchClubFundsByMember(memberId, page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, error, count } = await supabase
        .from("club_funds_contributions")
        .select("*", {count: "exact"})
        .eq("member_id", memberId)
        .is("deleted_at", null)
        .order("contribution_id", {ascending: false})
        .range(from, to);

    if (error) throw new Error(error.message);
    return {data, count};
}

export function useFetchClubFundsByMember(page, limit) {
    const { user, loading } = useAuth(); //get current logged in user 
    const { data: memberId, isLoading: memberLoading } = useMemberId(user?.id); //fetch memberId

    return useQuery({
        queryKey: ["club_funds_contributions", "member", memberId, page, limit],
        queryFn: () => fetchClubFundsByMember(memberId, page, limit),
        enabled: !!memberId && !loading && !memberLoading, //only run if there's memberId, and auth + memberId are done loading
        keepPreviousData: true,
        staleTime: 1000 * 60 * 1,
    });
}