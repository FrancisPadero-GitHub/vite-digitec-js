import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * Fetches members from the database.
 * If page and limit are provided, applies pagination.
 * If not, fetches all members.
 *
 * @param {object} options
 * @param {number} [options.page] - pagination page number (optional)
 * @param {number} [options.limit] - number of records per page (optional)
 * @returns { data, count, ...queryStates }
 */
async function fetchMembers({ page, limit }) {
  let query = supabase
    .from("members")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("member_id", { ascending: false });

  // Apply pagination only if both page and limit are provided
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}

export function useMembers({ page = null, limit = null } = {}) {
  return useQuery({
    queryKey: ["members", page, limit],
    queryFn: () => fetchMembers({ page, limit }),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Fetch everything (no pagination)
 * const { data, count } = useMembers({});
 *
 * Fetch paginated members
 * const { data, count } = useMembers({ page: 1, limit: 20 });
 */
