import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useMemberId } from "../shared/useFetchMemberId";
/**
 * Fetches coop CBU contributions.
 * If memberId is provided, filters by that member.
 * If useLoggedInMember is true, uses logged-in member ID.
 * If neither, fetches all contributions.
 *
 * @param {object} options
 * @param {number} options.page - pagination page number
 * @param {number} options.limit - number of records per page
 * @param {string|null} [options.memberId] - specific member ID (optional)
 * @param {boolean} [options.useLoggedInMember] - whether to automatically use logged-in member ID
 * @returns { data, count, ...queryStates }
 */

async function fetchCoopContributions({ memberId, page, limit }) {
  let query = supabase
    .from("coop_cbu_contributions")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("coop_contri_id", { ascending: false });

  if (memberId) {
    query = query.eq("member_id", memberId);
  }

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


export function useFetchCoop({
  page = 1,
  limit = 10,
  memberId = null,
  useLoggedInMember = false,
}) {
  const { data: loggedInMemberId, isLoading: memberLoading } = useMemberId();
  const effectiveMemberId = useLoggedInMember ? loggedInMemberId : memberId;

  return useQuery({
    queryKey: [
      "coop_cbu_contributions",
      effectiveMemberId || "all",
      page,
      limit,
    ],
    queryFn: () =>
      fetchCoopContributions({ memberId: effectiveMemberId, page, limit }),
    enabled: useLoggedInMember ? !!loggedInMemberId && !memberLoading : true,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Fetch everything (no pagination)
 * const { data, count } = useFetchCoopContributions({});
 * 
 * fetch with filter
 * const { data, count } = useFetchCoopContributions({ page: 1, limit: 20 });
 * 
 * fetch specific member 
 * const { data, count } = useFetchCoopContributions({ page: 1, limit: 20, memberId: ID_HERE });
 * 
 * fetch with the current logged in user 
 * const { data, count } = useFetchCoopContributions({ page: 1, limit: 20, useLoggedInMember: true });
 */