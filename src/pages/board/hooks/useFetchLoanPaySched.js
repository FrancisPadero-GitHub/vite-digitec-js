import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase.js";

// All version

// Paginated version is set for main table rendering
async function fetchLoanSchedules(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;

    const { data, error, count } = await supabase
      .from("loan_payment_schedules")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("due_date", { ascending: true })
      .range(from, to);

    if (error) throw new Error(error.message);
    return {data, count};
}

export function useFetchLoanSchedules(page, limit) {

    return useQuery({
      queryFn: () => fetchLoanSchedules(page, limit),
      queryKey: ["loan_payment_schedules", "all", page, limit],
      keepPreviousData: true, // keeps the pagination smoother the preserving older data on pagination
      staleTime: 1000 * 60 * 1,
    });
}