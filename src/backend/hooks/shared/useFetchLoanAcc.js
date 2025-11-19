import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

  const queryClient = useQueryClient();
  const { data: loggedInAccountNumber, isLoading: accountLoading } = useFetchAccountNumber();   // fetches logged in account number
  const effectiveAccountNumber = useLoggedInMember ? loggedInAccountNumber : accountNumber;     // if the useLoggedInMember = true

  useEffect(() => {
    if (useLoggedInMember && !effectiveAccountNumber) return;

    const channel = supabase
      .channel(`realtime-loan-accounts-${effectiveAccountNumber ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loan_accounts",
          filter: effectiveAccountNumber ? `account_number=eq.${effectiveAccountNumber}` : undefined,
        },
        (payload) => {
          const key = ["loan_accounts", effectiveAccountNumber, page, limit];

          if (page && limit) {
            queryClient.invalidateQueries(key);
            queryClient.invalidateQueries({ queryKey: ["view_loan_accounts"], exact: false });
            return;
          }

          queryClient.setQueryData(key, (old = { data: [], count: 0 }) => {
            const { eventType, new: newRow, old: oldRow } = payload;
            switch (eventType) {
              case "INSERT":
                if (old.data.some((r) => r.loan_id === newRow.loan_id)) return old;
                return {
                  data: [newRow, ...old.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
                  count: (old.count || 0) + 1,
                };
              case "UPDATE":
                return {
                  data: old.data.map((r) => (r.loan_id === newRow.loan_id ? newRow : r)),
                  count: old.count,
                };
              case "DELETE":
                return {
                  data: old.data.filter((r) => r.loan_id !== (oldRow?.loan_id)),
                  count: Math.max(0, (old.count || 1) - 1),
                };
              default:
                return old;
            }
          });

          // Keep the view in sync — invalidate view cache after updating base
          queryClient.invalidateQueries({ queryKey: ["view_loan_accounts"], exact: false });

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveAccountNumber, page, limit, queryClient, useLoggedInMember]);

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

// realtime handled above

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