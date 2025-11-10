import { useState, useEffect } from "react";
import { Edit, Check, VerifiedUserOutlined } from "@mui/icons-material";

// fetch hooks
import { useFetchProfile } from "../../backend/hooks/member/useFetchProfile";
import { useFetchCoop } from "../../backend/hooks/shared/useFetchCoop";

// mutation hooks
import { useUpdateProfile } from "../../backend/hooks/member/useUpdateProfile";
import { useChangePassword } from "../../backend/hooks/member/useChangePassword";

// assets 
import placeholderAvatar from "../../assets/placeholder-avatar.png";

// utils
import { display } from "../../constants/numericFormat";

const tips = [
  "Use a strong, unique password",
  "Don't reuse passwords across sites",
  "Consider using a password manager",
];

// Form fields mapped to your `members` table
const formFields = [
  { name: "f_name", label: "First Name" },
  { name: "m_name", label: "Middle Name" },
  { name: "l_name", label: "Last Name" },
  { name: "birthday", label: "Birthday", type: "date" },  
  { name: "email", label: "Email", type: "email", colSpan: "sm:col-span-2" },
  { name: "contact_number", label: "Contact Number" },
  { name: "civil_status", label: "Civil Status", type: "select", options: ["Single", "Married", "Widowed", "Separated"] },
  
  { name: "place_of_birth", label: "Place of Birth", colSpan: "sm:col-span-2" },

  
  { name: "block_no", label: "Block / Street", },
  { name: "barangay", label: "Barangay", },
  { name: "city_municipality", label: "City / Municipality", },
  { name: "province", label: "Province", },
  { name: "zip_code", label: "ZIP Code", colSpan: "sm:col-span-1" },

  { name: "spouse_name", label: "Spouse Name" },
  { name: "number_of_children", label: "Number of Children", type: "number" },
  { name: "office_name", label: "Office Name" },
  { name: "title_and_position", label: "Title / Position" },
  { name: "office_contact_number", label: "Office Contact Number" },
  { name: "office_address", label: "Office Address", colSpan: "sm:col-span-2" },
];

// function to get membership duration in months based on joined_date
function calculateMembershipMonths(joined_date) {
  if (!joined_date) return 0;
  const joined = new Date(joined_date);
  const now = new Date();
  const years = now.getFullYear() - joined.getFullYear();
  const months = now.getMonth() - joined.getMonth();
  return years * 12 + months;
}

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // use query hook to fetch profile data (and coop data for total share capital)
  const { data: myProfile, isLoading, isError } = useFetchProfile();
  const { data: coopData } = useFetchCoop();

  const coopContributions = coopData?.data || [];
  // Calculate total share capital
  const totalShareCapital = coopContributions.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  // mutation hook to update profile
  const { mutate: updateProfile} = useUpdateProfile();
  const [saving, setSaving] = useState(false);

  // for displaying membership months and age
  const membershipMonths = calculateMembershipMonths(myProfile?.application_date);

  // form data state
  const [formData, setFormData] = useState({});


  // Password change states
  const changePassword = useChangePassword(); // <-- our mutation hook
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("");


  // Prefill form data when profile is fetched
  useEffect(() => {
    if (myProfile) {
      setFormData(myProfile);
    }
  }, [myProfile]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar file selection
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewAvatar(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    // Check confirm
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setPasswordError("");

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: (data) => {
          setSuccess(data.message)
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => {
          setPasswordError(err.message);
        },
      }
    );
  };

  // Save profile changes
  const handleSave = () => {
    setSaving(true);
    updateProfile(
      { ...formData, avatarFile },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSaving(false)
          setPreviewAvatar(null); // clear only when DB + cache updated
        },
      }
    );
  };

