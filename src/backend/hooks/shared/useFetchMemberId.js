import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

import { useAuth } from "../../context/AuthProvider";

/**
 * Fetches member_id in the Members table that corresponds to a given Supabase login_id that who is currently logged-in on the system
 * This is replaced by useFetchAccountNumber.js for better usage and proper industry standard for using it 
 * It is just here for debugging purposes or anything 
 * 
 * 
 * 
 * @param {string} loginId - Supabase login_id to look up in the members table.
 * @returns {Promise<number|null>} - Resolves to the member_id if found, null if not found.
 */
 
// This is to get member_id (that corresponds to login_id); other hooks will use this to get member-specific data
async function fetchMemberId(loginId) {
    const { data: member, error} = await supabase
        .from("members")
        .select("member_id")
        .eq("login_id", loginId)
        .single();

    if (error) throw new Error(error.message);
    return member?.member_id || null;
}

export function useMemberId() {
    // Get the login_id of the current logged in user
    const { user } = useAuth();
    const loginId = user?.id;

    return useQuery({
      queryFn: () => fetchMemberId(loginId),
      queryKey: ["member_id", loginId],
      enabled: !!loginId,
      staleTime: 1000 * 60 * 5,
  });
}
