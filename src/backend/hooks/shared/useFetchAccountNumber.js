import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAuth } from "../../context/AuthProvider";

// Searches for a specific column based on the current logged in user 
// Returns account_number

async function fetchAccountNumber(loginId) {
  const { data: member, error } = await supabase
    .from("members")
    .select("account_number")
    .eq("login_id", loginId)
    .single();

  if (error) throw new Error(error.message);
  return member?.account_number || null;
}

export function useFetchAccountNumber() {
  // Get the login_id of the current logged in user
  const { user } = useAuth();
  const loginId = user?.id;

  return useQuery({
    queryFn: () => fetchAccountNumber(loginId),
    queryKey: ["account_number", loginId],
    enabled: !!loginId,
    staleTime: 1000 * 60 * 5,
  });
}
