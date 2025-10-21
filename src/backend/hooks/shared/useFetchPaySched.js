import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase.js";

/**
 * Fetches loan payment schedules.
 * If loanId is provided, filters by that loan.
 * If page and limit are provided, applies pagination.
 * If not, fetches all records for that loan (or all loans if no loanId).
 *
 * @param {object} options
 * @param {number} [options.page] - pagination page number (optional)
 * @param {number} [options.limit] - number of records per page (optional)
 * @param {string|null} [options.loanId] - specific loan ID (optional)
 * @returns { data, count }
 */
async function fetchPaySched({ page, limit, loanId }) {
  let query = supabase
    .from("loan_payment_schedules")
    .select("*", { count: "exact" })
    .is("deleted_at", null)
    .order("due_date", { ascending: true });

  // Filter by loan ID if provided
  if (loanId) {
    query = query.eq("loan_id", loanId);
  }

  // Apply pagination only when both page and limit are provided
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
}
export function useFetchPaySched({ page = null, limit = null, loanId = null } = {}) {
  return useQuery({
    queryFn: () => fetchPaySched({ page, limit, loanId }),
    queryKey: ["loan_payment_schedules", loanId],
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
}



