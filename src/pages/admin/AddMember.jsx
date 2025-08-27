import { useState } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const AddMember = () => {
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({

    memberName: "",
    avatar: "",
    memberType: "Regular",
    shareCapital: 0,
    birthdate: "",
    sex: "",
    address: "",
    contactNumber: "",
    email: "",
    employmentStatus: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "shareCapital" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add Supabase insert logic here
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setPreviewAvatar(result);
        setFormData((prev) => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ALL NECESSARY INPUT FIELDS
  const personalFields = [
    { label: "Name", name: "memberName", type: "text" },
    { label: "Sex", name: "sex", type: "select", options: ["Female", "Male"] },
    { label: "Birthdate", name: "birthdate", type: "date" },
    { label: "Email Address", name: "email", type: "email" },
    { label: "Contact Number", name: "contactNumber", type: "text" },
    { label: "Home Address" , name: "address", type: "text" },
    {
      label: "Employment Status",
      name: "employmentStatus",
      type: "select",
      options: ["Employed", "Self-Employed", "Retired", "Unemployed"],
    },
  ];

  const membershipFields = [
    {
      label: "Membership Type",
      name: "memberType",
      type: "select",
      options: ["Regular", "Associate"],
    },
    { label: "Initial Share Capital", name: "shareCapital", type: "number" },
  ];

  return (
    <div className="min-h-screen py-5">
      <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-xl p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Register New Member</h1>
          <p className="text-base-content/70">
            Fill out the fields below to register a new member.
          </p>
        </header>

        <div className="tabs tabs-border mb-6">
          <div
            className={`tab ${activeTab === 0
              ? "tab-active"
              : "text-gray-500 pointer-events-none"
              }`}
          >
            1. Personal Info
          </div>
          <div
            className={`tab ${activeTab === 1
              ? "tab-active"
              : "text-gray-500 pointer-events-none"
              }`}
          >
            2. Membership
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PERSONAL DETAILS TAB */}
          {activeTab === 0 && (
            <>
              <div className="flex justify-center mb-6">
                <div className="avatar cursor-pointer relative group">
                  <div className="w-24 h-24 rounded-full ring ring-neutral ring-offset-base-100 ring-offset-2 overflow-hidden">
                    <img
                      src={previewAvatar || "/src/assets/placeholder-avatar.png"}
                      alt="User avatar"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md">
                    <CameraAltIcon fontSize="small" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* It will loop through the array and display only necessary fields that exists on that array */}
                {personalFields.map(({ label, name, type, options }) => (
                  <div key={name} className="form-control w-full">
                    <label htmlFor={name} className="label">
                      <span className="label-text font-medium">{label}</span>
                    </label>
                    {type === "select" ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        className="select select-bordered w-full"
                        required
                      >
                        {options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={name}
                        type={type}
                        name={name}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        required
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-primary px-8"
                  onClick={() => setActiveTab(1)}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* MEMBERSHIP DETAILS TAB */}
          {activeTab === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {membershipFields.map(({ label, name, type, options }) => (
                  <div key={name} className="form-control w-full">
                    <label htmlFor={name} className="label">
                      <span className="label-text font-medium">{label}</span>
                    </label>
                    {type === "select" ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        className="select select-bordered w-full"
                        required
                      >
                        {options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={name}
                        type={type}
                        name={name}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        required={name !== "avatar"}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="btn btn-soft"
                  onClick={() => setActiveTab(0)}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-success px-8">
                  Register
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddMember;
