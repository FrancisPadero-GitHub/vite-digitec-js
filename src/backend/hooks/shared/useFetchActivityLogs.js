import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// Modify fetch function to support pagination
const fetchActivityLogs = async ({ page, limit }) => {
    let query = supabase
    .from("activity_logs")
    .select(`*, members:action_member_id(f_name, l_name, account_role)`)
    .order("timestamp", { ascending: false });

  // If page and limit are provided, apply pagination
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return {data, count};
};

// Hook to fetch activity logs with pagination
export const useFetchActivityLogs = ({ page = null, limit = null }) => {
  return useQuery({
    queryKey: ["activity_logs", page, limit],
    queryFn: () => fetchActivityLogs({ page, limit }),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
};
