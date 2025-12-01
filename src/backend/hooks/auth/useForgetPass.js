import { supabase } from "../../supabase";
import { useMutation } from "@tanstack/react-query";

/**
 * useForgetPass - Hook to trigger Supabase forgot password email
 * @returns {object} mutation object from TanStack Query
 */
export function useForgetPass() {
  const mutation = useMutation({
    mutationFn: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      return true;
    },
  });
  return mutation;
}
