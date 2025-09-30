import { useQuery } from "@tanstack/react-query";

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
async function fetchCoopLoans(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, error, count } = await supabase
      .from("loan_applications")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("application_id", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    return {data, count};
}

export function useFetchLoanApp(page, limit) {

    

    return useQuery({
      queryFn: () => fetchCoopLoans(page, limit),
      queryKey: ["loan_applications", "all", page, limit],
      keepPreviousData: true, // keeps the pagination smoother the preserving older data on pagination
      staleTime: 1000 * 60 * 1,
    });
}