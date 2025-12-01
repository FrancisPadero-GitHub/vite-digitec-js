import { useState } from 'react'

// Personal Settings Page for Treasurer

function Settings() {
  // TODO: Replace with actual user data from auth context
  const [userSettings, setUserSettings] = useState({
    email: 'treasurer@digitec.com',
    fullName: 'John Treasurer',
    phoneNumber: '+63 912 345 6789',
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    overdueAlerts: true,
    monthlyReports: true,
    autoBackup: false,
    twoFactorAuth: false,
    sessionTimeout: '30',
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
    currency: 'PHP',
    language: 'English'
  })

  const [activeTab, setActiveTab] = useState('profile') // profile, notifications, security, preferences
  const [isEditing, setIsEditing] = useState(false)

  // TODO: Implement actual save functionality with backend API
  const handleSaveProfile = () => {
    // await updateUserProfile(userSettings)
    console.log('Saving profile...', userSettings)
    setIsEditing(false)
    // Show success toast
  }

  // TODO: Implement notification settings update
  const handleToggleNotification = (key) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    // await updateNotificationSettings({ [key]: !userSettings[key] })
    console.log(`Toggle ${key}:`, !userSettings[key])
  }

  // TODO: Implement security settings update
  const handleSecurityChange = (key, value) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }))
    // await updateSecuritySettings({ [key]: value })
    console.log(`Security change ${key}:`, value)
  }

  // TODO: Implement preference settings update
  const handlePreferenceChange = (key, value) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }))
    // await updateUserPreferences({ [key]: value })
    console.log(`Preference change ${key}:`, value)
  }

  // TODO: Implement password change functionality
  const handleChangePassword = () => {
    // Open password change modal
    console.log('Opening password change modal...')
  }

  // TODO: Implement export data functionality
  const handleExportData = () => {
    // Generate and download user data export
    console.log('Exporting user data...')
  }

  // TODO: Implement account deactivation
  const handleDeactivateAccount = () => {
    // Show confirmation modal
    console.log('Deactivate account confirmation...')
  }

  return (
    <div className="px-2 sm:px-4 lg:px-6 min-h-screen py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg lg:text-2xl font-bold">Treasurer Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your account preferences and settings</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 shadow-sm mb-6 overflow-x-auto">
        <div className="flex min-w-max">
          <a 
            className={`tab text-xs sm:text-sm ${activeTab === 'profile' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </a>
          <a 
            className={`tab text-xs sm:text-sm ${activeTab === 'notifications' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </a>
          <a 
            className={`tab text-xs sm:text-sm ${activeTab === 'security' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </a>
          <a 
            className={`tab text-xs sm:text-sm ${activeTab === 'preferences' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </a>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Profile Information</h2>
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
                onChange={(e) => setUserSettings(prev => ({ ...prev, fullName: e.target.value }))}
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
                onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
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
                onChange={(e) => setUserSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
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
              <button
                onClick={handleSaveProfile}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.emailNotifications}
                onChange={() => handleToggleNotification('emailNotifications')}
                className="toggle toggle-primary"
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-gray-600">Receive text message alerts</p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.smsNotifications}
                onChange={() => handleToggleNotification('smsNotifications')}
                className="toggle toggle-primary"
              />
            </div>

            {/* Payment Reminders */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Payment Reminders</h3>
                <p className="text-sm text-gray-600">Get notified about upcoming payments</p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.paymentReminders}
                onChange={() => handleToggleNotification('paymentReminders')}
                className="toggle toggle-primary"
              />
            </div>

            {/* Overdue Alerts */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Overdue Alerts</h3>
                <p className="text-sm text-gray-600">Alerts for overdue loan payments</p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.overdueAlerts}
                onChange={() => handleToggleNotification('overdueAlerts')}
                className="toggle toggle-primary"
              />
            </div>

            {/* Monthly Reports */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Monthly Reports</h3>
                <p className="text-sm text-gray-600">Receive monthly financial summaries</p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.monthlyReports}
                onChange={() => handleToggleNotification('monthlyReports')}
                className="toggle toggle-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-lg font-semibold">Security Settings</h2>

          <div className="space-y-4">
            {/* Change Password */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-gray-600">Last changed 30 days ago</p>
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
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.twoFactorAuth}
                onChange={() => handleSecurityChange('twoFactorAuth', !userSettings.twoFactorAuth)}
                className="toggle toggle-primary"
              />
            </div>

            {/* Session Timeout */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Session Timeout</h3>
              <p className="text-sm text-gray-600 mb-3">Auto logout after inactivity</p>
              <select
                value={userSettings.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                className="select select-bordered w-full max-w-xs"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {/* Auto Backup */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium">Automatic Data Backup</h3>
                <p className="text-sm text-gray-600">Regularly backup your data</p>
              </div>
              <input
                type="checkbox"
                checked={userSettings.autoBackup}
                onChange={() => handleSecurityChange('autoBackup', !userSettings.autoBackup)}
                className="toggle toggle-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-base-100 rounded-lg shadow-md p-4 sm:p-6 space-y-6">
          <h2 className="text-lg font-semibold">Application Preferences</h2>

          <div className="space-y-4">
            {/* Theme */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Theme</h3>
              <p className="text-sm text-gray-600 mb-3">Choose your display theme</p>
              <select
                value={userSettings.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
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
              <p className="text-sm text-gray-600 mb-3">Select date display format</p>
              <select
                value={userSettings.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                className="select select-bordered w-full max-w-xs"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            {/* Currency */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">Currency</h3>
              <p className="text-sm text-gray-600 mb-3">Default currency for display</p>
              <select
                value={userSettings.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
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
              <p className="text-sm text-gray-600 mb-3">Choose your preferred language</p>
              <select
                value={userSettings.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="select select-bordered w-full max-w-xs"
              >
                <option value="English">English</option>
                <option value="Filipino">Filipino</option>
              </select>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <h3 className="font-medium text-red-700 mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="btn btn-outline btn-sm w-full sm:w-auto"
              >
                Export My Data
              </button>
              <button
                onClick={handleDeactivateAccount}
                className="btn btn-error btn-sm w-full sm:w-auto"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings