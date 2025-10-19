import { useQuery } from "@tanstack/react-query";
import { useFetchMemberId } from "../shared/useFetchMemberId";
import { supabase } from "../../supabase.js";

async function fetchProfile(memberId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("member_id", memberId)
    .single()
    .is("deleted_at", null); // return a member who is not deleted

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchProfile() {
  const { data: memberId, isLoading: memberLoading } = useFetchMemberId(); //fetch memberId
  return useQuery({
    queryKey: ["member_profile", memberId],
    queryFn: () => fetchProfile(memberId),
    enabled: !!memberId && !memberLoading,
    staleTime: 1000 * 60 * 1
  });
}
