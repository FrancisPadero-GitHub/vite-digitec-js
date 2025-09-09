import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

async function fetchCoop() {
  const { data, error } = await supabase
    .from("coop_cbu_contributions")
    .select("*")
    .order("coop_contri_id", { ascending: false });

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
