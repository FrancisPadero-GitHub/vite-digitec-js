import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAuth } from "../../context/AuthProvider";

/**
 * Fetches members from the database.
 * If `page` and `limit` are provided, applies pagination.
 * If `login_id` is provided, filters by that user.
 *
 * @param {object} options
 * @param {number} [options.page] - pagination page number (optional)
 * @param {number} [options.limit] - number of records per page (optional)
 * @param {string} [options.login_id] - filter by user login_id (optional)
 * @returns { data, count, ...queryStates }
 */
async function fetchMembers({ page, limit, login_id }) {
  let query = supabase
    .from("members")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("member_id", { ascending: false });

  // Optional: filter by login_id
  if (login_id) {
    query = query.eq("login_id", login_id);
  }

  // Optional: pagination
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data, count };
}

/**
 * Hook: useMembers
 *
 * Examples:
 *  - Fetch all members: useMembers();
 *  - Fetch paginated: useMembers({ page: 1, limit: 10 });
 *  - Fetch a specific member: useMembers({ login_id: user.id });
 */
export function useMembers({
  page = null,
  limit = null,
  login_id = null,
} = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["members", page, limit, login_id],
    queryFn: () => fetchMembers({ page, limit, login_id }),
    keepPreviousData: true,
    enabled: !!user,
    staleTime: 1000 * 60 * 1,
  });
}
