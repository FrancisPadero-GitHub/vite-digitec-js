import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLogin } from "../../backend/hooks/useLogin";

const Login = () => {
  // Hook: returns mutation methods/states from React Query
  const {
    mutate,     // function to trigger login
    isPending,  // true while request is in progress
  } = useLogin();

  // Local state for form inputs and UI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Local state for validation + server errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState(null);

  // ------------------------------
  //#region Input validation helpers
  // ------------------------------

  // Regex check for valid email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate email on change
  const emailInputChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    setError(null); // clear server error when typing

    if (!value) {
      setEmailError("Email is required");
    } else if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // Validate password on change
  const passwordInputChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    setError(null); // clear server error when typing

    if (!value) {
      setPasswordError("Password is required");
    } else if (value.length < 6) {
      setPasswordError("Password must have at least 6 characters");
    } else {
      setPasswordError("");
    }
  };
  //#endregion

  // ------------------------------
  // Form submit handler
  // ------------------------------
  const submitForm = (event) => {
    event.preventDefault();

    // Block submission if validation fails
    if (emailError || passwordError || !email || !password) return;

    setError(null); // reset any previous server error

    mutate(
      { email, password },
      {
        // Capture errors from backend hook (e.g. invalid login)
        onError: (err) => {
          setError(err.message || "An unexpected error occurred");
        },
      }
    );
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="min-h-screen font-inter bg-base-200">
      <section className="min-h-screen flex justify-center items-center px-4">
        <div className="card max-w-xl w-full bg-base-100 shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-4">Login Here</h2>

          <form onSubmit={submitForm} className="flex flex-col gap-4">
            {/* Email input */}
            <input
              type="email"
              placeholder="EMAIL"
              className={`input input-bordered w-full ${emailError ? "input-error" : ""
                }`}
              value={email}
              onChange={emailInputChange}
              required
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

            {/* Password input with visibility toggle */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                className={`input input-bordered w-full pr-10 ${passwordError ? "input-error" : ""
                  }`}
                value={password}
                onChange={passwordInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}

            {/* Server-side error (login failure, etc.) */}
            {error && <p className="text-red-600 text-center">{error}</p>}

            {/* Submit button with loading state */}
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full"
            >
              {isPending ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Login;
