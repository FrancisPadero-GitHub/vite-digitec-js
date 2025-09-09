import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

async function fetchExpenses() {
  const { data, error } = await supabase
    .from("club_funds_expenses")
    .select("*")
    .order("transaction_id", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchExpenses() {
  return useQuery({
    queryKey: ["club_funds_expenses"], // no need to specify the identifier cause it selects all data
    queryFn: fetchExpenses,
    staleTime: 1000 * 60 * 1, // for 1 min before it is going to stale and "refetch" data
    // cacheTime: 1000 * 60 * 5, // keep in cache or keep the data for 5 minutes
  });
}
