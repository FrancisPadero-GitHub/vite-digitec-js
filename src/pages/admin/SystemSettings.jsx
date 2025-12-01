import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Settings,
  Database,
  Shield,
  Users,
  Mail,
  Bell,
  Palette,
  HardDrive,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  FileText,
  Server,
  Save,
  RotateCcw,
} from "lucide-react";

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("general"); // general, database, security, users, notifications, appearance, maintenance

  // TODO: Replace with actual system settings from backend/config
  const [systemSettings, setSystemSettings] = useState({
    // General Settings
    systemName: "DigiTEC Cooperative System",
    systemEmail: "admin@digitec.coop",
    systemPhone: "+63 912 345 6789",
    systemAddress: "Cagayan de Oro City, Philippines",
    timezone: "Asia/Manila",
    dateFormat: "MM/DD/YYYY",
    currency: "PHP",
    fiscalYearStart: "January",

    // Database Settings
    autoBackup: true,
    backupFrequency: "daily", // daily, weekly, monthly
    backupTime: "02:00",
    backupRetention: 30, // days
    lastBackup: "2025-12-01 02:00:00",

    // Security Settings
    sessionTimeout: 30, // minutes
    passwordExpiry: 90, // days
    minPasswordLength: 8,
    requireSpecialChar: true,
    require2FA: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    allowMultipleSessions: false,

    // User Management
    allowSelfRegistration: false,
    requireEmailVerification: true,
    defaultUserRole: "regular-member",
    inactivityPeriod: 180, // days before account marked inactive

    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    systemAlerts: true,
    maintenanceNotifications: true,

    // Appearance
    theme: "light", // light, dark, auto
    primaryColor: "#10b981", // green
    logoUrl: "/assets/digitec_logo.png",
    faviconUrl: "/favicon.ico",

    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: "System under maintenance. Please check back later.",
    allowedMaintenanceIPs: ["127.0.0.1"],
  });

  // TODO: Implement actual save functionality with backend API
  const handleSaveSettings = () => {
    console.log("Saving system settings:", systemSettings);
    // Example: await updateSystemSettings(systemSettings);
    toast.success("System settings saved successfully!");
  };

  // TODO: Implement database backup functionality
  const handleBackupNow = () => {
    console.log("Initiating manual backup...");
    // Example: await triggerManualBackup();
    toast.success("Backup initiated successfully!");
  };

  // TODO: Implement database restore functionality
  const handleRestoreBackup = () => {
    console.log("Restore backup clicked");
    // Example: Show modal to select backup file and restore
    toast.info("Restore backup feature coming soon!");
  };

  // TODO: Implement system logs download
  const handleDownloadLogs = () => {
    console.log("Downloading system logs...");
    // Example: await downloadSystemLogs();
    toast.success("System logs download started!");
  };

  // TODO: Implement cache clearing
  const handleClearCache = () => {
    console.log("Clearing system cache...");
    // Example: await clearSystemCache();
    toast.success("System cache cleared successfully!");
  };

  // TODO: Implement maintenance mode toggle
  const handleToggleMaintenance = () => {
    setSystemSettings((prev) => ({
      ...prev,
      maintenanceMode: !prev.maintenanceMode,
    }));
    console.log("Maintenance mode toggled:", !systemSettings.maintenanceMode);
    toast.success(
      `Maintenance mode ${!systemSettings.maintenanceMode ? "enabled" : "disabled"}`
    );
    // Example: await toggleMaintenanceMode(!systemSettings.maintenanceMode);
  };

  // TODO: Implement settings import
  const handleImportSettings = () => {
    console.log("Import settings clicked");
    // Example: Open file picker and import JSON settings
    toast.info("Import settings feature coming soon!");
  };

  // TODO: Implement settings export
  const handleExportSettings = () => {
    console.log("Exporting settings...");
    // Example: await exportSettingsAsJSON();
    toast.success("Settings exported successfully!");
  };

  // Reset to defaults handler
  const handleResetSettings = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to default values?"
      )
    ) {
      console.log("Reset to defaults");
      toast.success("Settings reset to defaults!");
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <Settings className="w-4 h-4" /> },
    {
      id: "database",
      label: "Database",
      icon: <Database className="w-4 h-4" />,
    },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: <HardDrive className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content flex items-center gap-3">
              <Settings className="w-7 h-7 text-primary" />
              System Settings
            </h1>
            <p className="text-sm text-base-content/60 mt-1">
              Configure and manage system-wide settings for the DigiTEC
              Cooperative System
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-base-100 rounded-lg shadow-sm border border-base-300">
          <div className="tabs tabs-boxed bg-base-200 rounded-t-lg p-2 overflow-x-auto flex-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "tab-active bg-primary text-primary-content"
                    : "hover:bg-base-300"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* General Settings Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      General Settings
                    </h2>
                    <p className="text-xs text-base-content/60">
                      Basic system configuration
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        System Name
                      </span>
                    </label>
                    <input
                      type="text"
                      value={systemSettings.systemName}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          systemName: e.target.value,
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      placeholder="Enter system name"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        System Email
                      </span>
                    </label>
                    <input
                      type="email"
                      value={systemSettings.systemEmail}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          systemEmail: e.target.value,
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      placeholder="admin@example.com"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        System Phone
                      </span>
                    </label>
                    <input
                      type="tel"
                      value={systemSettings.systemPhone}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          systemPhone: e.target.value,
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      placeholder="+63 912 345 6789"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        Timezone
                      </span>
                    </label>
                    <select
                      value={systemSettings.timezone}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          timezone: e.target.value,
                        })
                      }
                      className="select select-bordered w-full focus:select-primary"
                    >
                      <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">
                        Eastern Time (GMT-5)
                      </option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        Date Format
                      </span>
                    </label>
                    <select
                      value={systemSettings.dateFormat}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          dateFormat: e.target.value,
                        })
                      }
                      className="select select-bordered w-full focus:select-primary"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        Currency
                      </span>
                    </label>
                    <select
                      value={systemSettings.currency}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          currency: e.target.value,
                        })
                      }
                      className="select select-bordered w-full focus:select-primary"
                    >
                      <option value="PHP">PHP (₱)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        System Address
                      </span>
                    </label>
                    <textarea
                      value={systemSettings.systemAddress}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          systemAddress: e.target.value,
                        })
                      }
                      className="textarea textarea-bordered w-full focus:textarea-primary"
                      rows="2"
                      placeholder="Enter system address..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings Tab */}
            {activeTab === "database" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      Database Settings
                    </h2>
                    <p className="text-xs text-base-content/60">
                      Backup and database management
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Auto Backup */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.autoBackup}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            autoBackup: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div>
                        <span className="label-text font-medium">
                          Enable Automatic Backups
                        </span>
                        <p className="text-xs text-base-content/60">
                          Automatically backup database on a schedule
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Backup Frequency
                        </span>
                      </label>
                      <select
                        value={systemSettings.backupFrequency}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            backupFrequency: e.target.value,
                          })
                        }
                        className="select select-bordered w-full focus:select-primary"
                        disabled={!systemSettings.autoBackup}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Backup Time
                        </span>
                      </label>
                      <input
                        type="time"
                        value={systemSettings.backupTime}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            backupTime: e.target.value,
                          })
                        }
                        className="input input-bordered w-full focus:input-primary"
                        disabled={!systemSettings.autoBackup}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Backup Retention (days)
                        </span>
                      </label>
                      <input
                        type="number"
                        value={systemSettings.backupRetention}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            backupRetention: parseInt(e.target.value),
                          })
                        }
                        className="input input-bordered w-full focus:input-primary"
                        min="7"
                        max="365"
                        placeholder="30"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Last Backup
                        </span>
                      </label>
                      <input
                        type="text"
                        value={systemSettings.lastBackup}
                        className="input input-bordered w-full bg-base-200"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Backup Actions */}
                  <div className="divider text-base-content/70">
                    Backup Actions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleBackupNow}
                      className="btn btn-primary gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Backup Now
                    </button>
                    <button
                      onClick={handleRestoreBackup}
                      className="btn btn-outline btn-primary gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Restore Backup
                    </button>
                    <button
                      onClick={handleDownloadLogs}
                      className="btn btn-outline gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Download Logs
                    </button>
                  </div>

                  <div className="alert alert-info shadow-sm">
                    <Database className="w-5 h-5" />
                    <span className="text-sm">
                      Regular backups are essential for data protection. Ensure
                      backups are stored securely off-site.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      Security Settings
                    </h2>
                    <p className="text-xs text-base-content/60">
                      Password policies and authentication
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Session Timeout (minutes)
                      </span>
                    </label>
                    <select
                      value={systemSettings.sessionTimeout}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                      className="select select-bordered w-full focus:select-primary"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Password Expiry (days)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={systemSettings.passwordExpiry}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          passwordExpiry: parseInt(e.target.value),
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      min="30"
                      max="365"
                      placeholder="90"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Min Password Length
                      </span>
                    </label>
                    <input
                      type="number"
                      value={systemSettings.minPasswordLength}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          minPasswordLength: parseInt(e.target.value),
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      min="6"
                      max="20"
                      placeholder="8"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Max Login Attempts
                      </span>
                    </label>
                    <input
                      type="number"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          maxLoginAttempts: parseInt(e.target.value),
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      min="3"
                      max="10"
                      placeholder="5"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Lockout Duration (minutes)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={systemSettings.lockoutDuration}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          lockoutDuration: parseInt(e.target.value),
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      min="5"
                      max="60"
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.requireSpecialChar}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            requireSpecialChar: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div>
                        <span className="label-text font-medium">
                          Require Special Characters in Password
                        </span>
                        <p className="text-xs text-base-content/60">
                          Enforce use of special characters (!@#$%^&*)
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.require2FA}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            require2FA: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div>
                        <span className="label-text font-medium">
                          Require Two-Factor Authentication
                        </span>
                        <p className="text-xs text-base-content/60">
                          Mandatory 2FA for all users
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.allowMultipleSessions}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            allowMultipleSessions: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div>
                        <span className="label-text font-medium">
                          Allow Multiple Sessions
                        </span>
                        <p className="text-xs text-base-content/60">
                          Users can login from multiple devices simultaneously
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="alert alert-warning shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">
                    Changing security settings will affect all users. Ensure
                    proper communication before applying changes.
                  </span>
                </div>
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      User Management Settings
                    </h2>
                    <p className="text-xs text-base-content/60">
                      User registration and account policies
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.allowSelfRegistration}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            allowSelfRegistration: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div>
                        <span className="label-text font-medium">
                          Allow Self Registration
                        </span>
                        <p className="text-xs text-base-content/60">
                          Users can register new accounts without admin approval
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.requireEmailVerification}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            requireEmailVerification: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div>
                        <span className="label-text font-medium">
                          Require Email Verification
                        </span>
                        <p className="text-xs text-base-content/60">
                          Users must verify email before account activation
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Default User Role
                      </span>
                    </label>
                    <select
                      value={systemSettings.defaultUserRole}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          defaultUserRole: e.target.value,
                        })
                      }
                      className="select select-bordered w-full focus:select-primary"
                    >
                      <option value="regular-member">Regular Member</option>
                      <option value="associate-member">Associate Member</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Inactivity Period (days)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={systemSettings.inactivityPeriod}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          inactivityPeriod: parseInt(e.target.value),
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      min="30"
                      max="365"
                      placeholder="180"
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        Mark accounts inactive after this period
                      </span>
                    </label>
                  </div>
                </div>

                <div className="alert alert-info shadow-sm">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">
                    User management settings control how new users join and
                    interact with the system.
                  </span>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      Notification Settings
                    </h2>
                    <p className="text-xs text-base-content/60">
                      Email, SMS, and system alerts
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.emailNotifications}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            emailNotifications: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-base-content/70" />
                        <div>
                          <span className="label-text font-medium">
                            Email Notifications
                          </span>
                          <p className="text-xs text-base-content/60">
                            Send email notifications to users
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.smsNotifications}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            smsNotifications: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-base-content/70" />
                        <div>
                          <span className="label-text font-medium">
                            SMS Notifications
                          </span>
                          <p className="text-xs text-base-content/60">
                            Send SMS alerts for critical events
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.systemAlerts}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            systemAlerts: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-base-content/70" />
                        <div>
                          <span className="label-text font-medium">
                            System Alerts
                          </span>
                          <p className="text-xs text-base-content/60">
                            Alert admins of system errors and warnings
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceNotifications}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            maintenanceNotifications: e.target.checked,
                          })
                        }
                        className="checkbox checkbox-primary"
                      />
                      <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-base-content/70" />
                        <div>
                          <span className="label-text font-medium">
                            Maintenance Notifications
                          </span>
                          <p className="text-xs text-base-content/60">
                            Notify users before scheduled maintenance
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="alert alert-info shadow-sm">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm">
                    Configure how and when users receive notifications from the
                    system.
                  </span>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      Appearance Settings
                    </h2>
                    <p className="text-xs text-base-content/60">
                      Theme, colors, and branding
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Theme</span>
                    </label>
                    <select
                      value={systemSettings.theme}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          theme: e.target.value,
                        })
                      }
                      className="select select-bordered w-full focus:select-primary"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        Primary Color
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={systemSettings.primaryColor}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-16 h-10 rounded-lg border-2 border-base-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={systemSettings.primaryColor}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            primaryColor: e.target.value,
                          })
                        }
                        className="input input-bordered flex-1 focus:input-primary"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Logo URL</span>
                    </label>
                    <input
                      type="text"
                      value={systemSettings.logoUrl}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          logoUrl: e.target.value,
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      placeholder="/assets/logo.png"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Favicon URL
                      </span>
                    </label>
                    <input
                      type="text"
                      value={systemSettings.faviconUrl}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          faviconUrl: e.target.value,
                        })
                      }
                      className="input input-bordered w-full focus:input-primary"
                      placeholder="/favicon.ico"
                    />
                  </div>
                </div>

                <div className="alert alert-info shadow-sm">
                  <Palette className="w-5 h-5" />
                  <span className="text-sm">
                    Customize the visual appearance of the system for all users.
                  </span>
                </div>
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === "maintenance" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-base-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <HardDrive className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-base-content">
                      Maintenance & System Tools
                    </h2>
                    <p className="text-xs text-base-content/60">
                      System maintenance and utilities
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Maintenance Mode */}
                  <div className="card bg-base-200/50 border border-base-300 shadow-sm">
                    <div className="card-body">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${systemSettings.maintenanceMode ? "bg-warning/20" : "bg-base-300/50"}`}
                          >
                            <AlertTriangle
                              className={`w-6 h-6 ${systemSettings.maintenanceMode ? "text-warning" : "text-base-content/40"}`}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-base-content">
                              Maintenance Mode
                            </h3>
                            <p className="text-xs text-base-content/60">
                              {systemSettings.maintenanceMode
                                ? "System is currently in maintenance mode"
                                : "System is operational"}
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={systemSettings.maintenanceMode}
                          onChange={handleToggleMaintenance}
                          className="toggle toggle-warning toggle-lg"
                        />
                      </div>

                      {systemSettings.maintenanceMode && (
                        <div className="mt-4 pt-4 border-t border-base-300">
                          <label className="label">
                            <span className="label-text font-medium">
                              Maintenance Message
                            </span>
                          </label>
                          <textarea
                            value={systemSettings.maintenanceMessage}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                maintenanceMessage: e.target.value,
                              })
                            }
                            className="textarea textarea-bordered w-full"
                            rows="3"
                            placeholder="Enter a message to display to users..."
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Actions */}
                  <div className="divider text-base-content/70">
                    System Actions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleClearCache}
                      className="btn btn-outline btn-primary gap-2 justify-start"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Clear Cache
                    </button>
                    <button
                      onClick={handleDownloadLogs}
                      className="btn btn-outline btn-primary gap-2 justify-start"
                    >
                      <Download className="w-4 h-4" />
                      Download Logs
                    </button>
                    <button
                      onClick={handleExportSettings}
                      className="btn btn-outline btn-primary gap-2 justify-start"
                    >
                      <Upload className="w-4 h-4" />
                      Export Settings
                    </button>
                    <button
                      onClick={handleImportSettings}
                      className="btn btn-outline btn-primary gap-2 justify-start"
                    >
                      <Download className="w-4 h-4" />
                      Import Settings
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="divider text-error mt-8">Danger Zone</div>
                  <div className="card bg-error/5 border-2 border-error/30 shadow-sm">
                    <div className="card-body">
                      <h3 className="font-semibold text-error flex items-center gap-2 text-base">
                        <AlertTriangle className="w-5 h-5" />
                        Dangerous Actions
                      </h3>
                      <p className="text-xs text-base-content/70 mb-4">
                        These actions are irreversible and should be performed
                        with extreme caution.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="btn btn-error btn-outline gap-2">
                          <Trash2 className="w-4 h-4" />
                          Clear All Data
                        </button>
                        <button className="btn btn-error btn-outline gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Reset System
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-warning shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">
                    Always create a backup before performing system maintenance
                    operations.
                  </span>
                </div>
              </div>
            )}

            {/* Save Button (appears on all tabs) */}
            <div className="divider"></div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <button
                onClick={handleResetSettings}
                className="btn btn-ghost gap-2 w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
              <button
                onClick={handleSaveSettings}
                className="btn btn-primary gap-2 w-full sm:w-auto"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemSettings;
