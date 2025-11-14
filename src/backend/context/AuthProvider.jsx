import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

// Create the AuthContext with default values
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  event: null,
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [recoveryMode, setRecoveryMode] = useState(false)

  useEffect(() => {
    setLoading(true);
    // This function checks for password recovery links and handles redirection
    const handleRecoveryRedirect = async () => {
      const { hash, pathname } = window.location;

      // Supabase recovery links include "#access_token=..." and "type=recovery"
      if (hash.includes("type=recovery") && pathname !== "/reset-password") {
        // Sign out any temporary session to prevent auto-login
        await supabase.auth.signOut();

        // Redirect to reset password page (keep the hash)
        window.location.replace("/reset-password" + hash);
        return; // stop further processing
      }
    };
    handleRecoveryRedirect();


    // Get current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evt, session) => {
      if (evt === "PASSWORD_RECOVERY") {
        setRecoveryMode(true)
      }
      setEvent(evt)
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup listener
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, session, setSession, loading, event, setEvent, recoveryMode, setRecoveryMode }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
