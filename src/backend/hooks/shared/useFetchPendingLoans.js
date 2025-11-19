import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../../supabase.js";

// get loan applications with status "Pending"
async function fetchPendingLoanApplications() {
  const { data, error } = await supabase
    .from("view_loan_applications")
    .select("*")
    .in("status", ["Pending", "On Review"]) // included on review as well
    .order("application_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// also get loan accounts with status "Pending Release"
async function fetchPendingLoanReleases() {
  const { data, error } = await supabase
    .from("view_loan_accounts")
    .select("*")
    .eq("status", "Pending Release")
    .order("release_date", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

// hooks to use in components in sidebar
export function useFetchPendingLoanApplications() {
  const queryClient = useQueryClient();
  useEffect(() => {
    // listen to base loan_applications table — view subscribes by invalidation
    const channel = supabase
      .channel("realtime-pending-loan-applications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "loan_applications" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pendingLoanApplications"], exact: true });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient]);
  return useQuery({
    queryKey: ["pendingLoanApplications"],
    queryFn: fetchPendingLoanApplications,
    refetchOnWindowFocus: "always",
  });
}

export function useFetchPendingLoanReleases() {
  const queryClient = useQueryClient();
  useEffect(() => {
    // Realtime on base loan_accounts so the pending releases view updates
    const channel = supabase
      .channel("realtime-pending-loan-releases")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "loan_accounts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pendingLoanReleases"], exact: true });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [queryClient]);
  return useQuery({
    queryKey: ["pendingLoanReleases"],
    queryFn: fetchPendingLoanReleases,
    refetchOnWindowFocus: "always",
  });
}