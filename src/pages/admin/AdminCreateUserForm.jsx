import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";

// mutation edge function
import { useCreateUser } from "../../backend/hooks/admin/useCreateUserLogin";

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";

// constants
import placeHolderAvatar from "../../assets/placeholder-avatar.png";

// This page allows admin to create a new user login for a member

export default function AdminCreateUserForm() {
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];

  const createUser = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const filteredMembers =
    debouncedQuery === ""
      ? members.filter((m) => !m.login_id && m.account_status === "Active") // Only members without login_id and is active
      : members
          .filter((m) => !m.login_id && m.account_status === "Active") // Only members without login_id and is active
          .filter((m) =>
            `${m.account_number} ${m.f_name} ${m.l_name} ${m.account_role}`
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase())
          );

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      accountNo: "",
    },
  });

  const onSubmit = async (values) => {
    // Ensure passwords match (form validation covers this too)
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    createUser.mutate(
      {
        email: values.email,
        password: values.password,
        account_number: values.accountNo,
      },
      {
        onSuccess: () => {
          reset();
          toast.success("User created successfully.");
        },
        onError: (err) => {
          console.error(err);
          toast.error(err.message || "Failed to create user");
        },
      }
    );
  };

  return (
    <section className="m-3">
      <Toaster position="bottom-right" />
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-2">
              <AdminPanelSettingsOutlinedIcon className="text-primary" />
              <h2 className="card-title">Create user login credentials</h2>
            </div>
            <p className="text-sm text-base-content/70 mb-4">
              Create a login for a member, treasurer, or admin. Temporary
              passwords can be changed after login.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Member Combobox */}
              <div className="form-control w-full">
                <label className="label text-sm font-semibold mb-2">
                  Member Account
                </label>

                <Controller
                  name="accountNo"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <AccountCircleIcon
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 z-10"
                        fontSize="inherit"
                      />
                      <Combobox
                        value={
                          members.find(
                            (m) => m.account_number === field.value
                          ) || null
                        }
                        onChange={(member) =>
                          field.onChange(member?.account_number)
                        }
                      >
                        <ComboboxInput
                          required
                          className="input input-bordered w-full pl-10"
                          placeholder="Search by Account Number or Name..."
                          displayValue={(member) =>
                            member ? member.account_number : ""
                          }
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        <ComboboxOptions className="absolute z-[800] w-full mt-1 rounded-lg bg-base-100 shadow-lg max-h-60 overflow-auto border border-base-200">
                          {filteredMembers.length === 0 ? (
                            <div className="px-4 py-2 text-base-content/60">
                              No members found.
                            </div>
                          ) : (
                            filteredMembers.map((member) => (
                              <ComboboxOption
                                key={member.account_number}
                                value={member}
                                className={({ active }) =>
                                  `px-4 py-2 cursor-pointer transition-colors duration-150 ${
                                    active
                                      ? "bg-primary/90 text-primary-content"
                                      : ""
                                  }`
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <div className="avatar">
                                    <div className="mask mask-circle w-10 h-10">
                                      <img
                                        src={
                                          member.avatar_url || placeHolderAvatar
                                        }
                                        alt={`${member.f_name} ${member.l_name}`}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-mono text-sm font-semibold">
                                      {member.account_number}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm truncate">
                                        {member.f_name} {member.l_name}
                                      </span>
                                      <span className="text-xs italic">
                                        ({member.account_role})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </ComboboxOption>
                            ))
                          )}
                        </ComboboxOptions>
                      </Combobox>
                    </div>
                  )}
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <div className="relative">
                  <EmailOutlinedIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 z-10"
                    fontSize="inherit"
                  />
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        autoComplete="email"
                        className={`input input-bordered w-full pl-10 ${errors.email ? "input-error" : ""}`}
                      />
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label" htmlFor="password">
                  <span className="label-text">Temporary Password</span>
                </label>
                <div className="relative">
                  <LockOutlinedIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 z-10"
                    fontSize="inherit"
                  />
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? "input-error" : ""}`}
                      />
                    )}
                  />
                  <button
                    type="button"
                    title={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content z-10"
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon fontSize="medium" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="medium" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-control">
                <label className="label" htmlFor="confirmPassword">
                  <span className="label-text">Confirm Temporary Password</span>
                </label>
                <div className="relative">
                  <LockOutlinedIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 z-10"
                    fontSize="inherit"
                  />
                  <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                      required: "Please confirm the password",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-type temporary password"
                        autoComplete="new-password"
                        className={`input input-bordered w-full pl-10 pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
                      />
                    )}
                  />
                  <button
                    type="button"
                    title={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content z-10"
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon fontSize="medium" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="medium" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
                <label className="label">
                  <span className="text-xs label-text-alt text-base-content/60">
                    User can change this after login.
                  </span>
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
                      Saving login credentials...
                    </>
                  ) : (
                    "Save "
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
