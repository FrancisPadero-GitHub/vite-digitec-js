import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../supabase";

// ===============================
// Combined Query + Hook
// ===============================
export const useLogin = () => {
  const navigate = useNavigate();

  // local state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Query function
  const loginUser = async (email, password) => {
    // Step 1: sign in with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      throw new Error(authError.message);
    }

    // Step 2: fetch account type from members
    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .select("account_type")
      .eq("login_id", authData.user.id) // or `.eq("email", email)`
      .single();

    if (memberError || !memberData) {
      throw new Error("Could not fetch account type.");
    }

    return memberData.account_type;
  };

  // React Query mutation
  const mutation = useMutation({
    mutationFn: () => loginUser(email, password),
    onSuccess: (account_type) => {
      setErrorMsg(null);

      switch (account_type) {
        case "Admin":
          navigate("/admin");
          break;
        case "Board of Directors":
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
          setErrorMsg("Invalid role assigned. Contact admin.");
      }
    },
    onError: (error) => {
      setErrorMsg(error instanceof Error ? error.message : "Unexpected error.");
    },
  });

  // ===============================
  // Handlers + Validation
  // ===============================

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (!value) {
      setEmailError("Email is required");
    } else if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (!value) {
      setPasswordError("Password is required");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailError || passwordError || !email || !password) return;
    setErrorMsg(null);
    mutation.mutate();
  };

  // return for frontend
  return {
    // variables
    email,
    password,
    showPassword,
    errorMsg,
    emailError,
    passwordError,
    mutation,

    // functions
    setShowPassword,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
};
