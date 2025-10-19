import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 * 
 * ISSUE: Cannot pick spedific page due to shared pagination
 * 
 */

// Fetch member info by memberId
async function fetchMemberInfo(memberId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  if (error) {
    throw { code: "DB_ERROR", message: error.message };
  }

  if (!data) {
    throw { code: "NO_MEMBER_FOUND", message: "No member found with this ID." };
  }

  return data;
}

// Generic fetch for club funds with optional pagination
async function fetchClubFunds({ accountNumber, page = null, limit = null }) {
  let query = supabase
    .from("club_funds_contributions")
    .select("*", { count: "exact" })
    .eq("account_number", accountNumber)
    .is("deleted_at", null)
    .order("contribution_id", { ascending: false });

  // Optionals if values are null return all data no filters
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw { code: "CLUB_FUNDS_ERROR", message: error.message };
  }

  return { data, count };
}

// Generic fetch for coop contributions with optional pagination
async function fetchCoopContributions({
  accountNumber,
  page = null,
  limit = null,
}) {
  let query = supabase
    .from("coop_cbu_contributions")
    .select("*", { count: "exact" })
    .eq("account_number", accountNumber)
    .is("deleted_at", null)
    .order("coop_contri_id", { ascending: false });

  // Optionals if values are null return all data no filters
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw { code: "COOP_CONTRI_ERROR", message: error.message };
  }

  return { data, count };
}

async function fetchLoanAcc({
  accountNumber,
  page = null,
  limit = null,
}) {
  let query = supabase
    .from("loan_accounts")
    .select("*", { count: "exact" })
    .eq("account_number", accountNumber)
    .is("deleted_at", null)
    .order("loan_id", { ascending: false });

  // Optionals if values are null return all data no filters
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw { code: "LOAN_ACC_ERROR", message: error.message };
  }

  return { data, count };
}

/**
 * Unified hook to fetch member info + contributions
 * Optional pagination like useFetchLoanAcc
 */
export function useFetchMemberDetails({
  memberId,
  page = null,
  limit = null,
} = {}) {
  return useQuery({
    queryKey: ["memberDetails", memberId, page, limit],
    enabled: !!memberId,
    queryFn: async () => {
      const memberInfo = await fetchMemberInfo(memberId);
      const accountNumber = memberInfo?.account_number;
      if (!accountNumber) {
        throw {
          code: "NO_ACCOUNT_NUMBER",
          message: "Member has no account number.",
        };
      }

      const [clubFunds, coopContributions, loanAcc] = await Promise.all([
        fetchClubFunds({ accountNumber, page, limit }),
        fetchCoopContributions({ accountNumber, page, limit }),
        fetchLoanAcc({accountNumber, page, limit})
      ]);

      return { memberInfo, clubFunds, coopContributions, loanAcc};
    },
    staleTime: 1000 * 60 * 5,
    onError: (err) => {
      console.warn("Member details error:", err);
    },
  });
}
