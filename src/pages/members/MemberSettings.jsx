import { useState } from "react";

// Member Settings Page

function MemberSettings() {
  // TODO: Replace with actual user data from auth context
  const [userSettings, setUserSettings] = useState({
    email: "member@digitec.com",
    fullName: "Juan Dela Cruz",
    phoneNumber: "+63 912 345 6789",
    address: "123 Main Street, Cagayan de Oro City",
    emergencyContact: "Maria Dela Cruz",
    emergencyPhone: "+63 923 456 7890",
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    loanUpdates: true,
    promotionalEmails: false,
    twoFactorAuth: false,
    theme: "light",
    dateFormat: "MM/DD/YYYY",
    currency: "PHP",
    language: "English",
  });

  const [activeTab, setActiveTab] = useState("profile"); // profile, notifications, security, preferences
  const [isEditing, setIsEditing] = useState(false);

  // TODO: Implement actual save functionality with backend API
  const handleSaveProfile = () => {
    // await updateUserProfile(userSettings)
    console.log("Saving profile...", userSettings);
    setIsEditing(false);
    // Show success toast
  };

  // TODO: Implement notification settings update
  const handleToggleNotification = (key) => {
    setUserSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // await updateNotificationSettings({ [key]: !userSettings[key] })
    console.log(`Toggle ${key}:`, !userSettings[key]);
  };

  // TODO: Implement security settings update
  const handleSecurityChange = (key, value) => {
    setUserSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    // await updateSecuritySettings({ [key]: value })
    console.log(`Security change ${key}:`, value);
  };

  // TODO: Implement preference settings update
  const handlePreferenceChange = (key, value) => {
    setUserSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    // await updateUserPreferences({ [key]: value })
    console.log(`Preference change ${key}:`, value);
  };

  // TODO: Implement password change functionality
  const handleChangePassword = () => {
    // Open password change modal
    console.log("Opening password change modal...");
  };

  // TODO: Implement export data functionality
  const handleExportData = () => {
    // Generate and download user data export
    console.log("Exporting user data...");
  };

  // TODO: Implement account deactivation request
  const handleRequestDeactivation = () => {
    // Show confirmation modal and submit request to admin
    console.log("Request account deactivation...");
  };

  return (
    <div className="px-2 sm:px-4 lg:px-6 min-h-screen py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg lg:text-2xl font-bold">Account Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account preferences and personal information
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 shadow-sm mb-6 overflow-x-auto">
        <div className="flex min-w-max">
          <a
            className={`tab text-xs sm:text-sm ${activeTab === "profile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </a>
          <a
            className={`tab text-xs sm:text-sm ${activeTab === "notifications" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </a>
          <a
            className={`tab text-xs sm:text-sm ${activeTab === "security" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </a>
          <a
            className={`tab text-xs sm:text-sm ${activeTab === "preferences" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            Preferences
          </a>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <input
                type="text"
                value={userSettings.fullName}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <input
                type="email"
                value={userSettings.email}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>

            {/* Phone Number */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Phone Number</span>
              </label>
              <input
                type="tel"
                value={userSettings.phoneNumber}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>

            {/* Address */}
            <div className="form-control md:col-span-1">
              <label className="label">
                <span className="label-text font-semibold">Address</span>
              </label>
              <input
                type="text"
                value={userSettings.address}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>

            {/* Emergency Contact Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Emergency Contact Name
                </span>
              </label>
              <input
                type="text"
                value={userSettings.emergencyContact}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    emergencyContact: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>

            {/* Emergency Contact Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Emergency Contact Phone
                </span>
              </label>
              <input
                type="tel"
                value={userSettings.emergencyPhone}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    emergencyPhone: e.target.value,
                  }))
                }
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button onClick={handleSaveProfile} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          )}

          <div className="alert alert-info mt-4">
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
            <span className="text-sm">
              Some information like account number and member type cannot be
              changed. Contact the administrator for assistance.
            </span>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive updates and alerts via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.emailNotifications}
                onChange={() => handleToggleNotification("emailNotifications")}
                className="toggle toggle-primary"
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive text message alerts for important updates
                </p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.smsNotifications}
                onChange={() => handleToggleNotification("smsNotifications")}
                className="toggle toggle-primary"
              />
            </div>

            {/* Payment Reminders */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Payment Reminders</h3>
                <p className="text-sm text-gray-600">
                  Get reminded about upcoming loan payments
                </p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.paymentReminders}
                onChange={() => handleToggleNotification("paymentReminders")}
                className="toggle toggle-primary"
              />
            </div>

            {/* Loan Updates */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Loan Application Updates</h3>
                <p className="text-sm text-gray-600">
                  Notifications about your loan application status
                </p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.loanUpdates}
                onChange={() => handleToggleNotification("loanUpdates")}
                className="toggle toggle-primary"
              />
            </div>

            {/* Promotional Emails */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Promotional Emails</h3>
                <p className="text-sm text-gray-600">
                  Receive news about new products and offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.promotionalEmails}
                onChange={() => handleToggleNotification("promotionalEmails")}
                className="toggle toggle-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-lg font-semibold">Security Settings</h2>

          <div className="space-y-4">
            {/* Change Password */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-gray-600">
                    Last changed 30 days ago
                  </p>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="btn btn-sm btn-outline"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.twoFactorAuth}
                onChange={() =>
                  handleSecurityChange(
                    "twoFactorAuth",
                    !userSettings.twoFactorAuth
                  )
                }
                className="toggle toggle-primary"
              />
            </div>

            {/* Login History */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-3">Recent Login Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Today at 10:30 AM</span>
                  <span className="badge badge-success badge-sm">
                    Current Session
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Yesterday at 2:15 PM</span>
                  <span className="text-xs">Windows PC</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Dec 28, 2024 at 9:00 AM</span>
                  <span className="text-xs">Mobile Device</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-lg font-semibold">Application Preferences</h2>

          <div className="space-y-4">
            {/* Theme */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Theme</h3>
              <p className="text-sm text-gray-600 mb-3">
                Choose your display theme
              </p>
              <select
                value={userSettings.theme}
                onChange={(e) =>
                  handlePreferenceChange("theme", e.target.value)
                }
                className="select select-bordered w-full max-w-xs"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>

            {/* Date Format */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Date Format</h3>
              <p className="text-sm text-gray-600 mb-3">
                Select your preferred date display format
              </p>
              <select
                value={userSettings.dateFormat}
                onChange={(e) =>
                  handlePreferenceChange("dateFormat", e.target.value)
                }
                className="select select-bordered w-full max-w-xs"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            {/* Currency */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Currency Display</h3>
              <p className="text-sm text-gray-600 mb-3">
                Default currency for display
              </p>
              <select
                value={userSettings.currency}
                onChange={(e) =>
                  handlePreferenceChange("currency", e.target.value)
                }
                className="select select-bordered w-full max-w-xs"
              >
                <option value="PHP">PHP (Philippine Peso)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>

            {/* Language */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Language</h3>
              <p className="text-sm text-gray-600 mb-3">
                Choose your preferred language
              </p>
              <select
                value={userSettings.language}
                onChange={(e) =>
                  handlePreferenceChange("language", e.target.value)
                }
                className="select select-bordered w-full max-w-xs"
              >
                <option value="English">English</option>
                <option value="Filipino">Filipino</option>
              </select>
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-8 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <h3 className="font-medium text-orange-700 mb-4">
              Account Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="btn btn-outline btn-sm w-full sm:w-auto"
              >
                Download My Data
              </button>
              <button
                onClick={handleRequestDeactivation}
                className="btn btn-warning btn-sm w-full sm:w-auto"
              >
                Request Account Deactivation
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Note: Account deactivation requires administrator approval. Your
                loans and contributions will be settled before deactivation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberSettings;
