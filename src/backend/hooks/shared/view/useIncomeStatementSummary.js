import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../supabase.js";


export function useIncomeStatementSummary() {
  return useQuery({
    queryKey: ["income_statement_summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_income_statement_summary")
        .select("*");

      if (error) throw error;
      return data;
    },
  });
}