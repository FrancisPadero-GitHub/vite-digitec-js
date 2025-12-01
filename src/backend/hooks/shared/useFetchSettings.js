import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

const fetchSettings = async () => {
  const { data, error } = await supabase.from("settings").select("*").single();
  if (error) throw new Error(error.message);
  return data;
};

export function useFetchSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
  });
}
