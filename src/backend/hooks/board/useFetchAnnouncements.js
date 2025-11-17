import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";

async function fetchAnnouncement() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("type", "general")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchAnnouncement() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchAnnouncement,
    refetchInterval: 10000,
    staleTime: 1000 * 60 * 1,
  });
}
