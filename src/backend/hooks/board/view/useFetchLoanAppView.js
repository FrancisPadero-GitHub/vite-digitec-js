import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../../../supabase.js";
import { useFetchAccountNumber } from "../../shared/useFetchAccountNumber.js";

/**
 * Fetches coop loan applications. VIEW TABLE ONLY NOT BASE TABLE
 *
 * If accountNumber is provided (or fetched from auth), returns loans for that member only.
 * If no accountNumber, returns all loan applications.
 */

async function fetchLoanAppView({
  accountNumber,
  page,
  limit,
  ascending = false,
}) {
  let query = supabase
    .from("view_loan_applications")
    .select("*", { count: "exact" })
    .order("application_id", { ascending });

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

export function useFetchLoanAppView({
  page = null,
  limit = null,
  accountNumber = null,
  useLoggedInMember = false,
  ascending = false,
} = {}) {
  const queryClient = useQueryClient();

  const { data: loggedInAccountNumber, isLoading: accountLoading } =
    useFetchAccountNumber(); // fetches logged in account number
  const effectiveAccountNumber = useLoggedInMember
    ? loggedInAccountNumber
    : accountNumber; // if the useLoggedInMember = true

  // Realtime subscription to base table `loan_applications` so the view can be refreshed
  useEffect(() => {
    if (useLoggedInMember && !effectiveAccountNumber) return;

    const channel = supabase
      .channel(
        `realtime-view-loan-applications-${effectiveAccountNumber ?? "all"}`
      )
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
        () => {
          // Invalidate the view query so it refetches the derived data from the DB view
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
  }, [effectiveAccountNumber, queryClient, useLoggedInMember]);

  return useQuery({
    queryKey: [
      "view_loan_applications",
      effectiveAccountNumber,
      page,
      limit,
      ascending,
    ],
    queryFn: () =>
      fetchLoanAppView({
        accountNumber: effectiveAccountNumber,
        page,
        limit,
        ascending,
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
