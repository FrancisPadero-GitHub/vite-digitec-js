import { useState } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useAddMember } from "../../backend/hooks/useAddMembers";

const AddMember = () => {

  const { mutate: addMember, isPending, isError, error, isSuccess } = useAddMember();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({

    // MEMBER INFO
    f_name: "",
    m_name: "",
    l_name: "",
    account_type: "Regular",
    account_status: "Active",
    address: "",
    application_date: "",
    description: "",
    email: "",
    sex: "",
    contact_number: "",
    employment_date: "",
    birthday: "",

    // PAYMENT INITIAL
    membership_fee: 0,
    initial_share_capital: 0,
    fee_status: "Unpaid",
    payment_date: "",
    remarks: "",

    // Login Account
    loginEmail: "",
    password: "",

    // Avatar
    avatar: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["membership_fee", "initial_share_capital"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add Supabase insert logic here
    console.log("Submitting:", formData);
    addMember(formData);
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
    { label: "First Name", name: "first_name", type: "text" },
    { label: "Middle Name", name: "middle_name", type: "text" },
    { label: "Last Name", name: "last_name", type: "text" },
    {
      label: "Account Type",
      name: "account_type",
      type: "select",
      options: ["Regular", "Associate"],
    },
    {
      label: "Account Status",
      name: "account_status",
      type: "select",
      options: ["Active", "Inactive", "Pending"],
    },
    { label: "Application Date", name: "application_date", type: "date" },
    { label: "Description", name: "description", type: "text" },
    { label: "Email Address", name: "email", type: "email" },
    { label: "Sex", name: "sex", type: "select", options: ["Female", "Male"] },
    { label: "Contact Number", name: "contact_number", type: "text" },
    { label: "Employment Date", name: "employment_date", type: "date" },
    { label: "Birthday", name: "birthday", type: "date" },
    { label: "Home Address", name: "address", type: "text" },
  ];

  const membershipFields = [
    { label: "Membership Fee", name: "membership_fee", type: "number" },
    {
      label: "Initial Share Capital",
      name: "initial_share_capital",
      type: "number",
    },
    {
      label: "Fee Status",
      name: "fee_status",
      type: "select",
      options: ["Paid", "Unpaid", "Pending"],
    },
    { label: "Payment Date", name: "payment_date", type: "date" },
    { label: "Remarks", name: "remarks", type: "text" },
  ];

  const loginCredentials = [
    { label: "Email Address", name: "loginEmail", type: "text" },
    { label: "Password", name: "password", type: "text" },
    { label: "Confirm Password", name: "cpassword", type: "text" }
  ]

  return (
    <div className="min-h-screen py-5">
      <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-xl p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Register New Member</h1>
          <p className="text-base-content/70">
            Fill out the fields below to register a new member.
          </p>
        </header>

        {/* Tabs */}
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
            2. Membership & Payment
          </div>

          <div
            className={`tab ${activeTab === 2
              ? "tab-active"
              : "text-gray-500 pointer-events-none"
              }`}
          >
            2. Membership & Payment
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {isError && <p className="text-red-500">{error.message}</p>}
          {isSuccess && <p className="text-green-600">Member registered successfully!</p>}
          {isPending && <p>Saving member...</p>}


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
                <button type="submit" className="btn btn-success px-8" onClick={() => setActiveTab(2)}>
                  Next
                </button>
              </div>
            </>
          )}


          {activeTab === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loginCredentials.map(({ label, name, type }) => (
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
                          
                      >
                      </select>
                    ) : (
                      <input
                        id={name}
                        type={type}
                        name={name}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                        
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="btn btn-soft"
                  onClick={() => setActiveTab(1)}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-success px-8">
                  {isPending ? "Processing":"Register"}
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
