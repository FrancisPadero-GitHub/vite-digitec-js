import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["pendingLoanApplications"],
    queryFn: fetchPendingLoanApplications,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useFetchPendingLoanReleases() {
  return useQuery({
    queryKey: ["pendingLoanReleases"],
    queryFn: fetchPendingLoanReleases,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}