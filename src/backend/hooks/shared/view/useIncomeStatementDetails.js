// src/backend/hooks/accounting/useIncomeStatementDetails.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../supabase.js";

export function useIncomeStatementDetails({ account_number, category } = {}) {
  return useQuery({
    queryKey: ["income_statement_details", account_number, category],
    queryFn: async () => {
      let query = supabase
        .from("view_income_statement_details")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (account_number) query = query.eq("account_number", account_number);
      if (category) query = query.eq("category", category);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
