import { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// mutation hooks
import { useLogin } from "../../backend/hooks/auth/useLogin";

// icons
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

// assets
import auth_bg from "../../assets/auth-bg.jpg";
import digitec_logo from "../../assets/digitec-logo.png";

const Login = () => {
  // hooks
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  // react hook form
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      terms: false
    },
    mode: "onChange",
  });

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/");
  };

  const redirect = () => {
    navigate("/forgot-password");
  };

  const onSubmit = (form_data) => {
    // Mutate and do the login process then navigate which role (account_type) returns
    login(form_data, {
      onSuccess: ({ role }) => {
        navigate(`/${role}`);
      },
      onError: (err) => {
        let uiMessage = "Unexpected error occurred.";

        switch (err.code) {
          case "AUTH_ERROR":
            uiMessage = "Invalid email or password.";
            break;
          case "DB_ERROR":
            uiMessage = "Unable to load your account. Contact Administrator.";
            break;
          case "NO_ACCOUNT_TYPE":
            uiMessage = "Your account has no assigned role.";
            break;
          default:
            uiMessage = err.message || uiMessage;
        }

        setError("root", { message: uiMessage });
      },
    });
  };

  // Watch form values to enable/disable submit button
  const watchedFields = watch(['email', 'password', 'terms']);
  const isFormValid = watchedFields[0] && watchedFields[1] && watchedFields[2] && isValid;

  return (
    <div className="m-3in-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${auth_bg})` }}>
      <Toaster position="bottom-right" />
      <section className="min-h-screen flex justify-center items-center px-4 py-8">
        <div className="card w-full max-w-[550px] min-w-[350px] min-h-[500px] mx-auto bg-base-100 shadow-lg rounded-lg overflow-hidden lg:flex-row">
          {/* Image Section - Hidden on mobile, visible on lg and up */}


          {/* Form Section */}
          <div className="card-body w-full lg:w-1/2 justify-center sm:p-5 md:p-8">
            {/* Logo */}
            <img 
              src={digitec_logo} 
              alt="Fraternity Logo" 
              className="w-28 h-28 mx-auto" 
            />
            <h2 className="text-2xl md:text-3xl font-bold text-center text-green-800 mb-4">
              Welcome to DigiTEC!
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              {/* Email Field */}
              <div>
                <div className="relative w-full">
                  <EmailOutlinedIcon
                    fontSize="small"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Your Email..."
                    autoComplete="email"
                    className={`input input-bordered w-full pl-10 ${errors.email ? "input-error" : ""
                      }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                        message: "Email must be a valid Gmail address",
                      },
                      onChange: () => clearErrors("root"),
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 ml-2">{errors.email.message}</p>
                )}
              </div>
              <div className="flex justify-end" >
                {/* Forgot Password */}
                <button
                  title="Recover your account here"
                  type="button"
                  onClick={redirect}
                  className="link text-gray-500 hover:text-gray-700 text-xs sm:text-right whitespace-nowrap"
                >
                  Forgot Password?
                </button>
              </div>
              
              {/* Password Field */}
              <div>
                <div className="relative w-full">
                  <LockOutlinedIcon
                    fontSize="small"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your Password..."
                    autoComplete="current-password"
                    className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? "input-error" : ""
                      }`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must have at least 6 characters",
                      },
                      onChange: () => clearErrors("root"),
                    })}
                  />
                  <button
                    title="Show Password"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 ml-2">{errors.password.message}</p>
                )}
              </div>

              {/* Server error */}
              {errors.root && (
                <p className="text-red-500 text-center text-sm">{errors.root.message}</p>
              )}

              {/* Terms and Forgot Password Section */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-start gap-3 text-xs mt-2">
                {/* Terms Checkbox */}
                <label className="flex items-start gap-2 flex-1">
                  <input
                    type="checkbox"
                    {...register("terms", {
                      required: "You must agree to the terms and conditions",
                      onChange: () => clearErrors("root"),
                    })}
                    className="checkbox checkbox-xs mt-0.5 flex-shrink-0"
                  />
                  <span className="text-xs leading-relaxed">
                    I hereby acknowledge and agree to the{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/terms")}
                      className="link text-green-800 hover:text-green-700"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/privacy")}
                      className="link text-green-800 hover:text-green-700"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>
                {/* Checkbox error */}
                {errors.terms && (
                  <span className="text-red-500 text-sm ml-2">{errors.terms.message}</span>
                )}

              {/* Buttons */}
              <div className="space-y-3 mt-4">
                <button
                  title="Sign In Button"
                  type="submit"
                  disabled={isPending || !isFormValid}
                  className="btn btn-primary w-full outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-ball loading-sm mr-2"></span>
                      Logging in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="btn w-full bg-gray-300 outline-none text-gray-800 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;