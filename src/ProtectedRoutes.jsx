import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "./backend/context/AuthProvider";
import { useMemberRole } from "./backend/context/useMemberRole";

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
 * ProtectedRoutes
 * Handles role fetching, loading state, and access restriction in one place.
 * @param {ReactNode} children
 * @param {string|string[]} roleAllowed - roles allowed to access this route
 */

const ProtectedRoutes = ({ children, roleAllowed }) => {
  const { session, loading: authLoading } = useAuth();
  const { memberRole, loading: roleLoading } = useMemberRole();
  console.log(`prtd:`, memberRole)
  const loading = authLoading || roleLoading;

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress size={50} thickness={3} />
        <Typography variant="h6" color="text.secondary">
          For a while...
        </Typography>
      </LoadingContainer>
    );
  }

  if (!session) return <Navigate to="/" replace />;
  if (!memberRole) return <Navigate to="/not-found" replace />;

  const allowedRoles = Array.isArray(roleAllowed)
    ? roleAllowed
    : [roleAllowed];

  if (!allowedRoles.includes(memberRole)) {
    return <Navigate to={`/${memberRole}`} replace />;
  }

  return children;
};


export default ProtectedRoutes;
