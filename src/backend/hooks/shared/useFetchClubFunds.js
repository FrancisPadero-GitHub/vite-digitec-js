import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useFetchAccountNumber } from "./useFetchAccountNumber.js";

/**
 * Fetches club fund contributions.
 * 
 * If memberId is provided, filters by that member.
 * If useLoggedInMember is true, uses logged-in member ID.
 * If neither, fetches all club fund contributions.
 */

async function fetchClubFunds({ accountNumber, page, limit }) {
  let query = supabase
    .from("club_funds_contributions")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("contribution_id", { ascending: false });

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

export function useFetchClubFunds({ page = null, limit = null, accountNumber = null, useLoggedInMember = false } = {}) {

  const { data: loggedInAccountNumber, isLoading: accountLoading } = useFetchAccountNumber();     // fetches logged in account number
  const effectiveAccountNumber = useLoggedInMember ? loggedInAccountNumber : accountNumber;       // if the useLoggedInMember = true

  return useQuery({
    queryKey: ["club_funds_contributions"],
    queryFn: () => fetchClubFunds({ account_number: effectiveAccountNumber, page, limit}),
    enabled: useLoggedInMember ? !!loggedInAccountNumber && !accountLoading : true,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}

/**
 * Fetch everything (no pagination)
 * const { data, count } = useFetchClubFunds({});
 * 
 * fetch with filter
 * const { data, count } = useFetchClubFunds({ page: 1, limit: 20 });
 * 
 * fetch specific member 
 * const { data, count } = useFetchClubFunds({ page: 1, limit: 20, memberId: ID_HERE });
 * 
 * fetch with the current logged in user 
 * const { data, count } = useFetchClubFunds({ page: 1, limit: 20, useLoggedInMember: true });
 */