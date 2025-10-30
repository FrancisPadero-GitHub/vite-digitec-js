import { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
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
    formState: { errors },
  } = useForm({
    email: "",
    password: "",
    mode: "onChange",
  });

  const navigate = useNavigate();

  const notify = () => {
    toast.error("Please contact administrator")
  }

  const onSubmit = (form_data) => {
    // Mutate and do the login process then navigate which role (account_type) returns
    // Might remove the switch process in the future after I fix the admin user adding
    login(form_data, {
      onSuccess: ({role}) => { // {role} is destructered cause we returned {role: members.account_type} as object otherwise its default (data)
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

  return (
    <div className="min-h-screen font-inter bg-base-200">
      <Toaster position="bottom-right"/>
      <section className="min-h-screen flex justify-center items-center px-4">
        <div className="card card-side w-[900px] h-[500px] mx-auto bg-base-100 shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row mt-5 mb-5">
          <figure className="w-full md:w-1/2 h-full max-h-[600px] overflow-hidden">
            <img 
            src={auth_bg}
            alt="Login background illustration"
            className="w-full h-full object-cover" />
          </figure>

          <div className="card-body w-full md:w-1/2 justify-center">
            <h2 className="text-4xl font-bold text-center text-base-content mb-6">Login</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="relative w-full">
                <EmailOutlinedIcon
                  fontSize="small"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none"
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
                      message: "Email must be a valid email address",
                    },
                    onChange: () => clearErrors("root"),
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}

              {/* Password Field */}
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
                  onClick={() => setShowPassword((prev) => !prev)} // (prev) => !prev is an arrow function, it’s the functional form of a state update.
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                >
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}

              {/* Server error */}
              {errors.root && (
                <p className="text-red-600 text-center">{errors.root.message}</p>
              )}

              <p className="text-right text-xs text-gray-500">
                <button
                  title="Forgot password"
                  type="button" 
                  onClick={() => notify()}
                  className="link">
                  Forgot Password?
                </button>
              </p>

              <button
                title="Sign In Button"
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
                  "Sign In"
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
