import { supabase } from "../../supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";


export const useLogout = () => {
  const queryClient = useQueryClient();
  const { setSession, setUser, setEvent, setRecoveryMode } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    // 1. Clear context immediately
    setSession(null);
    setUser(null);
    setEvent(null);
    setRecoveryMode(false);

    // 2. Clear any cached queries
    queryClient.clear();

    // 3. Sign out from Supabase
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
  }

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      sessionStorage.removeItem("recovery_mode");
      navigate("/", { replace: true });
    },
    onError: (err) => {
      console.error("Logout error:", err.message);
    }
  });
};