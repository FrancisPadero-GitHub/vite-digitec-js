import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber.js";

/**
 * Fetches data from the view_loan_accounts (computed outstanding balance). VIEW ONLY can't do mutations on this table ok?
 *
 * If accountNumber is provided, filters by that accountNumber.
 * If useLoggedInMember is true, uses the logged-in accountNumber.
 * If neither is provided, fetches all records.
 */

async function fetchLoanAccountsView({ accountNumber, page, limit }) {
  let query = supabase
    .from("view_loan_accounts_v2") // ← points to your SQL VIEW
    .select("*", { count: "exact" })
    .order("loan_id", { ascending: false });

  // Apply filters
  if (accountNumber) {
    query = query.eq("account_number", accountNumber);
  }

  // Optional pagination
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
 * Custom React hook to consume view_loan_accounts with TanStack Query.
 */
export function useFetchLoanAccView({
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
    queryKey: ["view_loan_accounts", effectiveAccountNumber, page, limit],
    queryFn: () =>
      fetchLoanAccountsView({
        accountNumber: effectiveAccountNumber,
        page,
        limit,
      }),
    enabled: useLoggedInMember
      ? !!loggedInAccountNumber && !accountLoading
      : true,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1, // 1 minute cache
  });
}

/**
 * USAGE EXAMPLES:
 *
 * // 1. Fetch all
 * const { data, count } = useFetchLoanAccountsView({});
 *
 * // 2. Paginated fetch
 * const { data, count } = useFetchLoanAccountsView({ page: 1, limit: 10 });
 *
 * // 3. Fetch specific accountNumber
 * const { data, count } = useFetchLoanAccountsView({ accountNumber: "ACC123" });
 *
 * // 4. Fetch for logged-in member
 * const { data, count } = useFetchLoanAccountsView({ useLoggedInMember: true });
 */