if (isLoading) return <div>Loading...</div>
if (isError) return <div>Something went wrong, try refreshing</div>

  return (
    <div className="min-h-screen p-3 md:p-1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT COLUMN - PROFILE */}
        <div className="space-y-6">
          <section className="card bg-base-100 shadow">
            <div className="bg-primary text-primary-content text-center p-6 rounded-t">
              <div className="flex justify-center mb-2">
                <div className="relative w-28 h-28">
                  <img
                    src={previewAvatar || myProfile?.avatar_url || placeholderAvatar}
                    className="rounded-full ring-4 ring-base-200 w-full h-full object-cover"
                  />
                  {isEditing && (
                    <label
                      htmlFor="avatarUpload"
                      className="absolute bottom-0 right-0 bg-base-100 rounded-full p-1 cursor-pointer hover:bg-base-200 transition-colors"
                    >
                      <Edit fontSize="small" className="text-gray-500" />
                      <input
                        id="avatarUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-semibold">
                {`${myProfile?.f_name ?? ""} ${myProfile?.m_name ?? ""} ${myProfile?.l_name ?? ""}`}
              </h2>

              <span className="badge badge-neutral">
                {myProfile?.account_type} Member
              </span>
              <p className="text-sm mt-2">
                Member Since:{" "}
                {myProfile?.application_date
                  ? new Date(myProfile.application_date).toLocaleDateString()
                  : ""}
              </p>
            </div>
            <div className="card-body p-4 grid grid-cols-3 text-center">
              <div>
                <h3 className="text-lg font-bold">{myProfile?.account_number}</h3>
                <p className="text-sm text-gray-500">ID NO.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold">₱ {display(totalShareCapital)}</h3>
                <p className="text-sm text-gray-500">Share Capital</p>
              </div>
              <div>
                <h3 className="text-lg font-bold">{membershipMonths} mos</h3>
                <p className="text-sm text-gray-500">Membership</p>
              </div>
            </div>
          </section>

          {/* SECURITY TIPS */}
          <section className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title text-lg flex items-center gap-2">
                <VerifiedUserOutlined color="info" /> Security Tips
              </h3>
              {tips.map((tip, i) => (
                <ul key={i} className="text-sm space-y-2 mt-2">
                  <li className="flex items-start gap-2">
                    <Check fontSize="small" color="success" /> {tip}
                  </li>
                </ul>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN - EDIT PROFILE */}
        <div className="md:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-xl">Edit Profile</h2>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-primary text-white">
                    <Edit fontSize="small"/> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-ghost">
                      Cancel
                    </button>

                    <button onClick={handleSave} className="btn btn-sm btn-primary text-white" disabled={saving}>
                      {saving ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                )}

              </div>

              {/* FORM FIELDS */}
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {formFields.map((field) => {
                  const { name, label, type = "text", colSpan, options } = field;
                  const value = formData[name] ?? "";

                  return (
                    <div
                      key={name}
                      className={`form-control ${colSpan || ""}`}
                    >
                      <label className="label">
                        <span className="label-text">{label}</span>
                      </label>

                      {type === "select" ? (
                        <select
                          name={name}
                          value={value}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`select select-bordered w-full ${!isEditing ? "bg-base-200" : ""
                            }`}
                        >
                          <option value="">Select</option>
                          {options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={isEditing ? type : name === "birthday" ? "text" : type}
                          name={name}
                          value={
                            name === "birthday" && !isEditing && value
                              ? new Date(value).toLocaleDateString()
                              : value
                          }
                          onChange={handleInputChange}
                          readOnly={!isEditing}
                          className={`input input-bordered w-full ${!isEditing ? "bg-base-200" : ""
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </form>
            </div>
          </div>

          {/* CHANGE PASSWORD CARD */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Change Password</h2>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Current Password</span></label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">New Password</span></label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Confirm New Password</span></label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {passwordError && (<div className="text-error text-sm">{passwordError}</div>)}

                {success && (<div className="text-success text-sm">{success}</div>)}

                <div className="card-actions justify-end mt-6">
                  <button type="submit" className="btn btn-primary hover:btn-neutral text-white">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

export default Profile;
