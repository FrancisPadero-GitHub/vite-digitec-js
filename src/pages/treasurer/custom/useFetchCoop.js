import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

// Pagination version of the fetchCoopContributions for the main table

async function fetchCoop({ page = 1, limit = 10 }) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await supabase
    .from("coop_cbu_contributions")
    .select("*", { count: "exact" }) // fetch count for pagination
    .order("coop_contri_id", { ascending: false })
    .is("deleted_at", null)
    .range(from, to); // specific range for pagination

  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchCoopContributions(page, limit) {
  return useQuery({
    queryKey: ["coop_cbu_contributions", page, limit],
    queryFn: () => fetchCoop({ page, limit }),
    keepPreviousData: true, // smooth pagination
    staleTime: 1000 * 60 * 1,
  });
}
