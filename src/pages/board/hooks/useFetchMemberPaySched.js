import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase.js";

// Member Version

// add loanId parameter to the function
async function fetchLoanSchedules(page = 1, limit = 10, loan_id) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  let query = supabase
    .from("loan_payment_schedules")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("due_date", { ascending: true })
    .range(from, to);

  // filter by loan_id if provided
  if (loan_id) query = query.eq("loan_id", loan_id); // conditional

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);
  return { data, count };
}

// add loan_id to the hook params
export function useFetchMemberPaySched(page, limit, loan_id) {
  return useQuery({
    queryFn: () => fetchLoanSchedules(page, limit, loan_id),
    queryKey: ["loan_payment_schedules", loan_id, page, limit], // include loanId in key
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}
