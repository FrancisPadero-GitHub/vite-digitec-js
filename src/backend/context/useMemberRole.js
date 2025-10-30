// useMemberRole.js
import { useAuth } from "./AuthProvider.jsx";
import { useMembers } from "../hooks/shared/useFetchMembers";

/**
 * Returns the member role of the currently logged-in user.
 * 
 * @returns { { memberRole: string|null, loading: boolean } }
 */

export const useMemberRole = () => {
  const { user } = useAuth();
  const { data: members_data, isLoading } = useMembers({ login_id: user?.id });
  const member = members_data?.data?.[0] || null; // ✅ grab the first result

  if (isLoading) return { memberRole: null, loading: true };

  return { memberRole: member?.account_role || null, loading: false };
};

/**
 * 
 *  This is unused code that was part of the previous implementation. It has been retained for reference.
 * 
  */