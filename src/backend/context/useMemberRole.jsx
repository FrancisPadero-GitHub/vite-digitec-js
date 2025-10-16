// useMemberRole.js
import { useAuth } from "./AuthProvider.jsx";
import { useMembers } from "../hooks/shared/useFetchMembers.js";

/**
 * Returns the member role of the currently logged-in user.
 * 
 * @returns { { memberRole: string|null, loading: boolean } }
 */

export const useMemberRole = () => {
  const { user } = useAuth();
  const { data: members_data, isLoading } = useMembers();
  const members = members_data?.data || [];

  if (isLoading) return { memberRole: null, loading: true };

  const member = members?.find((m) => m.login_id === user?.id);  
  const memberRole = member ? member.account_role : null;

  return { memberRole, loading: false };
};
