import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../backend/supabase.js";
import { useAuth } from "../../../backend/context/AuthProvider.jsx";

// Plain async function (no hooks here)
const memberPasswordChange = async ({ currentPassword, newPassword, user }) => {
  // 1. Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user?.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error("Current password is incorrect");
  }

  // 2. Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { message: "Password updated successfully" };
};

export const useChangePassword = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      memberPasswordChange({ currentPassword, newPassword, user }),

    onSuccess: (data) => {
      console.log(data.message);
    },

    onError: (error) => {
      console.error("Password change failed:", error.message);
    },
  });
};
