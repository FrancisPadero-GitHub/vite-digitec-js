import { useState, Fragment } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";

// mutation hooks
import { useAddMember } from "../../backend/hooks/admin/useAddMembers";
import { useCheckDuplicateMember } from "../../backend/hooks/admin/useCheckDuplicateMember";

// icons
import CameraAltIcon from "@mui/icons-material/CameraAlt";

// assets
import placeholderAvatar from "../../assets/placeholder-avatar.png";

function AddMember() {
  // functions
  const navigate = useNavigate();

  // custom states
  const {
    mutate: add_member,
    isPending,
    isError,
    error,
    isSuccess,
  } = useAddMember();

  const { mutate: checkDuplicate, isPending: isCheckingDuplicate } =
    useCheckDuplicateMember();

  // states
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);

  // variables
  const today = new Date().toISOString().split("T")[0];

  // used react hook form instead of manual usestate and onchange handlers
  //register links input fields to useForm; trigger validates specific fields; formState.errors track validation errors
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
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
      joined_date: today,
      club_fund_fee: 200,
      club_fund_payment_method: "",
      club_fund_payment_date: today,
      club_fund_remarks: "Membership Initial",
      initial_share_capital: 300,
      share_capital_payment_method: "",
      share_capital_payment_date: today,
      share_capital_remarks: "Membership Initial",
      avatarFile: null,
    },
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

  // form submission with duplicate check
  const onSubmit = (data) => {
    // Prevent double submission
    if (isPending || isCheckingDuplicate) {
      return;
    }

    // Check for duplicates first
    checkDuplicate(
      {
        f_name: data.f_name,
        m_name: data.m_name || "",
        l_name: data.l_name,
        birthday: data.birthday ? new Date(data.birthday).toISOString() : null,
        email: data.email,
        contact_number: data.contact_number,
      },
      {
        onSuccess: (duplicates) => {
          // If any duplicates found, show modal
          if (
            duplicates.hasNameMatch ||
            duplicates.hasEmailMatch ||
            duplicates.hasContactMatch
          ) {
            setDuplicateData(duplicates);
            setPendingFormData(data);
            setShowDuplicateModal(true);
          } else {
            // No duplicates, proceed with submission
            submitMember(data);
          }
        },
        onError: (err) => {
          toast.error(`Validation failed: ${err.message}`);
          console.error("Duplicate check failed:", err.message);
        },
      }
    );
  };

  // Submit member after validation or override
  const submitMember = (data) => {
    const normalized = {
      //normalize date fields before sending it to backend
      ...data,
      birthday: data.birthday ? new Date(data.birthday).toISOString() : null,
      application_date: data.application_date
        ? new Date(data.application_date).toISOString()
        : null,
      club_fund_payment_date: data.club_fund_payment_date
        ? new Date(data.club_fund_payment_date).toISOString()
        : null,
      share_capital_payment_date: data.share_capital_payment_date
        ? new Date(data.share_capital_payment_date).toISOString()
        : null,
      avatarFile,
    };

    add_member(normalized, {
      onSuccess: () => {
        toast.success("Member registered successfully");
        setShowDuplicateModal(false);
        setDuplicateData(null);
        setPendingFormData(null);
        setTimeout(() => navigate("/admin"), 1500);
      },
      onError: (err) => {
        toast.error(`Failed to submit: ${err.message}`);
        console.error("Failed to submit:", err.message);
      },
    });
  };

  // Handle confirmed submission despite duplicates
  const handleConfirmSubmit = () => {
    if (pendingFormData) {
      submitMember(pendingFormData);
    }
  };

  // Handle cancel from duplicate modal
  const handleCancelSubmit = () => {
    setShowDuplicateModal(false);
    setDuplicateData(null);
    setPendingFormData(null);
  };

  // Personal fields
  const personalFields = [
    {
      label: "First Name",
      name: "f_name",
      type: "text",
      required: true,
      autoComplete: "given-name",
    },
    {
      label: "Middle Name",
      name: "m_name",
      type: "text",
      required: false,
      autoComplete: "additional-name",
    },
    {
      label: "Last Name",
      name: "l_name",
      type: "text",
      required: true,
      autoComplete: "family-name",
    },

    {
      label: "Civil Status",
      name: "civil_status",
      type: "select",
      options: ["Single", "Married", "Widowed", "Separated"],
      required: true,
      autoComplete: "off",
    },

    {
      label: "Birthday",
      name: "birthday",
      type: "date",
      required: true,
      autoComplete: "off",
    },
    {
      label: "Place of Birth",
      name: "place_of_birth",
      type: "text",
      autoComplete: "address-level2",
    },

    {
      label: "Contact Number",
      name: "contact_number",
      type: "text",
      required: true,
      pattern: /^[0-9]{0,11}$/,
      maxLength: 11,
      autoComplete: "tel",
    },
    {
      label: "Email Address",
      name: "email",
      type: "email",
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      autoComplete: "email",
    },

    // Address grouped together
    {
      label: "Block No., Lot No., Phase No., Subdivision",
      name: "block_no",
      type: "text",
      required: true,
      group: "Address",
      autoComplete: "address-line1",
    },
    {
      label: "Barangay",
      name: "barangay",
      type: "text",
      required: true,
      group: "Address",
      autoComplete: "address-line2",
    },
    {
      label: "City / Municipality",
      name: "city_municipality",
      type: "text",
      required: true,
      group: "Address",
      autoComplete: "address-level2",
    },
    {
      label: "Province",
      name: "province",
      type: "text",
      required: true,
      group: "Address",
      autoComplete: "address-level1",
    },
    {
      label: "ZIP Code",
      name: "zip_code",
      type: "text",
      inputMode: "numeric",
      required: true,
      pattern: /^[0-9]{0,11}$/,
      maxLength: 11,
      autoComplete: "postal-code",
    },

    // Dependents grouped together
    {
      label: "Spouse Name",
      name: "spouse_name",
      type: "text",
      group: "Dependents",
      autoComplete: "off",
    },
    {
      label: "Number of Children",
      name: "number_of_children",
      type: "select",
      group: "Dependents",
      options: Array.from({ length: 11 }, (_, i) => i),
      autoComplete: "off",
    },
  ];

  // Employment fields
  const employmentFields = [
    {
      label: "Name of Office / Line of Business",
      name: "office_name",
      type: "text",
      required: true,
      autoComplete: "organization",
    },
    {
      label: "Title & Position",
      name: "title_and_position",
      type: "text",
      required: true,
      autoComplete: "organization-title",
    },
    {
      label: "Office Address",
      name: "office_address",
      type: "text",
      required: false,
      autoComplete: "street-address",
    },
    {
      label: "Office Contact Number",
      name: "office_contact_number",
      type: "text",
      required: false,
      pattern: /^[0-9]{0,11}$/,
      maxLength: 11,
      autoComplete: "tel",
    },
  ];

  // Membership fields
  const membershipFields = [
    {
      label: "Account Role",
      name: "account_role",
      type: "select",
      autoComplete: "off",
      options: [
        { label: "Regular", value: "regular-member" },
        { label: "Associate", value: "associate-member" },
        { label: "Treasurer", value: "treasurer" },
        { label: "Board", value: "board" },
      ],
      required: true,
      group: "Account Info",
    },

    {
      label: "Account Status",
      name: "account_status",
      type: "select",
      autoComplete: "off",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "Pending", value: "Pending" },
      ],
      required: true,
      group: "Account Info",
    },
    {
      label: "Join Date",
      name: "joined_date",
      type: "date",
      required: false,
      group: "Account Info",
    },

    // Club Funds
    {
      label: "Initial Club Funds (fixed)",
      name: "initial_club_funds",
      type: "number",
      group: "Club Funds",
      required: true,
      fixedValue: 200,
    },
    {
      label: "Payment Method",
      name: "club_fund_payment_method",
      type: "select",
      autoComplete: "off",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ],
      group: "Club Funds",
      required: true,
    },

    {
      label: "Payment Date",
      name: "club_fund_payment_date",
      type: "date",
      group: "Club Funds",
      required: true,
    },
    {
      label: "Remarks",
      name: "club_fund_remarks",
      type: "text",
      group: "Club Funds",
      required: false,
    },

    // Initial Share Capital
    {
      label: "Initial Share Capital Amount",
      name: "initial_share_capital",
      type: "number",
      group: "Share Capital",
      required: true,
      minValue: 300,
    },
    {
      label: "Payment Method",
      name: "share_capital_payment_method",
      type: "select",
      autoComplete: "off",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "GCash", value: "GCash" },
        { label: "Bank", value: "Bank" },
      ],
      group: "Share Capital",
      required: true,
    },

    {
      label: "Payment Date",
      name: "share_capital_payment_date",
      autoComplete: "off",
      type: "date",
      group: "Share Capital",
      required: true,
    },
    {
      label: "Remarks",
      name: "share_capital_remarks",
      autoComplete: "off",
      type: "text",
      group: "Share Capital",
      required: false,
    },
  ];

  return (
    <div className="m-3">
      <div className="space-y-3">
        <Toaster position="bottom-left" />
        <div className="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Register New Member
            </h1>
            <p className="text-sm sm:text-base text-base-content/70">
              Fill out the fields below to register a new member.
            </p>
          </header>

          <div className="tabs tabs-border mb-4 sm:mb-6 flex-col sm:flex-row">
            <div
              className={`tab text-xs sm:text-sm ${activeTab === 0 ? "tab-active" : "text-gray-500 pointer-events-none"}`}
            >
              1. Personal Info
            </div>
            <div
              className={`tab text-xs sm:text-sm ${activeTab === 1 ? "tab-active" : "text-gray-500 pointer-events-none"}`}
            >
              2. Employment/Profession
            </div>
            <div
              className={`tab text-xs sm:text-sm ${activeTab === 2 ? "tab-active" : "text-gray-500 pointer-events-none"}`}
            >
              3. Membership
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-8"
          >
            {isError && <p className="text-red-500">{error.message}</p>}
            {isSuccess && (
              <p className="text-green-600">Member registered successfully!</p>
            )}
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
                  {personalFields.map(
                    (
                      {
                        label,
                        name,
                        type,
                        options,
                        group,
                        autoComplete,
                        maxLength,
                      },
                      idx
                    ) => {
                      const prevGroup =
                        idx > 0 ? personalFields[idx - 1].group : null;

                      return (
                        <Fragment key={name}>
                          {/* Section header: full width */}
                          {group && group !== prevGroup && (
                            <div className="col-span-1 md:col-span-2">
                              <h3 className="text-lg font-semibold mt-4 mb-2">
                                {group}
                              </h3>
                              <hr className="border-gray-300 mb-4" />
                            </div>
                          )}

                          {/* Field itself */}
                          <div className="form-control w-full col-span-1">
                            <label htmlFor={name} className="label">
                              <span className="label-text text-sm sm:text-base font-medium">
                                {label}
                                {personalFields.find((f) => f.name === name)
                                  ?.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </span>
                            </label>

                            {type === "select" ? (
                              <select
                                id={name}
                                autoComplete={autoComplete || "off"}
                                {...register(name, {
                                  required: personalFields.find(
                                    (f) => f.name === name
                                  )?.required
                                    ? `${label} is required`
                                    : false,
                                })}
                                className={`select select-bordered w-full text-sm sm:text-base ${errors[name] ? "select-error" : ""}`}
                              >
                                <option value="" disabled>
                                  Select {label}
                                </option>
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
                                autoComplete={autoComplete || "off"}
                                maxLength={maxLength}
                                {...register(name, {
                                  required: `${label} is required`,
                                  pattern:
                                    name === "contact_number"
                                      ? {
                                          value: /^[0-9]{0,11}$/,
                                          message:
                                            "Contact number must be up to 11 digits",
                                        }
                                      : name === "email"
                                        ? {
                                            value:
                                              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message:
                                              "Please enter a valid email address",
                                          }
                                        : undefined,
                                })}
                                onInput={
                                  name === "contact_number" ||
                                  name === "zip_code"
                                    ? (e) => {
                                        e.target.value = e.target.value.replace(
                                          /[^0-9]/g,
                                          ""
                                        );
                                      }
                                    : undefined
                                }
                                className={`input input-bordered w-full text-sm sm:text-base ${errors[name] ? "input-error" : ""}`}
                              />
                            )}
                            {/* tracks invalid fields */}
                            {errors[name] && (
                              <p className="text-red-500 text-sm">
                                {errors[name].message}
                              </p>
                            )}
                          </div>
                        </Fragment>
                      );
                    }
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    title="Next Button"
                    type="button"
                    onClick={() =>
                      handleNext([
                        "f_name",
                        "l_name",
                        "civil_status",
                        "birthday",
                        "place_of_birth",
                        "block_no",
                        "barangay",
                        "city_municipality",
                        "province",
                        "zip_code",
                        "contact_number",
                        "email",
                      ])
                    }
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
                  {employmentFields.map(
                    ({ label, name, type, autoComplete, maxLength }) => (
                      <div key={name} className="form-control w-full">
                        <label htmlFor={name} className="label">
                          <span className="label-text text-sm sm:text-base font-medium">
                            {label}
                            {employmentFields.find((f) => f.name === name)
                              ?.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </span>
                        </label>

                        <input
                          id={name}
                          type={type}
                          autoComplete={autoComplete || "off"}
                          maxLength={maxLength}
                          {...register(name, {
                            required: employmentFields.find(
                              (f) => f.name === name
                            )?.required
                              ? `${label} is required`
                              : false,
                            pattern:
                              name === "office_contact_number"
                                ? {
                                    value: /^[0-9]{0,11}$/,
                                    message:
                                      "Office contact number must be up to 11 digits",
                                  }
                                : undefined,
                          })}
                          onInput={
                            name === "office_contact_number"
                              ? (e) => {
                                  e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                }
                              : undefined
                          }
                          className={`input input-bordered w-full text-sm sm:text-base ${errors[name] ? "input-error" : ""}`}
                        />

                        {errors[name] && (
                          <p className="text-red-500 text-sm">
                            {errors[name].message}
                          </p>
                        )}
                      </div>
                    )
                  )}
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
                        "office_contact_number",
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
                  {membershipFields.map(
                    (
                      { label, name, type, options, group, autoComplete },
                      idx
                    ) => {
                      const prevGroup =
                        idx > 0 ? membershipFields[idx - 1].group : null;

                      // Divided into subsections (account info, club funds contribution, share capital)
                      return (
                        <Fragment key={name}>
                          {group && group !== prevGroup && (
                            <div className="col-span-1 md:col-span-2">
                              <h3 className="text-lg font-semibold mt-4 mb-2">
                                {group}
                              </h3>
                              <hr className="border-gray-300 mb-4" />
                            </div>
                          )}

                          {/* Field itself */}
                          <div className="form-control w-full col-span-1">
                            <label htmlFor={name} className="label">
                              <span className="label-text text-sm sm:text-base font-medium">
                                {label}
                                {membershipFields.find((f) => f.name === name)
                                  ?.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </span>
                            </label>
                            {type === "select" ? (
                              <select
                                id={name}
                                autoComplete={autoComplete || "off"}
                                {...register(name, {
                                  required: membershipFields.find(
                                    (f) => f.name === name
                                  )?.required
                                    ? `${label} is required`
                                    : false,
                                })}
                                className={`select select-bordered w-full text-sm sm:text-base ${errors[name] ? "select-error" : ""}`}
                              >
                                <option value="" disabled>
                                  Select {label}
                                </option>
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
                                disabled={name === "initial_club_funds"}
                                autoComplete={autoComplete || "off"}
                                value={
                                  name === "initial_club_funds"
                                    ? 200
                                    : name === "initial_share_capital"
                                      ? undefined
                                      : undefined
                                }
                                defaultValue={
                                  name === "club_fund_payment_date" ||
                                  name === "share_capital_payment_date"
                                    ? today
                                    : undefined
                                }
                                readOnly={
                                  name === "club_fund_payment_date" ||
                                  name === "share_capital_payment_date" ||
                                  name === "initial_club_funds"
                                }
                                min={
                                  name === "initial_share_capital"
                                    ? 300
                                    : undefined
                                }
                                onKeyDown={
                                  name === "initial_share_capital"
                                    ? (e) => {
                                        if (e.key === "ArrowDown") {
                                          e.preventDefault();
                                        }
                                      }
                                    : undefined
                                }
                                onWheel={
                                  name === "initial_club_funds" ||
                                  name === "initial_share_capital"
                                    ? (e) => e.target.blur()
                                    : undefined
                                }
                                {...register(name, {
                                  required: membershipFields.find(
                                    (f) => f.name === name
                                  )?.required
                                    ? `${label} is required`
                                    : false,
                                  min:
                                    name === "initial_share_capital"
                                      ? {
                                          value: 300,
                                          message:
                                            "Initial share capital must be at least ₱300",
                                        }
                                      : undefined,
                                  validate: {
                                    conditionalRequired: (
                                      value,
                                      formValues
                                    ) => {
                                      if (
                                        name === "club_fund_payment_method" &&
                                        formValues.initial_club_funds &&
                                        (!value || value === "")
                                      ) {
                                        return "Payment method is required when club funds amount is provided";
                                      }
                                      if (
                                        name ===
                                          "share_capital_payment_method" &&
                                        formValues.initial_share_capital &&
                                        (!value || value === "")
                                      ) {
                                        return "Payment method is required when share capital amount is provided";
                                      }

                                      return true;
                                    },
                                  },
                                })}
                                className={`input input-bordered w-full text-sm sm:text-base ${errors[name] ? "input-error" : ""}`}
                              />
                            )}
                            {/* Validation message */}
                            {errors[name] && (
                              <p className="text-red-500 text-sm">
                                {errors[name].message}
                              </p>
                            )}
                          </div>
                        </Fragment>
                      );
                    }
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    title="Back Button"
                    type="button"
                    className="btn btn-soft btn-sm sm:btn-md"
                    onClick={() => setActiveTab(1)}
                  >
                    Back
                  </button>
                  <button
                    title="Submit button"
                    type="submit"
                    disabled={isPending || isCheckingDuplicate}
                    className="btn btn-success btn-sm sm:btn-md"
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Submitting...
                      </>
                    ) : isCheckingDuplicate ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Validating...
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
        {/* Duplicate Warning Modal */}
        {showDuplicateModal && duplicateData && (
          <dialog open className="modal overflow-hidden">
            <div className="modal-box min-w-[24rem] max-w-2xl w-full flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-warning flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="text-warning text-4xl">⚠️</div>
                  <div>
                    <h3 className="text-xl font-bold text-warning mb-1">
                      Potential Duplicate Member Detected
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Similar member(s) found in the system
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelSubmit}
                  disabled={isPending}
                  className="btn btn-sm btn-circle btn-ghost"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 pr-2 space-y-4">
                {duplicateData.hasNameMatch && (
                  <div className="card bg-warning/10 border-2 border-warning">
                    <div className="card-body p-4">
                      <h4 className="card-title text-base text-warning flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        Exact Name & Birthday Match Found
                      </h4>
                      <div className="space-y-3 mt-2">
                        {duplicateData.nameMatches.map((match, idx) => (
                          <div
                            key={idx}
                            className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-300"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                                  Full Name
                                </p>
                                <p className="font-semibold text-base">
                                  {match.f_name} {match.m_name} {match.l_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                                  Birthday
                                </p>
                                <p className="font-medium text-sm">
                                  {match.birthday
                                    ? new Date(
                                        match.birthday
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                                  Email
                                </p>
                                <p className="font-medium text-sm break-all">
                                  {match.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                                  Contact Number
                                </p>
                                <p className="font-medium text-sm">
                                  {match.contact_number}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {duplicateData.hasEmailMatch && (
                  <div className="card bg-warning/10 border-2 border-warning">
                    <div className="card-body p-4">
                      <h4 className="card-title text-base text-warning flex items-center gap-2">
                        <span className="text-xl">📧</span>
                        Email Already Registered
                      </h4>
                      <div className="space-y-3 mt-2">
                        {duplicateData.emailMatches.map((match, idx) => (
                          <div
                            key={idx}
                            className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-300"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                                  Full Name
                                </p>
                                <p className="font-semibold text-base">
                                  {match.f_name} {match.m_name} {match.l_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                                  Email
                                </p>
                                <p className="font-medium text-sm break-all">
                                  {match.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {duplicateData.hasContactMatch && (
                  <div className="card bg-warning/10 border-2 border-warning">
                    <div className="card-body p-4">
                      <h4 className="card-title text-base text-warning flex items-center gap-2">
                        <span className="text-xl">📱</span>
                        Similar Contact Number Already Registered
                      </h4>
                      <div className="space-y-3 mt-2">
                        {duplicateData.contactMatches.map((match, idx) => (
                          <div
                            key={idx}
                            className="bg-base-100 rounded-lg p-4 shadow-sm border border-base-300"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                                  Full Name
                                </p>
                                <p className="font-semibold text-base">
                                  {match.f_name} {match.m_name} {match.l_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">
                                  Contact Number
                                </p>
                                <p className="font-medium text-sm">
                                  {match.contact_number}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="alert alert-info shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div className="text-sm">
                    <strong>Note:</strong> If you&apos;re certain this is a
                    different person or the existing record is incorrect, you
                    can proceed with registration. Otherwise, please verify the
                    information before continuing.
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-base-300 mt-4 flex-shrink-0">
                <button
                  onClick={handleCancelSubmit}
                  className="btn btn-ghost btn-sm sm:btn-md"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="btn btn-warning btn-sm sm:btn-md"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : (
                    "Proceed Anyway"
                  )}
                </button>
              </div>
            </div>

            {/* Backdrop */}
            <form method="dialog" className="modal-backdrop">
              <button
                onClick={handleCancelSubmit}
                disabled={isPending}
                aria-label="Close"
              >
                close
              </button>
            </form>
          </dialog>
        )}
      </div>
    </div>
  );
}

export default AddMember;
