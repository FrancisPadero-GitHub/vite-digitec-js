import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

async function fetchLoanProducts() {
  const { data, error } = await supabase
    .from("loan_products")
    .select("*")
    .order("product_id", { ascending: true })
    .is("deleted_at", null); // only fetch active records

  if (error) throw new Error(error.message);
  return data;
}

export function useFetchLoanProducts() {
  return useQuery({
    queryKey: ["loan_products"],
    queryFn: fetchLoanProducts,
    staleTime: 1000 * 60 * 1, 

  });
}
