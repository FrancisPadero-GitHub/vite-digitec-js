import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useFetchAccountNumber } from "./useFetchAccountNumber.js";

/**
 * Fetches loan payments with optional filters and pagination.
 */
async function fetchLoanPayments({
  page = null,
  limit = null,
  accountNumber = null,
  loanRefNumber = null,
}) {
  let query = supabase
    .from("loan_payments")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("payment_id", { ascending: false });

  // Optionals if values are null return all data no filters
  if (accountNumber) query = query.eq("account_number", accountNumber);
  if (loanRefNumber) query = query.eq("loan_ref_number", loanRefNumber);

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
 * React Query hook for fetching payments.
 * Can optionally use the logged-in member’s account number.
 */
export function useFetchLoanPayments({
  page = null,
  limit = null,
  accountNumber = null,
  loanRefNumber = null,
  useLoggedInMember = false,
} = {}) {
  const { data: loggedInAccountNumber, isLoading: accountLoading } =
    useFetchAccountNumber();
  const effectiveAccountNumber = useLoggedInMember
    ? loggedInAccountNumber
    : accountNumber;

  return useQuery({
    queryKey: [
      "loan_payments",
      effectiveAccountNumber,
      loanRefNumber,
      page,
      limit,
    ],
    queryFn: () =>
      fetchLoanPayments({
        page,
        limit,
        accountNumber: effectiveAccountNumber,
        loanRefNumber,
      }),
    enabled: useLoggedInMember
      ? !!loggedInAccountNumber && !accountLoading
      : true,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * React Query hook for fetching loan payments.
 *
 * Usage examples:
 *
 * // Fetch all loan payments (no filters)
 * const { data, count } = useFetchLoanPayments({});
 *
 * // Paginated fetch
 * const { data, count } = useFetchLoanPayments({ page: 1, limit: 20 });
 *
 * // Filter by account number
 * const { data, count } = useFetchLoanPayments({ accountNumber: "ACC-00123" });
 *
 * // Filter by loan reference number
 * const { data, count } = useFetchLoanPayments({ loanRefNumber: "LN-2024-001" });
 */
