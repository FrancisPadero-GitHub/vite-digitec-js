// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "./backend/context/AuthProvider";
import { useMembers } from "./backend/hooks/useFetchMembers";

/**
 * Responsible for routing logged in user to not accidentally access pages they are not meant to see
 * 
 * ISSUE: it scans members table which could take long to finish to find appropriate account role
 * 
 */

// Simple fade-in animation
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

const ProtectedRoute = ({ children, roleAllowed }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: members, isLoading: membersLoading } = useMembers();

  // Show loading screen while checking auth
  if (authLoading || membersLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={80} thickness={5} />
        <Typography variant="h5" color="text.secondary">
          For a while...
        </Typography>
      </LoadingContainer>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Find member record associated with logged in user
  const memberRecord = members?.find((m) => m.login_id === user.id); // this is gonna take a while to render since it will scan the entire shit members
  if (!memberRecord) {
    return <Navigate to="/login" replace />;
  }

  const memberRole = memberRecord.account_type;

  // Support both single and multiple allowed roles
  const allowedRoles = Array.isArray(roleAllowed)
    ? roleAllowed
    : [roleAllowed];

  // If the user role doesn't match, redirect them to their default dashboard
  if (!allowedRoles.includes(memberRole)) {
    return <Navigate to={`/${memberRole}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
