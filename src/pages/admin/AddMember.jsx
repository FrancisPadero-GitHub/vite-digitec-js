import { useState, Fragment } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";

// mutation hooks
import { useAddMember } from "../../backend/hooks/admin/useAddMembers";

// icons
import CameraAltIcon from "@mui/icons-material/CameraAlt";

// assets
import placeholderAvatar from "../../assets/placeholder-avatar.png";

function AddMember (){
  // functions
  const navigate = useNavigate();

  // custom states
  const { mutate: add_member, isPending, isError, error, isSuccess } = useAddMember();

  // states
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // variables
  const today = new Date().toISOString().split("T")[0];

  // used react hook form instead of manual usestate and onchange handlers
  //register links input fields to useForm; trigger validates specific fields; formState.errors track validation errors
  const {register, handleSubmit, trigger, formState: { errors }} = useForm({
    defaultValues: {
      f_name: "",
      m_name: "",
      l_name: "",
      civil_status: "",
      birthday: "",
      place_of_birth: "",
      street_no: "",
      barangay: "",
      city_municipality: "",
      province: "",
      zip_code: "",
      contact_number: "",
      email: "",
      spouse_name: "",
      number_of_children: "0",
      office_name: "",
      title_and_position: "",
      office_address: "",
      office_contact_number: "",
      account_role: "",
      account_status: "",
      application_date: today,
      joined_date: today,
      membership_fee: "",
      membership_fee_status: "",
      membership_payment_method: "",
      membership_payment_date: today,
      membership_remarks: "Membership Initial",
      initial_share_capital: "",
      share_capital_payment_method: "",
      share_capital_payment_date: today,
      share_capital_remarks: "Membership Initial",
      avatarFile: null
    }
  });

  // handle avatar upload/preview outside rhf since it handles file input
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert("Image must be smaller than 2MB");
      return;
    }
    setPreviewAvatar(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  // tab navigation with validation
  const handleNext = async (fields) => {
    const valid = await trigger(fields); //only validate fields in current tab
    if (valid) setActiveTab((prev) => prev + 1); //only move on to next tab if all fields are okey
  };

  // form submission
  const onSubmit = (data) => {
    // Prevent double submission
    if (isPending) {
      return;
    }

    // console.log("data", data )
    const normalized = { //normalize date fields before sending it to backend
      ...data,
      birthday: data.birthday ? new Date(data.birthday).toISOString() : null,
      application_date: data.application_date ? new Date(data.application_date).toISOString() : null,
      membership_payment_date: data.membership_payment_date ? new Date(data.membership_payment_date).toISOString() : null,
      share_capital_payment_date: data.share_capital_payment_date ? new Date(data.share_capital_payment_date).toISOString() : null,
      avatarFile,
    };

    add_member(normalized, {
      onSuccess: () => {
        toast.success("Member registered successfully")
        setTimeout(() => navigate("/admin"), 1500);
        },
      onError: (err) => console.error("Failed to submit:", err.message),
    });
  };

  // Personal fields
  const personalFields = [
    { label: "First Name", name: "f_name", type: "text", required: true, autoComplete: "given-name" },
    { label: "Middle Name", name: "m_name", type: "text", required: false, autoComplete: "additional-name" },
    { label: "Last Name", name: "l_name", type: "text", required: true, autoComplete: "family-name" },

    {
      label: "Civil Status", name: "civil_status", type: "select",
      options: ["Single", "Married", "Widowed", "Separated"], required: true, autoComplete: "off"
    },

    { label: "Birthday", name: "birthday", type: "date", required: true, autoComplete: "off" },
    { label: "Place of Birth", name: "place_of_birth", type: "text", autoComplete: "address-level2" },

    { label: "Contact Number", name: "contact_number", type: "text", required: true, pattern: /^[0-9+()\-.\s]+$/, autoComplete: "tel" },
    { label: "Email Address", name: "email", type: "email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, autoComplete: "email" },

    // Address grouped together
    { label: "Block No., Lot No., Phase No., Subdivision", name: "block_no", type: "text", required: true, group: "Address", autoComplete: "address-line1" },
    { label: "Barangay", name: "barangay", type: "text", required: true, group: "Address", autoComplete: "address-line2" },
    { label: "City / Municipality", name: "city_municipality", type: "text", required: true, group: "Address", autoComplete: "address-level2" },
    { label: "Province", name: "province", type: "text", required: true, group: "Address", autoComplete: "address-level1" },
    { label: "ZIP Code", name: "zip_code", type: "text", inputMode: "numeric", required: true, pattern: /^[0-9]{4}$/, maxLength: 4, autoComplete: "postal-code" },

    // Dependents grouped together
    { label: "Spouse Name", name: "spouse_name", type: "text", group: "Dependents", autoComplete: "off" },
    { label: "Number of Children", name: "number_of_children", type: "select", group: "Dependents", options: Array.from({ length: 11 }, (_, i) => i), autoComplete: "off" }
    ];

  // Employment fields
  const employmentFields = [
    { label: "Name of Office / Line of Business", name: "office_name", type: "text", required: true, autoComplete: "organization" },
    { label: "Title & Position", name: "title_and_position", type: "text", required: true, autoComplete: "organization-title" },
    { label: "Office Address", name: "office_address", type: "text", required: false, autoComplete: "street-address" },
    { label: "Office Contact Number", name: "office_contact_number", type: "text", required: false, pattern: /^[0-9+()\-.\s]+$/, autoComplete: "tel" }
  ];

  // Membership fields
  const membershipFields = [
    { label: "Account Role", name: "account_role", type: "select", autoComplete: "off",
      options: [
        { label: "Regular", value: "regular-member" },
        { label: "Associate", value: "associate-member" },
        { label: "Treasurer", value: "treasurer" },
        { label: "Board", value: "board" },
      ], required: true, group: "Account Info" },
      
    {
      label: "Account Status", name: "account_status", type: "select", autoComplete: "off",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "Pending", value: "Pending" },
      ],
      required: true, group: "Account Info"
    },

    { label: "Application Date", name: "application_date", type: "date", required: true, group: "Account Info" },
    { label: "Joined Date", name: "joined_date", type: "date", required: false, group: "Account Info" },

    // Membership Fee
    { label: "Membership Fee", name: "membership_fee", type: "number", group: "Membership Fee", required: false },
    {
      label: "Fee Status", name: "membership_fee_status", type: "select", autoComplete: "off",
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Unpaid", value: "Unpaid" },
        { label: "Partial", value: "Partial" },
      ],
      group: "Membership Fee", required: false
    },

    {
      label: "Payment Method", name: "membership_payment_method", type: "select", autoComplete: "off",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ],
      group: "Membership Fee", required: false
    },

    { label: "Payment Date", name: "membership_payment_date", type: "date", group: "Membership Fee", required: false },
    { label: "Remarks", name: "membership_remarks", type: "text", group: "Membership Fee", required: false },

    // Initial Share Capital
    { label: "Initial Share Capital Amount", name: "initial_share_capital", type: "number", group: "Share Capital", required: false },
    {
      label: "Payment Method", name: "share_capital_payment_method", type: "select", autoComplete: "off",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ],
      group: "Share Capital", required: false
    },

    { label: "Payment Date", name: "share_capital_payment_date", autoComplete: "off", type: "date", group: "Share Capital", required: false },
    { label: "Remarks", name: "share_capital_remarks", autoComplete: "off", type: "text", group: "Share Capital", required: false },
  ];

  return (
    <div className="m-3">
      <div className="space-y-3" > 
        <Toaster position="bottom-left" />
        <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold">Register New Member</h1>
            <p className="text-sm sm:text-base text-base-content/70">Fill out the fields below to register a new member.</p>
          </header>

          <div className="tabs tabs-border mb-4 sm:mb-6 flex-col sm:flex-row">
            <div className={`tab text-xs sm:text-sm ${activeTab === 0 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
              1. Personal Info
            </div>
            <div className={`tab text-xs sm:text-sm ${activeTab === 1 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
              2. Employment/Profession
            </div>
            <div className={`tab text-xs sm:text-sm ${activeTab === 2 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
              3. Membership
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-8">
            {isError && <p className="text-red-500">{error.message}</p>}
            {isSuccess && (<p className="text-green-600">Member registered successfully!</p>)}
            {isPending && (
              <div className="alert alert-info">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Saving member...</span>
              </div>
            )}

            {/* PERSONAL DETAILS TAB */}
            {activeTab === 0 && (
              <>
                {/* Avatar Upload */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="avatar cursor-pointer relative group">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring ring-neutral ring-offset-base-100 ring-offset-2 overflow-hidden">
                      <img
                        src={previewAvatar || placeholderAvatar}
                        alt="User avatar"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-base-100 rounded-full p-2 shadow-md text-base-content">
                      <CameraAltIcon fontSize="small" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload profile image"
                      onChange={handleAvatarUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {personalFields.map(({ label, name, type, options, group, autoComplete }, idx) => {
                  const prevGroup = idx > 0 ? personalFields[idx - 1].group : null;

                  return (
                    <Fragment key={name}>
                      {/* Section header: full width */}
                      {group && group !== prevGroup && (
                        <div className="col-span-1 md:col-span-2">
                          <h3 className="text-lg font-semibold mt-4 mb-2">{group}</h3>
                          <hr className="border-gray-300 mb-4" />
                        </div>
                      )}

                      {/* Field itself */}
                      <div className="form-control w-full col-span-1">
                        <label htmlFor={name} className="label"><span className="label-text text-sm sm:text-base font-medium">{label}</span></label>

                        {type === "select" ? (
                          <select
                            id={name}
                            autoComplete={autoComplete || "off"}
                            {...register(name, {required: personalFields.find(f => f.name === name)?.required ? `${label} is required` : false })}
                            className={`select select-bordered w-full text-sm sm:text-base ${errors[name] ? "select-error" : ""}`}
                          >
                            <option value="" disabled>Select {label}</option>
                            {options?.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                          </select>
                        ) : (
                          <input
                            id={name}
                            type={type}
                            autoComplete={autoComplete || "off"}
                            {...register(name, {
                              required: `${label} is required`,
                              pattern: name === "contact_number" ? {
                                value: /^[0-9+()\-.\s]+$/,
                                message: "Only numbers and symbols like +, -, (, ) allowed",
                              } : undefined
                            })}
                            onInput={name === "contact_number" ? (e) => {
                              e.target.value = e.target.value.replace(/[^0-9+()\-.\s]/g, "");
                            } : undefined}
                            className={`input input-bordered w-full text-sm sm:text-base ${errors[name] ? "input-error" : ""}`}
                          />
                        )}
                        {/* tracks invalid fields */}
                        {errors[name] && (<p className="text-red-500 text-sm">{errors[name].message}</p>)} 
                      </div>
                    </Fragment>
                  );
                })}
                </div>

                <div className="flex justify-end">
                  <button
                    title="Next Button"
                    type="button"
                    onClick={() => handleNext([
                      "f_name", "l_name", "civil_status", "birthday", "place_of_birth",
                      "block_no", "barangay", "city_municipality", "province", "zip_code",
                      "contact_number", "email"
                    ])}
                    className="btn btn-primary btn-sm sm:btn-md"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* EMPLOYMENT TAB */}
            {activeTab === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {employmentFields.map(({ label, name, type, autoComplete }) => (
                    <div key={name} className="form-control w-full">
                      <label htmlFor={name} className="label"><span className="label-text text-sm sm:text-base font-medium">{label}</span></label>

                      <input
                        id={name}
                        type={type}
                        autoComplete={autoComplete || "off"}
                        {...register(name, {
                          required: employmentFields.find(f => f.name === name)?.required ? `${label} is required` : false,
                          pattern: name === "office_contact_number" ? {
                            value: /^[0-9+()\-.\s]+$/,
                            message: "Only numbers and symbols like +, -, (, ) allowed",
                          } : undefined
                        })}
                        onInput={name === "office_contact_number" ? (e) => {
                          e.target.value = e.target.value.replace(/[^0-9+()\-.\s]/g, "");
                        } : undefined}
                        className={`input input-bordered w-full text-sm sm:text-base ${errors[name] ? "input-error" : ""}`}
                      />
                    
                      {errors[name] && (<p className="text-red-500 text-sm">{errors[name].message}</p>)}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button
                    title="Back Button"
                    type="button"
                    className="btn btn-soft btn-sm sm:btn-md"
                    onClick={() => setActiveTab(0)}
                  >
                    Back
                  </button>
                  <button
                    title="Next Button"
                    type="button"
                    onClick={() =>
                      handleNext([
                        "office_name",
                        "title_and_position",
                        "office_address",
                        "office_contact_number"
                      ])
                    }
                    className="btn btn-primary btn-sm sm:btn-md"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* MEMBERSHIP DETAILS TAB */}
            {activeTab === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {membershipFields.map(({ label, name, type, options, group, autoComplete }, idx) => {
                    const prevGroup = idx > 0 ? membershipFields[idx - 1].group : null;

                    // Divided into subsections (account info, membership fee, share capital)
                    return (
                      <Fragment key={name}>
                        {group && group !== prevGroup && (
                          <div className="col-span-1 md:col-span-2">
                            <h3 className="text-lg font-semibold mt-4 mb-2">{group}</h3>
                            <hr className="border-gray-300 mb-4" />
                          </div>
                        )}

                        {/* Field itself */}
                        <div className="form-control w-full col-span-1">
                          <label htmlFor={name} className="label"><span className="label-text text-sm sm:text-base font-medium">{label}</span></label>
                          {type === "select" ? (
                            <select
                              id={name}
                              autoComplete={autoComplete || "off"}
                              {...register(name, {
                                required: membershipFields.find(f => f.name === name)?.required
                                  ? `${label} is required`
                                  : false
                              })}
                              className={`select select-bordered w-full text-sm sm:text-base ${errors[name] ? "select-error" : ""}`}
                            >
                              <option value="" disabled>Select {label}</option>
                              {options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id={name}
                              type={type}
                              autoComplete={autoComplete || "off"}
                              {...register(name, {
                                required: membershipFields.find(f => f.name === name)?.required
                                  ? `${label} is required`
                                  : false
                              })}
                              className={`input input-bordered w-full text-sm sm:text-base ${errors[name] ? "input-error" : ""}`}
                            />
                          )}
                            {/* Validation message */}
                            {errors[name] && (<p className="text-red-500 text-sm">{errors[name].message}</p>)}
                        </div>
                      </Fragment>
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  <button 
                    title="Back Button"
                    type="button" 
                    className="btn btn-soft btn-sm sm:btn-md" 
                    onClick={() => setActiveTab(1)}
                    >Back
                  </button>
                  <button
                    title="Submit button"
                    type="submit"
                    disabled={isPending}
                    className="btn btn-success btn-sm sm:btn-md">
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMember;