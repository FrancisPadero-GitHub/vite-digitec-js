import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * Fetches club income records.
 * If page and limit are provided, applies pagination.
 * Otherwise, fetches all income records.
 *
 * @param {object} options
 * @param {number} [options.page] - pagination page number (optional)
 * @param {number} [options.limit] - number of records per page (optional)
 * @returns { data, count, ...queryStates }
 */
async function fetchIncome({ page, limit }) {
  let query = supabase
    .from("club_income")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("income_id", { ascending: false });

  // Only apply pagination if both page and limit are passed
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchIncome({ page = null, limit = null } = {}) {
  return useQuery({
    queryKey: ["club_income", page, limit],
    queryFn: () => fetchIncome({ page, limit }),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Fetch everything (no pagination)
 * const { data, count } = useFetchIncome({});
 *
 * Fetch paginated data
 * const { data, count } = useFetchIncome({ page: 1, limit: 20 });
 */
