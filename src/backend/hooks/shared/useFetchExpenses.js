import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * Fetches club funds expenses.
 * If page and limit are provided, applies pagination.
 * Otherwise, fetches all expenses.
 *
 * @param {object} options
 * @param {number} [options.page] - pagination page number (optional)
 * @param {number} [options.limit] - number of records per page (optional)
 * @returns { data, count, ...queryStates }
 */
async function fetchExpenses({ page, limit }) {
  let query = supabase
    .from("club_funds_expenses")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("transaction_id", { ascending: false });

  // Optionals if values are null return all data no filters
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchExpenses({ page = null, limit = null } = {}) {
  return useQuery({
    queryKey: ["club_funds_expenses", page, limit],
    queryFn: () => fetchExpenses({ page, limit }),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Fetch everything (no pagination)
 * const { data, count } = useFetchExpenses({});
 *
 * Fetch paginated data
 * const { data, count } = useFetchExpenses({ page: 1, limit: 20 });
 */
