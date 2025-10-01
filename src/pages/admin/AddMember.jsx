import { useState, Fragment } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useAddMember } from "../../backend/hooks/useAddMembers";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";

function AddMember (){
  const navigate = useNavigate();
  const { mutate, isPending, isError, error, isSuccess } = useAddMember();
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  // used react hook form instead of manual usestate and onchange handlers
  //register links input fields to useForm; trigger validates specific fields; formState.errors track validation errors
  const {register, handleSubmit, trigger, formState: { errors, isSubmitting }} = useForm({
    defaultValues: {
      f_name: "",
      m_name: "",
      l_name: "",
      civil_status: "",
      birthday: today,
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
      account_type: "",
      account_status: "",
      application_date: today,
      membership_fee: 0,
      initial_share_capital: 0,
      fee_status: "",
      payment_date: today,
      payment_method: "",
      remarks: "",
      avatarFile: null
    }
  });

  // handle avatar upload/preview outside rhf since it handles file input
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    const normalized = { //normalize date fields before sending it to backend
      ...data,
      birthday: data.birthday ? new Date(data.birthday).toISOString() : null,
      application_date: data.application_date ? new Date(data.application_date).toISOString() : null,
      payment_date: data.payment_date ? new Date(data.payment_date).toISOString() : null,
      avatarFile,
    };

    mutate(normalized, {
      onSuccess: () => navigate("/admin"),
      onError: (err) => console.error("Failed to submit:", err.message),
    });
  };

  // Personal fields
  const personalFields = [
    { label: "First Name", name: "f_name", type: "text", required: true },
    { label: "Middle Name", name: "m_name", type: "text" },
    { label: "Last Name", name: "l_name", type: "text", required: true },

    { label: "Civil Status", name: "civil_status", type: "select",
      options: ["Single", "Married", "Widowed", "Separated"], required: true },

    { label: "Birthday", name: "birthday", type: "date", required: true },
    { label: "Place of Birth", name: "place_of_birth", type: "text" },

    { label: "Contact Number", name: "contact_number", type: "text", required: true, pattern: /^[0-9+()\-.\s]+$/ },
    { label: "Email Address", name: "email", type: "email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },

    // Address grouped together
    { label: "Block No., Lot No., Phase No., Subdivision", name: "block_no", type: "text", required: true, group: "Address" },
    { label: "Barangay", name: "barangay", type: "text", required: true, group: "Address" },
    { label: "City / Municipality", name: "city_municipality", type: "text", required: true, group: "Address" },
    { label: "Province", name: "province", type: "text", required: true, group: "Address" },
    { label: "ZIP Code", name: "zip_code", type: "text", required: true, pattern: /^\d{4}$/ },

    // Dependents grouped together
    { label: "Spouse Name", name: "spouse_name", type: "text", group: "Dependents" },
    { label: "Number of Children", name: "number_of_children", type: "select", group: "Dependents", 
      options: Array.from({ length: 11 }, (_, i) => i) }
    ];

  // Employment fields
  const employmentFields = [
    { label: "Name of Office/Line of Business", name: "office_name", type: "text" },
    { label: "Title & Position", name: "title_and_position", type: "text" },
    { label: "Office Address", name: "office_address", type: "text" },
    { label: "Office Contact Number", name: "office_contact_number", type: "text", pattern: /^[0-9+()\-.\s]+$/ }
  ];

  // Membership fields
  const membershipFields = [
    { label: "Account Type", name: "account_type", type: "select",
      options: ["Regular", "Associate", "Treasurer", "Board"], required: true },
    { label: "Account Status", name: "account_status", type: "select",
      options: ["Active", "Inactive", "Pending"], required: true },
    { label: "Application Date", name: "application_date", type: "date", required: true },

    { label: "Membership Fee", name: "membership_fee", type: "number"},
    { label: "Initial Share Capital", name: "initial_share_capital", type: "number"},
    { label: "Fee Status", name: "fee_status", type: "select", options: ["Paid", "Unpaid", "Partial"]},

    { label: "Payment Method", name: "payment_method", type: "select", options: ["Cash", "GCash", "Bank"]},
    { label: "Payment Date", name: "payment_date", type: "date"},
    { label: "Remarks", name: "remarks", type: "text" }
  ];

  return (
    <div className="min-h-screen py-5">
      <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-xl p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Register New Member</h1>
          <p className="text-base-content/70">Fill out the fields below to register a new member.</p>
        </header>

        <div className="tabs tabs-border mb-6">
          <div className={`tab ${activeTab === 0 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
            1. Personal Info
          </div>
          <div className={`tab ${activeTab === 1 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
            2. Employment/Profession
          </div>
          <div className={`tab ${activeTab === 2 ? "tab-active" : "text-gray-500 pointer-events-none"}`}>
            3. Membership
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {isError && <p className="text-red-500">{error.message}</p>}
          {isSuccess && (<p className="text-green-600">Member registered successfully!</p>)}
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
                {personalFields.map(({ label, name, type, options, group }, idx) => {
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
                      <label htmlFor={name} className="label"><span className="label-text font-medium">{label}</span></label>

                      {type === "select" ? (
                        <select
                          id={name}
                          {...register(name, { required: `${label} is required` })}
                          className={`select select-bordered w-full ${errors[name] ? "select-error" : ""}`}
                        >
                          <option value="" disabled>Select {label}</option>
                          {options?.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      ) : (
                        <input
                          id={name}
                          type={type}
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
                          className={`input input-bordered w-full ${errors[name] ? "input-error" : ""}`}
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
                  type="button"
                  onClick={() => handleNext([
                    "f_name", "l_name", "civil_status", "birthday", "place_of_birth",
                    "block_no", "barangay", "city_municipality", "province", "zip_code",
                    "contact_number", "email"
                  ])}
                  className="btn btn-primary"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* EMPLOYMENT TAB */}
          {activeTab === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {employmentFields.map(({ label, name, type, options }) => (
                  <div key={name} className="form-control w-full">
                    <label htmlFor={name} className="label"><span className="label-text font-medium">{label}</span></label>

                    <input
                      id={name}
                      type={type}
                      {...register(name, {
                        required: `${label} is required`,
                        pattern: name === "office_contact_number" ? {
                          value: /^[0-9+()\-.\s]+$/,
                          message: "Only numbers and symbols like +, -, (, ) allowed",
                        } : undefined
                      })}
                      onInput={name === "office_contact_number" ? (e) => {
                        e.target.value = e.target.value.replace(/[^0-9+()\-.\s]/g, "");
                      } : undefined}
                      className={`input input-bordered w-full ${errors[name] ? "input-error" : ""}`}
                    />
                   
                    {errors[name] && (<p className="text-red-500 text-sm">{errors[name].message}</p>)}
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
                  onClick={() =>
                    handleNext([
                      "office_name",
                      "title_and_position",
                      "office_address",
                      "office_contact_number"
                    ])
                  }
                  className="btn btn-primary"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* MEMBERSHIP DETAILS TAB */}
          {activeTab === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {membershipFields.map(({ label, name, type, options }) => (
                  <div key={name} className="form-control w-full">
                    <label htmlFor={name} className="label"><span className="label-text font-medium">{label}</span></label>

                    {type === "select" ? (
                      <select
                        id={name}
                        {...register(name, { required: `${label} is required` })}
                        className={`select select-bordered w-full ${errors[name] ? "select-error" : ""}`}
                      >
                        <option value="" disabled>Select {label}</option>
                        {options?.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    ) : (
                      <input
                        id={name}
                        type={type}
                        {...register(name, { required: `${label} is required` })}
                        className={`input input-bordered w-full ${errors[name] ? "input-error" : ""}`}
                      />
                    )}
                    {errors[name] && (<p className="text-red-500 text-sm">{errors[name].message}</p>)}
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button type="button" className="btn btn-soft" onClick={() => setActiveTab(1)}>
                  Back
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-success">
                  {isSubmitting ? "Submitting..." : "Submit"}
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