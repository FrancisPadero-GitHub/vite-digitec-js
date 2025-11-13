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


  useEffect(() => {
    // Get current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setEvent(null);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evt, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setEvent(evt);
    });

    // Cleanup listener
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, session, setSession, loading, event, setEvent }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
