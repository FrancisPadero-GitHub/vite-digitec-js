// src/hooks/useMembers.js
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

async function fetchMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("member_id", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });
}
