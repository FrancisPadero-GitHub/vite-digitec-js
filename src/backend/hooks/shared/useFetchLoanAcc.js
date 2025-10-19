import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber.js";

/**
 * Fetches coop loan accounts.
 * 
 * If accountNumber is provided, filters by that accountNumber.
 * If useLoggedInMember is true, uses logged-in accountNumber ID.
 * If neither, fetches all loan accounts.
 */

async function fetchLoanAccounts({ accountNumber, page, limit }) {
  let query = supabase
    .from("loan_accounts")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("loan_id", { ascending: false });

  // Optionals if values are null return all data no filters
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

export function useFetchLoanAcc({ page = null, limit = null, accountNumber = null, useLoggedInMember = false } = {}) {

  const { data: loggedInAccountNumber, isLoading: accountLoading } = useFetchAccountNumber();   // fetches logged in account number
  const effectiveAccountNumber = useLoggedInMember ? loggedInAccountNumber : accountNumber;     // if the useLoggedInMember = true

  return useQuery({
    queryKey: ["loan_accounts", effectiveAccountNumber, page, limit],
    queryFn: () =>
      fetchLoanAccounts({ accountNumber: effectiveAccountNumber, page, limit }),
    enabled: useLoggedInMember
      ? !!loggedInAccountNumber && !accountLoading
      : true,
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
 * fetch specific accountNumber 
 * const { data, count } = useFetchLoanAcc({ page: 1, limit: 20, accountNumberId: ID_HERE });
 * 
 * fetch with the current logged in user 
 * const { data, count } = useFetchLoanAcc({ page: 1, limit: 20, useLoggedInaccountNumber: true });
 */