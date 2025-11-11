import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthProvider";

export function useCreateUser() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      if (!session || !session.access_token) {
        throw new Error("Admin is not authenticated");
      }

      const accessToken = session.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }

      if (!res.ok) {
        throw new Error(json.error?.message || res.statusText);
      }

      return json;
    },
  });
}
