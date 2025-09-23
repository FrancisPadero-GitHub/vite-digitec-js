import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
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
        <div className="card card-side w-[900px] h-[500px] mx-auto bg-base-100 shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row mt-5 mb-5">
          <figure className="w-full md:w-1/2 h-full max-h-[600px] overflow-hidden">
            <img src="/src/assets/auth-bg.jpg" className="w-full h-full object-cover"/>
          </figure>

          <div className="card-body w-full md:w-1/2 justify-center">
            <h2 className="text-4xl font-bold text-center text-base-content mb-6">Login</h2>

            <form onSubmit={submitForm} className="space-y-4">
              {/* Email Field */}
              <div className="relative w-full">
                <EmailOutlinedIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Your Email..."
                  className={`input input-bordered w-full pl-10 ${
                    emailError ? "input-error" : ""
                  }`}
                  value={email}
                  onChange={emailInputChange}
                  required
                />
              </div>
              
              {/* Error message */}
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

              {/* Password Field */}
              <div className="relative w-full">
                <LockOutlinedIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your Password..."
                  className={`input input-bordered w-full pl-10 pr-10 ${
                    passwordError ? "input-error" : ""
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
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

              {/* Error message */}
              {error && <p className="text-red-600 text-center">{error}</p>}

              {/* Forgot password */}
              <p className="text-right text-xs text-gray-500">
                <a href="/forgot-password" className="link">
                  Forgot Password?
                </a>
              </p>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary w-full"
              >
                {isPending ? (
                  <>
                    <span className="loading loading-ball loading-sm mr-2"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
