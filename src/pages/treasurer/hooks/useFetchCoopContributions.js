import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";
/**
 * @params {key} "active" - to fetch only active records
 * @returns {Promise<Array>} - a promise that resolves to an array of active coop contribution records
 */

async function fetchCoop() {
  const { data, error } = await supabase
    .from("coop_cbu_contributions")
    .select("*")
    .order("coop_contri_id", { ascending: false })
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchCoopContributions() {
  return useQuery({
    queryKey: ["coop_cbu_contributions"],
    queryFn: fetchCoop,
    staleTime: 1000 * 60 * 1,
  });
}
