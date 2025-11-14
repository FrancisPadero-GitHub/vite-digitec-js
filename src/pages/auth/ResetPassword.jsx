import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// context
import { useAuth } from "../../backend/context/AuthProvider";

// mutation hooks
import { useResetPass } from "../../backend/hooks/auth/useResetPass";

// icons
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// assets
import auth_bg from "../../assets/auth-bg.jpg";

const ResetPassword = () => {
  const { recoveryMode, loading } = useAuth();
  
  // states
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordReset, setPasswordReset] = useState(false);
  const [ready, setReady] = useState(false);

	// hooks
	const { mutate: resetPassword, isPending } = useResetPass();
	const navigate = useNavigate();

	// react hook form
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		mode: "onChange",
	});

  useEffect(() => {
    if (!loading) {
      if (recoveryMode) {
        setReady(true);
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [recoveryMode, loading, navigate]);

	const password = watch("password");

	// password strength + requirements
	const requirements = useMemo(() => {
		const v = password || "";
		return {
			length: v.length >= 8,
			upper: /[A-Z]/.test(v),
			lower: /[a-z]/.test(v),
			number: /\d/.test(v),
			special: /[^A-Za-z0-9]/.test(v),
		};
	}, [password]);

	const strength = useMemo(() => {
		const score = Object.values(requirements).filter(Boolean).length;
		return score; // 0-5
	}, [requirements]);

	const onSubmit = (form_data) => {
		resetPassword(form_data.password, {
			onSuccess: () => {
				setPasswordReset(true);
				toast.success("Password reset successfully!");
			},
			onError: (err) => {
				let uiMessage = "Failed to reset password.";

				if (err.message?.includes("session")) {
					uiMessage = "Reset link expired or invalid. Please request a new one.";
				} else if (err.message?.includes("password")) {
					uiMessage = "Password does not meet security requirements.";
				} else if (err.message) {
					uiMessage = err.message;
				}

				setError("root", { message: uiMessage });
				toast.error(uiMessage);
			},
		});
	};

	const handleGoToLogin = () => {
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
							alt="Reset password background illustration"
							className="w-full h-full object-cover"
						/>
					</figure>

					<div className="card-body w-full md:w-1/2 justify-center">
						{!ready ? (
							<div className="text-center space-y-6">
								<div className="flex justify-center">
									<span className="loading loading-spinner loading-lg text-primary"></span>
								</div>
								<h2 className="text-2xl font-semibold text-base-content">
									Verifying Reset Link...
								</h2>
								<p className="text-gray-500 text-sm">
									Please wait while we verify your password reset request.
								</p>
							</div>
						) : !passwordReset ? (
							<>
								<h2 className="text-4xl font-bold text-center text-base-content mb-2">
									Reset Password
								</h2>
																<p className="text-center text-gray-500 text-sm mb-6">
																		Enter your new password below.
																</p>

																{/* Strength meter */}
																<div className="mb-2">
																	<div className="flex items-center justify-between mb-1">
																		<span className="text-xs text-gray-500">Password strength</span>
																		<span className="text-xs text-gray-500">
																			{strength <= 2 ? "Weak" : strength === 3 ? "Fair" : strength === 4 ? "Good" : "Strong"}
																		</span>
																	</div>
																	<progress
																		className={`progress w-full ${strength <= 2 ? "progress-error" : strength === 3 ? "progress-warning" : "progress-success"}`}
																		value={Math.max(5, strength * 20)}
																		max="100"
																	/>
																	<ul className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
																		<li className={requirements.length ? "text-success" : ""}>• At least 8 characters</li>
																		<li className={requirements.upper ? "text-success" : ""}>• Uppercase letter</li>
																		<li className={requirements.lower ? "text-success" : ""}>• Lowercase letter</li>
																		<li className={requirements.number ? "text-success" : ""}>• Number</li>
																		<li className={requirements.special ? "text-success" : ""}>• Special character</li>
																	</ul>
																</div>

								<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
									{/* New Password Field */}
									<div className="relative w-full">
										<LockOutlinedIcon
											fontSize="small"
											className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none"
										/>
										<input
											type={showPassword ? "text" : "password"}
											placeholder="New Password..."
											autoComplete="new-password"
											className={`input input-bordered w-full pl-10 pr-10 ${
												errors.password ? "input-error" : ""
											}`}
											{...register("password", {
												required: "Password is required",
												validate: (v) => {
												  if (!v || v.length < 8) return "At least 8 characters";
												  if (!/[A-Z]/.test(v)) return "Include an uppercase letter";
												  if (!/[a-z]/.test(v)) return "Include a lowercase letter";
												  if (!/\d/.test(v)) return "Include a number";
												  if (!/[^A-Za-z0-9]/.test(v)) return "Include a special character";
												  return true;
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
											{showPassword ? (
												<VisibilityOffOutlinedIcon />
											) : (
												<VisibilityOutlinedIcon />
											)}
										</button>
									</div>
									{errors.password && (
										<p className="text-red-500 text-sm">{errors.password.message}</p>
									)}

									{/* Confirm Password Field */}
									<div className="relative w-full">
										<LockOutlinedIcon
											fontSize="small"
											className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none"
										/>
										<input
											type={showConfirmPassword ? "text" : "password"}
											placeholder="Confirm Password..."
											autoComplete="new-password"
											className={`input input-bordered w-full pl-10 pr-10 ${
												errors.confirmPassword ? "input-error" : ""
											}`}
											{...register("confirmPassword", {
												required: "Please confirm your password",
												validate: (value) =>
													value === password || "Passwords do not match",
												onChange: () => clearErrors("root"),
											})}
										/>
										<button
											title="Show Confirm Password"
											type="button"
											onClick={() => setShowConfirmPassword((prev) => !prev)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
										>
											{showConfirmPassword ? (
												<VisibilityOffOutlinedIcon />
											) : (
												<VisibilityOutlinedIcon />
											)}
										</button>
									</div>
									{errors.confirmPassword && (
										<p className="text-red-500 text-sm">
											{errors.confirmPassword.message}
										</p>
									)}

									{/* Server error */}
									{errors.root && (
										<p className="text-red-600 text-center text-sm">
											{errors.root.message}
										</p>
									)}

									<button
										title="Reset Password"
										type="submit"
										disabled={isPending}
										className="btn btn-primary w-full"
									>
										{isPending ? (
											<>
												<span className="loading loading-ball loading-sm mr-2"></span>
												Resetting...
											</>
										) : (
											"Reset Password"
										)}
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
									Password Reset Successful!
								</h2>
								<p className="text-gray-600">
									Your password has been successfully reset.
								</p>
								<p className="text-gray-500 text-sm">
									You can now login with your new password.
								</p>
								<button
									title="Go to Login"
									type="button"
									onClick={handleGoToLogin}
									className="btn btn-primary w-full"
								>
									Go to Login
								</button>
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
};

export default ResetPassword;
