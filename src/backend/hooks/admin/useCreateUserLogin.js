import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { useAuth } from "../../context/AuthProvider";

export function useCreateUser() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, account_number }) => {
      if (!session || !session.access_token) {
        throw new Error("Admin is not authenticated");
      }

      const accessToken = session.access_token;

      // 1️⃣ Call the Supabase Edge Function to create the user
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

      // 2️⃣ Extract the UID of the newly created user
      const newUserId = json.data?.user?.id;
      if (!newUserId) {
        throw new Error("Failed to get new user UID from Edge Function");
      }

      // 3️⃣ Update the corresponding member with login_id
      const { error: updateError } = await supabase
        .from("members")
        .update({ login_id: newUserId })
        .eq("account_number", account_number);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Return the created user data for the hook consumer
      return { ...json.data, updated_member_account_number: account_number };
    },
    onSuccess: (data) => {
      console.log("User created and member updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["members"], exact: false });
    },
  });
}
