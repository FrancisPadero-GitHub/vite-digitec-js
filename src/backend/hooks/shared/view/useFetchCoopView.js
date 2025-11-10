import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../supabase.js";
import { useFetchAccountNumber } from "../useFetchAccountNumber.js";

/**
 * Fetches coop share capital contributions from the view `vw_coop_share_capital_contributions`.
 * Includes member info like full_name, avatar_url, and account_number.
 *
 * - If `accountNumber` is provided, filters by that account.
 * - If `useLoggedInMember` is true, uses logged-in user's account number.
 * - If neither, fetches all contributions.
 */

async function fetchCoopContributions({ accountNumber, page, limit }) {
  let query = supabase
    .from("view_coop_share_capital_contributions")
    .select("*", { count: "exact" })
    .order("coop_contri_id", { ascending: false });

  if (accountNumber) {
    query = query.eq("account_number", accountNumber);
  }

  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchCoopView({
  page = null,
  limit = null,
  accountNumber = null,
  useLoggedInMember = false,
} = {}) {
  const { data: loggedInAccountNumber, isLoading: accountLoading } =
    useFetchAccountNumber();

  const effectiveAccountNumber = useLoggedInMember
    ? loggedInAccountNumber
    : accountNumber;

  return useQuery({
    queryKey: [
      "view_coop_share_capital_contributions",
      effectiveAccountNumber,
      page,
      limit,
    ],
    queryFn: () =>
      fetchCoopContributions({
        accountNumber: effectiveAccountNumber,
        page,
        limit,
      }),
    enabled: useLoggedInMember
      ? !!loggedInAccountNumber && !accountLoading
      : true,
    keepPreviousData: true,
    staleTime: 1000 * 60, // 1 minute
  });
}
