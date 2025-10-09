import { useQuery } from "@tanstack/react-query";
import { useMemberId } from "./useFetchMemberId.js";
import { supabase } from "../../../backend/supabase.js";

/**
 * Fetches all member loan application
 * 
 * @param {*} memberId - id to get contributions for this specific member
 * @param {*} page - the page number to fetch
 * @param {*} limit - the number of records to fetch per page
 * @returns { data, count } - returns the data (member's coop contributions) and total count of records
 */

// Paginated version is set for main table rendering
async function fetchCoopLoans(memberId, page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await supabase
    .from("loan_accounts")
    .select("*", { count: "exact" })
    .eq("applicant_id", memberId)
    .is("deleted_at", null)
    .order("loan_id", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchLoanAcc(page, limit) {
  const { data: memberId, isLoading: memberLoading } = useMemberId(); //fetch memberId
  return useQuery({
    queryFn: () => fetchCoopLoans(memberId, page, limit),
    queryKey: ["loan_accounts", "member", memberId, page, limit],
    enabled: !!memberId && !memberLoading,
    keepPreviousData: true, // keeps the pagination smoother the preserving older data on pagination
    staleTime: 1000 * 60 * 1,
  });
}