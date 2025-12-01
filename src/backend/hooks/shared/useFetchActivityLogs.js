import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";

/**
 *
 * fetchActivityLogs fetches activity logs from the view `view_activity_logs`.
 * Includes activity log details + member info from member table
 *
 */

// Modify fetch function to support pagination
const fetchActivityLogs = async ({ page, limit }) => {
  let query = supabase
    .from("view_activity_logs")
    .select("*")
    .order("timestamp", { ascending: false });

  // If page and limit are provided, apply pagination
  if (page && limit) {
    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data, count };
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
