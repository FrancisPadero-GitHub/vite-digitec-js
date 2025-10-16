import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useMemberId } from "../shared/useFetchMemberId.js";

/**
 * Fetches coop loan accounts.
 * If memberId is provided, filters by that member.
 * If useLoggedInMember is true, uses logged-in member ID.
 * If neither, fetches all loan accounts.
 *
 * @param {object} options
 * @param {number} [options.page] - pagination page number (optional)
 * @param {number} [options.limit] - number of records per page (optional)
 * @param {string|null} [options.memberId] - specific member ID (optional)
 */
async function fetchLoanAccounts({ memberId, page, limit }) {
  let query = supabase
    .from("loan_accounts")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("loan_id", { ascending: false });

  // Apply pagination only if page and limit are provided
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  // Filter by member ID if available
  if (memberId) {
    query = query.eq("applicant_id", memberId);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchLoanAcc({
  page,
  limit,
  memberId = null,
  useLoggedInMember = false,
}) {
  const { data: loggedInMemberId, isLoading: memberLoading } = useMemberId();
  const effectiveMemberId = useLoggedInMember ? loggedInMemberId : memberId;

  return useQuery({
    queryKey: [
      "loan_accounts",
      effectiveMemberId || "all",
      page || "no-page",
      limit || "no-limit",
    ],
    queryFn: () =>
      fetchLoanAccounts({
        memberId: effectiveMemberId,
        page,
        limit,
      }),
    enabled: useLoggedInMember ? !!loggedInMemberId && !memberLoading : true,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}



/**
 * Fetch everything (no pagination)
 * const { data, count } = useFetchLoanAcc({});
 * 
 * fetch with filter
 * const { data, count } = useFetchLoanAcc({ page: 1, limit: 20 });
 * 
 * fetch specific member 
 * const { data, count } = useFetchLoanAcc({ page: 1, limit: 20, memberId: ID_HERE });
 * 
 * fetch with the current logged in user 
 * const { data, count } = useFetchLoanAcc({ page: 1, limit: 20, useLoggedInMember: true });
 */