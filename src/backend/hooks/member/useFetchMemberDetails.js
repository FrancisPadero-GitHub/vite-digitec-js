import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// -- Used in MemberProfile.jsx to fetch all related member data in one go --

// Individual fetch functions (memberId, club funds, coop contributions)
async function fetchMemberInfo(memberId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle(); // using .single throws an error saying multiple/no rows returned; this just returns null
    if (error) throw new Error(error.message);
    return data;
}

async function fetchClubFunds(memberId, page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error } = await supabase
    .from("club_funds_contributions")
    .select("*")
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .order("contribution_id", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return data;
}

async function fetchCoopContributions(memberId, page = 1, limit = 10) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error } = await supabase
    .from("coop_cbu_contributions")
    .select("*")
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .order("coop_contri_id", { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return data;
}


/**
 * unified react query hook to fetch all related member data (profile, club funds, and coop contributions).
 *
 * @param {number} memberId - numeric ID of the member to fetch data for.
 *
 * @returns {object} contains:
 *  - `data` {object}:
 *      - `memberInfo` {object|null} Basic member info, or `null` if the member doesn't exist.
 *      - `clubFunds` {Array} List of their club fund contributions.
 *      - `coopContributions` {Array} List of their coope contributions.
 */


// Unified hook to fetch all member details in one go
export function useFetchMemberDetails(memberId) {
  return useQuery({
    queryKey: ["memberDetails", memberId],
    enabled: !!memberId,
    queryFn: async () => {
      // Fetch the memberId first
      const memberInfo = await fetchMemberInfo(memberId);

      // If not found, skip the others and return early
      if (!memberInfo) {return { memberInfo: null, clubFunds: [], coopContributions: [] };}

      const [clubFunds, coopContributions] = await Promise.all([
        fetchClubFunds(memberId, 1, 10),
        fetchCoopContributions(memberId, 1, 10),
      ]);
      return { memberInfo, clubFunds, coopContributions };
    },
    staleTime: 1000 * 60 * 5,
  });
}
