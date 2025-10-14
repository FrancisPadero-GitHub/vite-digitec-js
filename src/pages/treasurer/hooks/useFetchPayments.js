import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase";

async function fetchLoanPayments({ page = 1, limit = 10 }) {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await supabase
    .from("loan_payments")
    .select("*", { count: "exact" }) // fetch count for pagination
    .order("payment_id", { ascending: false })
    .is("deleted_at", null)
    .range(from, to); // specific range for pagination

  if (error) throw new Error(error.message);
  return { data, count };
}

export function useFetchLoanPayments(page, limit) {
  return useQuery({
    queryKey: ["loan_payments", page, limit],
    queryFn: () => fetchLoanPayments({ page, limit }),
    keepPreviousData: true, // smooth pagination
    staleTime: 1000 * 60 * 1,
  });
}
