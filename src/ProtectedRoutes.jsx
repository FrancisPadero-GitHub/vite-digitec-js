import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "./backend/context/AuthProvider";

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
  const { session, loading: authLoading, role } = useAuth();

  const activeRole = role ;

  if (authLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={50} thickness={3} />
        <Typography variant="h6" color="text.secondary">
          For a while...
        </Typography>
      </LoadingContainer>
    );
  }

  // If not logged in, go to login
  if (!session) return <Navigate to="/" replace />;

  // No role found, show 404
  if (!activeRole) return <Navigate to="/not-found" replace />;

  // Normalize allowed roles into array
  const allowedRoles = Array.isArray(roleAllowed)
    ? roleAllowed
    : [roleAllowed];

  // If role isn’t allowed, redirect to that user’s base route
  if (!allowedRoles.includes(activeRole)) {
    return <Navigate to={`/${activeRole}`} replace />;
  }

  return children;
};

export default ProtectedRoutes;
