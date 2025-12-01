import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";
import Proptypes from "prop-types";

// Create the AuthContext with default values
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  event: null,
  recoveryMode: false,
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      const { hash, pathname } = window.location;
      const isRecoveryLink = hash.includes("type=recovery");
      const isResetPasswordPage = pathname === "/reset-password";
      const storedRecoveryMode =
        sessionStorage.getItem("recovery_mode") === "true";

      // Handle recovery link or persisted recovery mode
      if (isRecoveryLink || storedRecoveryMode) {
        if (!storedRecoveryMode)
          sessionStorage.setItem("recovery_mode", "true");
        setRecoveryMode(true);

        // Redirect if not on reset-password page
        if (!isResetPasswordPage) {
          window.location.replace("/reset-password" + hash);
          return; // stop further processing
        }
      }

      // Fetch initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (sessionStorage.getItem("recovery_mode") === "true") {
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }

      setLoading(false);
    };

    initAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evt, session) => {
      setEvent(evt);

      const recoveryActive = sessionStorage.getItem("recovery_mode") === "true";

      switch (evt) {
        case "PASSWORD_RECOVERY":
          sessionStorage.setItem("recovery_mode", "true");
          setRecoveryMode(true);
          setSession(null);
          setUser(null);
          break;

        case "USER_UPDATED":
          if (recoveryActive) {
            sessionStorage.removeItem("recovery_mode");
            setRecoveryMode(false);
            supabase.auth.signOut();
            setSession(null);
            setUser(null);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
          break;

        case "SIGNED_OUT":
          sessionStorage.removeItem("recovery_mode");
          setRecoveryMode(false);
          setSession(null);
          setUser(null);
          break;

        default:
          // Ignore other events if recovery mode is active
          if (!recoveryActive) {
            setSession(session);
            setUser(session?.user ?? null);
          }
          break;
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        session,
        setSession,
        loading,
        event,
        setEvent,
        recoveryMode,
        setRecoveryMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
AuthProvider.propTypes = {
  children: Proptypes.node.isRequired,
};

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
