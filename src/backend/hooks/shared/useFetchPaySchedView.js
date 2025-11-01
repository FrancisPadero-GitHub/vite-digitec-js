
/**
 * Custom React Query hook for fetching loan payment schedule view data
 * Queries a database view that joins member, loan accounts, and loan payment schedules tables
 * @module useFetchPaySchedView
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";

/**
 * Fetches payment schedule data from the view_member_loan_schedules database view
 * This view combines data from 3 tables: members, loan accounts, and loan payment schedules
 * Returns only active loan statuses (excludes closed or paid-off loans)
 */
async function fetchPaySchedView({ page, limit, loanId }) {
  // Initialize query with count option to get total records
  // Orders results by due_date in ascending order (earliest dates first)
  let query = supabase
    .from("view_member_loan_schedules")
    .select("*", { count: "exact" })
    .order("due_date", { ascending: true });

  // Apply loan ID filter if provided
  // This allows fetching schedules for a specific loan account
  if (loanId) {
    query = query.eq("loan_id", loanId);
  }

  // Apply pagination only when both page and limit are provided
  // Calculates the range of records to fetch based on current page
  // Example: page=2, limit=10 → fetches records 10-19
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  // Execute query and handle response
  // Execute query and handle response
  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchPaySchedView({ page = null, limit = null, loanId = null } = {}) {
  return useQuery({
    queryFn: () => fetchPaySchedView({ page, limit, loanId }),
    // Query key includes loanId to cache separately for different loans
    queryKey: ["view_member_loan_schedules", loanId],
    // Keep previous data while fetching new data to prevent UI flickering
    keepPreviousData: true,
    // Data stays fresh for 1 minute before automatic refetch
    staleTime: 1000 * 60 * 1,
  });
}



