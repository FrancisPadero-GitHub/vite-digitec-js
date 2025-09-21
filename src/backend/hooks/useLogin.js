import { useMutation } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

/**
 * Attempts to log in a user using Supabase authentication,
 * then fetches their account type from the "members" table.
 */
const loginUser = async ({ email, password }) => {
  // Step 1: Authenticate user with email + password
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError) {
    throw new Error(`Login failed: ${authError.message}`);
  }

  // Safety check — Supabase should always return a user here
  if (!authData?.user?.id) {
    throw new Error("Login failed: No user ID returned.");
  }

  // Step 2: Fetch the user's account type from "members" table
  const { data: memberData, error: memberError } = await supabase
    .from("members")
    .select("account_type")
    .eq("login_id", authData.user.id)
    .single();

  if (memberError) {
    throw new Error(`Database error: ${memberError.message}`);
  }
  if (!memberData?.account_type) {
    throw new Error("User has no assigned account type.");
  }

  return memberData.account_type;
};

/**
 * Custom hook for logging in users with Supabase.
 * Wraps login flow in a TanStack Query mutation.
 *
 * On success: navigates to the appropriate route based on account type.
 */
export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (accountType) => {
      // Redirect user based on account type
      switch (accountType) {
        case "Admin":
          navigate("/admin");
          break;
        case "Board":
          navigate("/board");
          break;
        case "Treasurer":
          navigate("/treasurer");
          break;
        case "Associate":
          navigate("/associate-member");
          break;
        case "Regular":
          navigate("/regular-member");
          break;
        default:
          // If accountType is unexpected, fail gracefully
          console.warn(`Unknown account type: ${accountType}`);
          navigate("/"); // fallback route
      }
    },
    onError: (error) => {
      // Log the error and optionally show UI feedback
      console.error("Login failed:", error.message);
      // Here you could integrate a toast notification system:
      // toast.error(error.message);
    },
  });
}
