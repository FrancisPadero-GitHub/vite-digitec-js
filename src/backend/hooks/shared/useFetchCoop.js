import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber.js";

/**
 * Fetches coop CBU contributions.
 * If accountNumber is provided, filters by that account.
 * If useLoggedInMember is true, uses logged-in user's account_number.
 * If neither, fetches all contributions.
 *
 * @param {object} options
 * @param {number} options.page - pagination page number
 * @param {number} options.limit - number of records per page
 * @param {string|null} [options.accountNumber] - specific account_number (optional)
 * @param {boolean} [options.useLoggedInMember] - whether to automatically use logged-in account_number
 * @returns { data, count, ...queryStates }
 */
async function fetchCoopContributions({ accountNumber, page, limit }) {
  let query = supabase
    .from("coop_cbu_contributions")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("coop_contri_id", { ascending: false });

  if (accountNumber) {
    query = query.eq("account_number", accountNumber);
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

export function useFetchCoop({ page = null, limit = null, accountNumber = null, useLoggedInMember = false} = {}) {
  // This now returns account_number instead of member_id
  const { data: loggedInAccountNumber, isLoading: accountLoading } = useFetchAccountNumber();

  const effectiveAccountNumber = useLoggedInMember
    ? loggedInAccountNumber
    : accountNumber;

  return useQuery({
    queryKey: [
      "coop_cbu_contributions"
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
 * const { data, count } = useFetchCoopContributions({ page: 1, limit: 20, account_number: ID_HERE });
 *
 * fetch with the current logged in user
 * const { data, count } = useFetchCoopContributions({ page: 1, limit: 20, useLoggedInMember: true });
 */
