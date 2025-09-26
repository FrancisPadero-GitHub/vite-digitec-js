import { useState } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useAddMember } from "../../backend/hooks/useAddMembers";
import { useNavigate } from "react-router";

const AddMember = () => {
  const navigate = useNavigate();
  const { mutate, isPending, isError, error, isSuccess } = useAddMember();
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({
    // MEMBER INFO
    f_name: "",
    m_name: "",
    l_name: "",
    account_type: "",
    account_status: "",
    address: "",
    application_date: "",
    email: "",
    sex: "",
    contact_number: "",
    employment_status: "",
    birthday: "",

    // PAYMENT INITIAL
    membership_fee: "",
    initial_share_capital: "",
    fee_status: "",
    payment_date: "",
    remarks: "",

    // Login Account
    loginEmail: "",
    password: "",
    cpassword: "",

    // Avatar
    avatar: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    /**
    * Sets the form data but it checks first if the value correctly corresponds to the value like
    * if membership_fee is indeed a value which is a number then proceeds to assign that value to
    * formData
    */
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["membership_fee", "initial_share_capital", "contact_number"].includes(name)
          ? Number(value)
          : value,
    }));
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

  // --- VALIDATION FUNCTIONS ---
  const validatePersonal = () => {
    let errors = {};
    if (!formData.f_name) errors.f_name = "First name is required";
    if (!formData.m_name) errors.m_name = "Middle name is required";
    if (!formData.l_name) errors.l_name = "Last name is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.account_type) errors.account_type = "Select account type";
    if (!formData.account_status)
      errors.account_status = "Select account status";
    if (!formData.application_date) errors.application_date = "Application date is required";
    if (!formData.contact_number)
      errors.contact_number = "Contact number required";
    if (!formData.sex) errors.sex = "sex is required";
    if (!formData.employment_status) errors.employment_status = "Employment status is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.birthday) errors.birthday = "Birthday required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateMembership = () => {
    const errors = {};
    if (!formData.membership_fee || formData.membership_fee <= 0)
      errors.membership_fee = "Membership fee must be greater than 0";
    if (!formData.initial_share_capital || formData.initial_share_capital <= 0)
      errors.initial_share_capital =
        "Initial share capital must be greater than 0";
    if (!formData.fee_status) errors.fee_status = "Select fee status";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLogin = () => {
    const errors = {};
    if (!formData.loginEmail) errors.loginEmail = "Login email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.loginEmail))
      errors.loginEmail = "Invalid email format";
    if (!formData.password || formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.cpassword)
      errors.cpassword = "Passwords do not match";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- TAB NAVIGATION ---
  // const handleNext = () => {
  //   if (activeTab === 0) validatePersonal() && setActiveTab(1)  ; // 
  //   else if (activeTab === 1) validateMembership() &&  setActiveTab(2) ; // 
  // };
  const handleNext = () => {
    if (activeTab === 0)  setActiveTab(1); // 
    else if (activeTab === 1) setActiveTab(2); // 
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // stop the page refresh that html normally does after form submission
    // if (validateLogin()) {
    //   // console.log("Submitting:", formData);
    //   mutate(formData); // execute the custom hook
    // }

    mutate(formData); // execute the custom hook
    navigate("/admin")
  };

  // Fields
  const personalFields = [
    { label: "First Name", name: "f_name", type: "text" },
    { label: "Middle Name", name: "m_name", type: "text" },
    { label: "Last Name", name: "l_name", type: "text" },
    {
      label: "Account Type",
      name: "account_type",
      type: "select",
      options: ["Admin", "Regular", "Associate", "Treasurer", "Board"],
    },
    {
      label: "Account Status",
      name: "account_status",
      type: "select",
      options: ["Active", "Inactive", "Pending"],
    },
    { label: "Application Date", name: "application_date", type: "date" },
    { label: "Email Address", name: "email", type: "email" },
    {
      label: "Sex",
      name: "sex",
      type: "select",
      options: ["Female", "Male"],
    },
    { label: "Contact Number", name: "contact_number", type: "number" },
    {
      label: "Employment Status",
      name: "employment_status",
      type: "select",
      options: ["Employed", "Unemployed", "Student"],
    },
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
    { label: "Password", name: "password", type: "password" },
    { label: "Confirm Password", name: "cpassword", type: "password" },
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
          <div className={`tab ${activeTab === 0 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
            1. Personal Info
          </div>
          <div className={`tab ${activeTab === 1 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
            2. Membership
          </div>
          <div className={`tab ${activeTab === 2 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
            2. Login Credentials
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {isError && <p className="text-red-500">{error.message}</p>}
          {isSuccess && (
            <p className="text-green-600">Member registered successfully!</p>
          )}
          {isPending && <p>Saving member...</p>}

          {/* PERSONAL DETAILS TAB */}
          {activeTab === 0 && (
            <>
              {/* Avatar Upload */}
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

              {/* Inputs */}
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
                        className={`select select-bordered w-full ${formErrors[name] ? "select-error" : ""
                          }`}

                      >
                        <option value="" className="label" disabled>Select {label}</option>
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
                        className={`input input-bordered w-full ${formErrors[name] ? "input-error" : ""
                          }`}

                      />
                    )}
                    {formErrors[name] && (
                      <p className="text-red-500 text-sm">{formErrors[name]}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="btn btn-primary px-8"
                  onClick={handleNext}
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
                        className={`select select-bordered w-full ${formErrors[name] ? "select-error" : ""
                          }`}

                      >
                        <option value="" className="label" disabled>Select {label}</option>
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
                        className={`input input-bordered w-full ${formErrors[name] ? "input-error" : ""
                          }`}

                      />
                    )}
                    {formErrors[name] && (
                      <p className="text-red-500 text-sm">{formErrors[name]}</p>
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
                <button
                  type="button"
                  className="btn btn-success px-8"
                  onClick={handleNext}
                >
                  Next
                </button>
                {/* <button
                  type="submit"
                  className="btn btn-success px-8"
                  disabled={isPending}
                >
                  {isPending ? "Processing..." : "Register"}
                </button> */}
              </div>
            </>
          )}

          {/* LOGIN CREDENTIALS TAB  */}
          {activeTab === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loginCredentials.map(({ label, name, type }) => (
                  <div key={name} className="form-control w-full">
                    <label htmlFor={name} className="label">
                      <span className="label-text font-medium">{label}</span>
                    </label>
                    <input
                      id={name}
                      type={type}
                      name={name}
                      value={formData[name] || ""}
                      onChange={handleChange}
                      className={`input input-bordered w-full ${formErrors[name] ? "input-error" : ""
                        }`}
                      
                    />
                    {formErrors[name] && (
                      <p className="text-red-500 text-sm">{formErrors[name]}</p>
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
                <button
                  type="submit"
                  className="btn btn-success px-8"
                  disabled={isPending}
                >
                  {isPending ? "Processing..." : "Register"}
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
