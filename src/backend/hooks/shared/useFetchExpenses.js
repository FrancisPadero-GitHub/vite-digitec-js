import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// Pagination version of the fetchCoopContributions for the main table

async function fetchExpenses({ page = 1, limit = 10 }) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await supabase
    .from("club_funds_expenses")
    .select("*", { count: "exact" }) // fetch count for pagination
    .order("transaction_id", { ascending: false })
    .is("deleted_at", null)
    .range(from, to); // specific range for pagination

  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchExpenses(page, limit) {
  return useQuery({
    queryKey: ["club_funds_expenses", page, limit],
    queryFn: () => fetchExpenses({ page, limit }),
    keepPreviousData: true, // smooth pagination
    staleTime: 1000 * 60 * 1,
  });
}
