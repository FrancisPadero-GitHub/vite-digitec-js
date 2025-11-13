import { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// mutation hooks
import { useForgetPass } from "../../backend/hooks/auth/useForgetPass";

// icons
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// assets
import auth_bg from "../../assets/auth-bg.jpg";

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  // hooks
  const { mutate: sendResetEmail, isPending } = useForgetPass();
  const navigate = useNavigate();

  // react hook form
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = (form_data) => {
    sendResetEmail(form_data.email, {
      onSuccess: () => {
        setSubmittedEmail(form_data.email);
        setEmailSent(true);
        toast.success("Password reset email sent successfully!");
      },
      onError: (err) => {
        let uiMessage = "Failed to send reset email.";

        if (err.message?.includes("Email not confirmed")) {
          uiMessage = "Email address not verified. Please verify your email first.";
        } else if (err.message?.includes("Invalid email")) {
          uiMessage = "Invalid email address.";
        } else if (err.message) {
          uiMessage = err.message;
        }

        setError("root", { message: uiMessage });
        toast.error(uiMessage);
      },
    });
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen font-inter bg-base-200">
      <Toaster position="bottom-right" />
      <section className="min-h-screen flex justify-center items-center px-4">
        <div className="card card-side w-[900px] h-[500px] mx-auto bg-base-100 shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row mt-5 mb-5">
          <figure className="w-full md:w-1/2 h-full max-h-[600px] overflow-hidden">
            <img
              src={auth_bg}
              alt="Forgot password background illustration"
              className="w-full h-full object-cover"
            />
          </figure>

          <div className="card-body w-full md:w-1/2 justify-center">
            {!emailSent ? (
              <>
                <h2 className="text-4xl font-bold text-center text-base-content mb-2">
                  Forgot Password
                </h2>
                <p className="text-center text-gray-500 text-sm mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

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
                      className={`input input-bordered w-full pl-10 ${
                        errors.email ? "input-error" : ""
                      }`}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Email must be a valid email address",
                        },
                        onChange: () => clearErrors("root"),
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}

                  {/* Server error */}
                  {errors.root && (
                    <p className="text-red-600 text-center text-sm">{errors.root.message}</p>
                  )}

                  <button
                    title="Send Reset Link"
                    type="submit"
                    disabled={isPending}
                    className="btn btn-primary w-full"
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-ball loading-sm mr-2"></span>
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>

                  <button
                    title="Back to Login"
                    type="button"
                    onClick={handleBackToLogin}
                    className="btn btn-ghost w-full"
                  >
                    <ArrowBackOutlinedIcon fontSize="small" />
                    Back to Login
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <CheckCircleOutlineIcon
                    className="text-success"
                    style={{ fontSize: 80 }}
                  />
                </div>
                <h2 className="text-3xl font-bold text-base-content">
                  Check Your Email
                </h2>
                <p className="text-gray-600">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-primary">{submittedEmail}</p>
                <p className="text-gray-500 text-sm">
                  Please check your inbox and click the link to reset your password.
                  If you don't see the email, check your spam folder.
                </p>
                <button
                  title="Back to Login"
                  type="button"
                  onClick={handleBackToLogin}
                  className="btn btn-primary w-full"
                >
                  <ArrowBackOutlinedIcon fontSize="small" />
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;