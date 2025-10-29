import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

// Create the AuthContext with default values
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Get current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Cleanup listener
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load role from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  // Sync role changes to localStorage
  useEffect(() => {
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [role]);


  return (
    <AuthContext.Provider value={{ user, setUser, session, setSession, loading, role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
