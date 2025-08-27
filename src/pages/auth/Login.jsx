import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../../backend/hooks/useLogin"; // ✅ no .ts

const Login = () => {
  const {
    email,
    password,
    showPassword,
    errorMsg,
    emailError,
    passwordError,
    mutation,
    setShowPassword,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useLogin();

  return (
    <div className="min-h-screen font-inter bg-base-200">
      <section className="min-h-screen flex justify-center items-center px-4">
        <div className="card max-w-xl w-full bg-base-100 shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-4">Login Here</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email input */}
            <input
              type="email"
              placeholder="EMAIL"
              className={`input input-bordered w-full ${emailError ? "input-error" : ""
                }`}
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

            {/* Password input with toggle */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                className={`input input-bordered w-full pr-10 ${passwordError ? "input-error" : ""
                  }`}
                value={password}
                onChange={handlePasswordChange}
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

            {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary w-full"
            >
              {mutation.isPending ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Login;
