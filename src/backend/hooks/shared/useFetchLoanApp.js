import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber.js";

/**
 * Fetches coop loan applications.
 * 
 * If accountNumber is provided (or fetched from auth), returns loans for that member only.
 * If no accountNumber, returns all loan applications.
 */

async function fetchCoopLoansApp({ accountNumber, page, limit }) {
  let query = supabase
    .from("loan_applications")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("application_id", { ascending: false });

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

export function useFetchLoanApp({ page = null, limit = null, accountNumber = null, useLoggedInMember = false } = {}) {

  const { data: loggedInAccountNumber, isLoading: accountLoading } = useFetchAccountNumber();     // fetches logged in account number
  const effectiveAccountNumber = useLoggedInMember ? loggedInAccountNumber : accountNumber;       // if the useLoggedInMember = true

  return useQuery({
    queryKey: ["loan_applications"],
    queryFn: () => fetchCoopLoansApp({ accountNumber: effectiveAccountNumber, page, limit }),
    enabled: useLoggedInMember ? !!loggedInAccountNumber && !accountLoading : true,
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
 * const { data, count } = useFetchLoanApp({ page: 1, limit: 20, accountNumber: ID_HERE });
 * 
 * fetch with the current logged in user 
 * const { data, count } = useFetchLoanApp({ page: 1, limit: 20, useLoggedInMember: true });
 */