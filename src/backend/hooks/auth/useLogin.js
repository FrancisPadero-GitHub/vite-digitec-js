import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../supabase";

const loginUser = async ({ email, password }) => {
  const { data: auth, error: auth_error } =
    await supabase.auth.signInWithPassword({ email, password });

  // default error msg
  if (auth_error) {
    throw {
      code: "AUTH_ERROR",
      message: auth_error.message,
    };
  }
  // custom error msg for specific column
  if (!auth?.user?.id) {
    throw {
      code: "NO_USER_ID",
      message: "Failed to retrieve authentication id",
    };
  }

  // Role Base Access query for the UI
  const { data: members, error: mem_error } = await supabase
    .from("members")
    .select("account_type")
    .eq("login_id", auth.user.id)
    .single();

  // default error msg
  if (mem_error) {
    throw {
      code: "DB_ERROR",
      message: mem_error.message,
    };
  }

  // custom error msg for specific column
  if (!members?.account_type) {
    throw {
      code: "NO_ACCOUNT_TYPE",
      message: "User has no assigned account type.",
    };
  }

  return { role: members.account_type, userId: auth.user.id }; // will be used by the onSuccess, do mind the destructuring
};

export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
    onError: (err) => {
      // purely logging
      console.warn("Login error:", err);
    },
  });
}
