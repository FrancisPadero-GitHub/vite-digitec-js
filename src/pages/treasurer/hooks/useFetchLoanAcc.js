import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase.js";

/**
 * Fetches loan accounts for a specific member (applicant_id) with pagination
 */
async function fetchCoopLoans(memberId, page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  let query = supabase
    .from("loan_accounts")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("loan_id", { ascending: false })
    .range(from, to);

  // apply applicant_id filter if provided
  if (memberId) {
    query = query.eq("applicant_id", memberId);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);
  return { data, count };
}

// React hook
export function useFetchLoanAcc(memberId = null, page = 1, limit = 10) {
  return useQuery({
    queryFn: () => fetchCoopLoans(memberId, page, limit),
    queryKey: ["loan_accounts", memberId || "all", page, limit],
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}
