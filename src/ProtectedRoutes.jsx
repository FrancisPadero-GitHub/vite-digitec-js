import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "./backend/context/AuthProvider"; // Assuming you are importing useAuth from your AuthProvider
import { useMemberRole } from "./backend/context/useMemberRole"; // Adjust the path accordingly

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

const ProtectedRoutes = ({ children, roleAllowed }) => {
  const { session, loading: authLoading, recoveryMode } = useAuth();
  
  // Use the custom hook to get member role and loading state
  const { memberRole, loading: roleLoading } = useMemberRole();

  // Combine auth loading and role loading states
  if (authLoading || roleLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={50} thickness={3} />
        <Typography variant="h6" color="text.secondary">
          For a while...
        </Typography>
      </LoadingContainer>
    );
  }

  // If in recovery mode, force redirect to reset password page
  if (recoveryMode) return <Navigate to="/reset-password" replace />;

  // If not logged in, go to login
  if (!session) return <Navigate to="/" replace />;

  // No role found, show 404
  if (!memberRole) return <Navigate to="/not-found" replace />;

  // Normalize allowed roles into array
  const allowedRoles = Array.isArray(roleAllowed)
    ? roleAllowed
    : [roleAllowed];

  // If role isn’t allowed, redirect to that user’s base route
  if (!allowedRoles.includes(memberRole)) {
    return <Navigate to={`/${memberRole}`} replace />;
  }

  return children;
};

export default ProtectedRoutes;
