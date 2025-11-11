import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import { useCreateUser } from "../../backend/hooks/admin/useCreateUserLogin";

export default function AdminCreateUserForm() {
  const createUser = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    createUser.mutate(
      { email, password },
      {
        onSuccess: () => {
          form.reset();
          toast.success("User created successfully.");
        },
        onError: (err) => {
          console.error(err);
          toast.error(err.message || "Failed to create user")},
      }
    );
  };

  return (
    <section className="min-h-[60vh]">
      <Toaster position="bottom-right" />
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-2">
              <AdminPanelSettingsOutlinedIcon className="text-primary" />
              <h2 className="card-title">Create New User</h2>
            </div>
            <p className="text-sm text-base-content/70 mb-4">
              Create a login for a member, treasurer, or admin. Temporary passwords can be changed after first login.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="form-control">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <div className="relative">
                  <EmailOutlinedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    autoComplete="email"
                    className="input input-bordered w-full pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label" htmlFor="password">
                  <span className="label-text">Temporary Password</span>
                </label>
                <div className="relative">
                  <LockOutlinedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="input input-bordered w-full pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    title={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
                  >
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </button>
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">User can change this after first login.</span>
                </label>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="btn btn-primary w-full"
                >
                  {createUser.isPending ? (
                    <>
                      <span className="loading loading-ball loading-sm mr-2" />
                      Creating user...
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

  );
}
