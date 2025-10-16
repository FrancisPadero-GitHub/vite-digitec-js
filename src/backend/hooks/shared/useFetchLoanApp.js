import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useMemberId } from "../shared/useFetchMemberId";

/**
 * Fetches coop loan applications.
 * If memberId is provided (or fetched from auth), returns loans for that member only.
 * If no memberId, returns all loan applications.
 *
 * @param {object} options
 * @param {number} [options.page] - pagination page number (optional)
 * @param {number} [options.limit] - number of records per page (optional)
 * @param {string|null} [options.memberId] - specific member ID (optional)
 * @returns { data, count }
 */
async function fetchCoopLoansApp({ memberId, page, limit }) {
  let query = supabase
    .from("loan_applications")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("application_id", { ascending: false });

  // Apply pagination only if page and limit are provided
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  // Filter by memberId if provided
  if (memberId) {
    query = query.eq("applicant_id", memberId);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchLoanApp({
  page,
  limit,
  memberId = null,
  useLoggedInMember = false,
}) {
  const { data: loggedInMemberId, isLoading: memberLoading } = useMemberId();
  const effectiveMemberId = useLoggedInMember ? loggedInMemberId : memberId;

  return useQuery({
    queryKey: [
      "loan_applications",
      effectiveMemberId || "all",
      page || "no-page",
      limit || "no-limit",
    ],
    queryFn: () =>
      fetchCoopLoansApp({
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
 * const { data, count } = useFetchLoanApp({});
 * 
 * fetch with filter
 * const { data, count } = useFetchLoanApp({ page: 1, limit: 20 });
 * 
 * fetch specific member 
 * const { data, count } = useFetchLoanApp({ page: 1, limit: 20, memberId: ID_HERE });
 * 
 * fetch with the current logged in user 
 * const { data, count } = useFetchLoanApp({ page: 1, limit: 20, useLoggedInMember: true });
 */