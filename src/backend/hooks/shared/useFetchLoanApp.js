import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

export function useFetchLoanApp({
  page = null,
  limit = null,
  accountNumber = null,
  useLoggedInMember = false,
} = {}) {
  const queryClient = useQueryClient();
  const { data: loggedInAccountNumber, isLoading: accountLoading } =
    useFetchAccountNumber(); // fetches logged in account number
  const effectiveAccountNumber = useLoggedInMember
    ? loggedInAccountNumber
    : accountNumber; // if the useLoggedInMember = true

  useEffect(() => {
    if (useLoggedInMember && !effectiveAccountNumber) return;

    const channel = supabase
      .channel(`realtime-loan-applications-${effectiveAccountNumber ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loan_applications",
          filter: effectiveAccountNumber
            ? `account_number=eq.${effectiveAccountNumber}`
            : undefined,
        },
        (payload) => {
          const key = [
            "loan_applications",
            effectiveAccountNumber,
            page,
            limit,
          ];

          // simple approach for paginated queries: re-fetch to ensure accurate pagination
          if (page && limit) {
            queryClient.invalidateQueries(key);
            // also invalidate view results (pagination may change)
            queryClient.invalidateQueries({
              queryKey: ["view_loan_applications"],
              exact: false,
            });
            return;
          }

          queryClient.setQueryData(key, (old = { data: [], count: 0 }) => {
            const { eventType, new: newRow, old: oldRow } = payload;
            switch (eventType) {
              case "INSERT":
                if (
                  old.data.some(
                    (r) => r.application_id === newRow.application_id
                  )
                )
                  return old;
                return {
                  data: [newRow, ...old.data].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  ),
                  count: (old.count || 0) + 1,
                };
              case "UPDATE":
                return {
                  data: old.data.map((r) =>
                    r.application_id === newRow.application_id ? newRow : r
                  ),
                  count: old.count,
                };
              case "DELETE":
                return {
                  data: old.data.filter(
                    (r) => r.application_id !== oldRow?.application_id
                  ),
                  count: Math.max(0, (old.count || 1) - 1),
                };
              default:
                return old;
            }
          });

          // Keep the view in sync
          queryClient.invalidateQueries({
            queryKey: ["view_loan_applications"],
            exact: false,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveAccountNumber, page, limit, queryClient, useLoggedInMember]);

  return useQuery({
    queryKey: ["loan_applications", effectiveAccountNumber, page, limit],
    queryFn: () =>
      fetchCoopLoansApp({ accountNumber: effectiveAccountNumber, page, limit }),
    enabled: useLoggedInMember
      ? !!loggedInAccountNumber && !accountLoading
      : true,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}

// end realtime

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
