import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";

// fetch hooks
import { useMembers } from "../../backend/hooks/shared/useFetchMembers";

// mutation edge function
import { useCreateUser } from "../../backend/hooks/admin/useCreateUserLogin";

// utils
import { useDebounce } from "../../backend/hooks/treasurer/utils/useDebounce";

// constants
import placeHolderAvatar from "../../assets/placeholder-avatar.png"

export default function AdminCreateUserForm() {
  const { data: members_data } = useMembers({});
  const members = members_data?.data || [];

  const createUser = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const filteredMembers =
    debouncedQuery === ""
      ? members.filter((m) => !m.login_id) // Only members without login_id
      : members
        .filter((m) => !m.login_id) // Only members without login_id
        .filter((m) =>
          `${m.account_number} ${m.f_name} ${m.l_name} ${m.account_role}`
            .toLowerCase()
            .includes(debouncedQuery.toLowerCase())
        );


  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      email: "",
      password: "",
      accountNo: "",
    },
  });

  const onSubmit = async (values) => {
    if (values.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    // console.log(values)
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
    <section className="p-6 lg:p-8">
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Member Combobox */}
              <div className="form-control w-full">
                <label className="label text-sm font-semibold mb-2">Member Account</label>
                <Controller
                  name="accountNo"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      value={members.find((m) => m.account_number === field.value) || null}
                      onChange={(member) => field.onChange(member?.account_number)}
                    >
                      <ComboboxInput
                        required
                        className="input input-bordered w-full"
                        placeholder="Search by Account Number or Name..."
                        displayValue={(member) => (member ? member.account_number : "")}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <ComboboxOptions className="absolute z-[800] w-[93%] mt-1 rounded-lg bg-base-100 shadow-lg max-h-[50vh] overflow-auto border border-base-200">
                        {filteredMembers.length === 0 ? (
                          <div className="px-4 py-2 text-base-content/60">No members found.</div>
                        ) : (
                          filteredMembers.map((member) => (
                            <ComboboxOption
                              key={member.account_number}
                              value={member}
                              className={({ active }) =>
                                `px-4 py-2 cursor-pointer transition-colors duration-150 ${active ? "bg-primary/90 text-primary-content" : ""
                                }`
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div className="avatar">
                                  <div className="mask mask-circle w-10 h-10">
                                    <img
                                      src={member.avatar_url || placeHolderAvatar}
                                      alt={`${member.f_name} ${member.l_name}`}
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-mono text-sm font-semibold">{member.account_number}</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm truncate">{member.f_name} {member.l_name}</span>
                                    <span className="text-xs italic">({member.account_role})</span>
                                  </div>
                                </div>
                              </div>
                            </ComboboxOption>
                          ))
                        )}
                      </ComboboxOptions>
                    </Combobox>
                  )}
                />
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <div className="relative">
                  <EmailOutlinedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" />
                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        autoComplete="email"
                        className="input input-bordered w-full pl-10"
                        required
                      />
                    )}
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
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: true, minLength: 6 }}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        className="input input-bordered w-full pl-10 pr-10"
                      />
                    )}
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
