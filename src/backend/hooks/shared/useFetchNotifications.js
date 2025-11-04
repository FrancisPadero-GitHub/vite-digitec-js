import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";
import { useFetchAccountNumber } from "../shared/useFetchAccountNumber.js";

async function fetchNotifications(accountNumber) {
  if (!accountNumber) return []; // no account yet, skip fetch

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", accountNumber)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchNotifications({ accountNumber = null, useLoggedInMember = false } = {}) {
  const { data: loggedInAccountNumber, isLoading: accountLoading } = useFetchAccountNumber();
  const effectiveAccountNumber = useLoggedInMember ? loggedInAccountNumber : accountNumber;

  return useQuery({
    queryKey: ["notifications", effectiveAccountNumber],
    queryFn: () => fetchNotifications(effectiveAccountNumber),
    enabled: useLoggedInMember
      ? !!loggedInAccountNumber && !accountLoading
      : !!effectiveAccountNumber,
    refetchInterval: 10000,
    staleTime: 1000 * 60 * 1,
  });
}
