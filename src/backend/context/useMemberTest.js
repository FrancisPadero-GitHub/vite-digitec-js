import { useAuth } from "./AuthProvider.jsx";
import { useMembers } from "../hooks/shared/useFetchMembers.js";

/**
 * Returns the member role of the currently logged-in user.
 * 
 * @returns { { memberRole: string|null, loading: boolean } }
 */

export const useMemberTest = () => {
  const { user } = useAuth();
  const { data: raw_data, isLoading } = useMembers();
  const members = raw_data?.data || [];

  // return nothing if its still loading
  if (isLoading) return { mem_data: null, loading: true };

  // find the data of the logged in user
  const mem_data = members?.find((m) => m.login_id === user?.id);

  // you can use this two 
  return { mem_data, loading: false };
};

/**
 * Usage:
 * 
 * import { useMemberTest } from "../context/useMemberTest";
 * 
 * const { mem_data, loading } = useMemberTest();
 * 
 * const accountNum = mem_data?.account_number;
 * const accountRole = mem_data?.account_role;
 * 
 */