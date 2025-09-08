import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "./backend/context/AuthProvider";
import { useMembers } from "./backend/hooks/useFetchMembers";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const LoadingContainer = ({ children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: 2,
      animation: `${fadeIn} 0.5s ease-in`,
    }}
  >
    {children}
  </Box>
);

/**
 * Converts account_type from the DB to route/sidebar role keys
 * Temporary should be removed and replaced with better design and handling on the user registration or from the database 
 * or anywhere just remove this on future code changes
 */
const normalizeRole = (accountType) => {
  switch (accountType) {
    case "Admin":
      return "admin";
    case "Treasurer":
      return "treasurer";
    case "Board of Directors":
      return "board";
    case "Regular Member":
      return "regular-member";
    case "Associate Member":
      return "associate-member";
    default:
      return accountType.toLowerCase().replace(/\s+/g, "-"); // fallback
  }
};

const ProtectedRoute = ({ children, roleAllowed }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: members, isLoading: membersLoading } = useMembers();

  // Loading state for auth or members fetch
  if (authLoading || membersLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </LoadingContainer>
    );
  }

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Find the member record
  const memberRecord = members?.find((m) => m.login_id === user.id);

  if (!memberRecord) {
    // No member record found for the user
    return <Navigate to="/login" replace />;
  }

  // Normalize the member role
  const memberRole = normalizeRole(memberRecord.account_type);

  // Normalize allowed roles to an array
  const allowedRoles = Array.isArray(roleAllowed) ? roleAllowed : [roleAllowed];

  // Access control
  if (!allowedRoles.includes(memberRole)) {
    return <Navigate to={`/${memberRole}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
