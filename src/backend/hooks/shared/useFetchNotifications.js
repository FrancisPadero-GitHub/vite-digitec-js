import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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
  const queryClient = useQueryClient();
  const { data: loggedInAccountNumber, isLoading: accountLoading } = useFetchAccountNumber();
  const effectiveAccountNumber = useLoggedInMember ? loggedInAccountNumber : accountNumber;

  const queryResult = useQuery({
    queryKey: ["notifications", effectiveAccountNumber],
    queryFn: () => fetchNotifications(effectiveAccountNumber),
    enabled: useLoggedInMember
      ? !!loggedInAccountNumber && !accountLoading
      : !!effectiveAccountNumber,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  // Realtime subscription
  useEffect(() => {
    if (!effectiveAccountNumber) return;

    const channel = supabase
      .channel(`realtime-notifications-${effectiveAccountNumber}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${effectiveAccountNumber}`,
        },
        (payload) => {
          queryClient.setQueryData(["notifications", effectiveAccountNumber], (old = []) => {
            const { eventType, new: newRow, old: oldRow } = payload;
            switch (eventType) {
              case 'INSERT':
                // Avoid duplicate if already present
                if (old.some(r => r.id === newRow.id)) return old;
                return [newRow, ...old].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              case 'UPDATE':
                // If the notification was soft-deleted (deleted_at set), remove it from cache
                if (newRow?.deleted_at) {
                  return old.filter(r => r.id !== newRow.id);
                }
                return old.map(r => r.id === newRow.id ? newRow : r);
              case 'DELETE':
                return old.filter(r => r.id !== (oldRow?.id));
              default:
                return old;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveAccountNumber, queryClient]);

  return queryResult;
}
