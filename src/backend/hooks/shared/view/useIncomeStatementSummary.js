import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../supabase.js";

/**
 * This is an RPC function that fetches income statement summary data
 * you can change this later to use the other dynamic version called
 * useFetchTotal.js on shared/hooks if needed
 */

export function useIncomeStatementSummary({ year = "all", month = "all" } = {}) {
  return useQuery({
    queryKey: ["income_statement_summary", year, month],
    queryFn: async () => {
      const p_year = year === "all" ? null : Number(year);
      const p_month = month === "all" ? null : Number(month);

      const { data, error } = await supabase.rpc(
        "get_income_statement_summary",
        {
          p_year,
          p_month
        }
      );

      if (error) throw error;
      return data;
    }
  });
}
