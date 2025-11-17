import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../backend/context/AuthProvider";
import PropTypes from 'prop-types';

// fetch hooks
import { useMembers } from "../backend/hooks/shared/useFetchMembers";
import { useFetchNotifications } from "../backend/hooks/shared/useFetchNotifications";

// mutation hooks
import { useMarkAsRead } from "../backend/hooks/shared/useMarkAsRead";
import { useLogout } from "../backend/hooks/auth/authLogout";

// icons 
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpIcon from "@mui/icons-material/Help";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// constants
import { getRoleLabel, getRolePath } from "../constants/Roles"; // Remains for now
import placeHolderAvatar from '../assets/placeholder-avatar.png';

const Topbar = ({ role }) => {      // expecting an argument in layout as memberRole
  const navigate = useNavigate();
  // to fetch member name for the logged in id
  const { user } = useAuth();
  const loginId = user?.id;

  // fetch member data and details for the logged in user
  const { data: members_data, isLoading, isError, error } = useMembers({ login_id: loginId });
  const member = members_data?.data[0] || [];

  const profile_pic = member?.avatar_url;
  const accountNo = member?.account_number;
  const fullName = member
    ? [
      member?.f_name,
      member?.l_name ? `${member?.l_name.charAt(0)}.` : null,
    ].filter(Boolean).join(" ")
    : null;


  // notifications fetch hook
  const { data: notifications, isLoading: notificationsLoading } = useFetchNotifications({ useLoggedInMember: true });

  // Filter notifications for dropdown: show unread + read notifications less than 1 month old
  const filteredNotifications = notifications?.filter((notif) => {
    if (!notif.is_read) return true; // Always show unread

    // For read notifications, only show if less than 1 month old
    const createdAt = new Date(notif.created_at);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return createdAt > oneMonthAgo;
  }) || [];

  // logout hook
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const handleLogout = () => {
    logout();
  }

  // notification mutation hook
  const { mutate: markAsReadMutation } = useMarkAsRead(); // single
  const { mutate: markAllAsReadMutation } = useMarkAsRead(); // all


  /**
   *  State variables
   * 
   */
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState();

  const [searchTerm, setSearchTerm] = useState("");
  const [dateTimeStr, setDateTimeStr] = useState("");

  /**
   * Use effects
   */

  // Mark as read when a notification is opened

  // Update date and time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDateTimeStr(format(now, "EEEE, MMMM d, yyyy, h:mm a"));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="navbar bg-neutral text-white px-4 py-3 flex justify-between items-center">

      <div className="flex justify-between items-center">

        {/* SIDEBAR TOGGLE FOR MOBILE */}
        <label htmlFor="my-drawer" className="lg:hidden ml-5 mr-10 drawer-button cursor-pointer">
          <MenuOutlinedIcon className="w-6 h-6" />
        </label>

        {/* SEARCH */}
        <div className="hidden sm:flex relative w-72 max-w-md">
          <input
            id="search_topbar"
            name="search_topbar"
            type="text"
            placeholder="Search"
            className="w-full rounded-full py-2 px-3 pr-10 border border-white focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center shadow-md"
          >

            <SearchIcon />
          </button>
        </div>
        <div className="flex justify-center ml-6">
          <span className="mr-2">Page : </span>
          <span className="text-warning" title="Developmental, will be removed in the future">{getRoleLabel(role) || "Role Not Found"}</span>
        </div>
      </div>

      {/* DATE, NOTIFS, PROFILE */}
      <div className="flex items-center space-x-6 text-sm select-none">
        <div className="hidden md:block">{dateTimeStr}</div>

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            className="indicator relative"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <NotificationsIcon className="w-6 h-6 cursor-pointer" />
            {notifications && notifications?.length > 0 && (
              <span className="indicator-item badge badge-accent">
                {notifications.filter((n) => !n.is_read).length}
              </span>
            )}
          </button>

          {/* DROPDOWN LIST */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-96 bg-base-100 text-base-content rounded-2xl shadow-2xl border border-base-300 z-50 animate-[fadeIn_0.2s_ease-out]">
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b border-base-300 bg-base-200/50">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <NotificationsIcon className="text-primary" fontSize="small" />
                  Recent Notifications
                </h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="btn btn-ghost btn-xs btn-circle"
                  aria-label="Close dropdown"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              {notificationsLoading ? (
                <div className="p-6 text-center">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                  <p className="text-sm text-base-content/70 mt-2">Loading notifications...</p>
                </div>
              ) : filteredNotifications?.length > 0 ? (
                <ul className="max-h-96 overflow-y-auto p-2">
                  {filteredNotifications.slice(0, 6).map((notif) => (
                    <li
                      key={notif.id}
                      onClick={() => {
                        // Mark as read mutation
                        if (!notif.is_read) {
                          markAsReadMutation({ notif_id: notif.id });
                        }
                        setSelectedNotif(notif);
                        setShowModal(true);
                        setShowDropdown(false);
                      }}
                      className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-primary hover:shadow-md ${notif.is_read
                        ? "bg-base-200/30 opacity-75"
                        : "bg-base-200 font-semibold"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-sm text-base-content line-clamp-2">{notif.message}</div>
                          <div className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
                            <span>🕐</span>
                            {format(new Date(notif.created_at), "MMM d, h:mm a")}
                          </div>
                        </div>
                        {!notif.is_read && (
                          <div className="flex-shrink-0">
                            <span className="badge badge-accent badge-xs">New</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <NotificationsIcon className="text-base-content/20 w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm text-base-content/60">No notifications yet</p>
                </div>
              )}

              {/* Footer */}
              <div className="p-3 border-t border-base-300 bg-base-200/30">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setShowModal(true);
                  }}
                  className="btn btn-primary btn-sm w-full gap-2"
                >
                  View All Notifications
                  <ExpandMoreIcon fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-2xl w-full max-w-lg shadow-2xl border border-base-300 animate-[fadeIn_0.2s_ease-out]">
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-base-300">
                <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                  <NotificationsIcon className="text-primary" />
                  {selectedNotif ? "Notification Details" : "All Notifications"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedNotif(null);
                  }}
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-5 max-h-[70vh] overflow-y-auto">
                {selectedNotif ? (
                  <div className="space-y-4">
                    {/* Emphasized message */}
                    <div className="rounded-xl border border-base-300 bg-gradient-to-br from-base-200/80 to-base-100 p-5 shadow">
                      <div className="text-lg font-sm tracking-tight text-base-content leading-snug">
                        {selectedNotif?.message}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="badge badge-primary badge-sm">
                          {selectedNotif?.type.toUpperCase() || "N/A"}
                        </span>
                        <span className="text-xs text-base-content/60">
                          {format(new Date(selectedNotif.created_at), "PPPp")}
                        </span>
                      </div>
                    </div>

                    {/* Minor details */}
                    {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-base-200 rounded-lg">
                        <div className="text-xs uppercase text-base-content/60">Sender</div>
                        <div className="text-sm text-base-content">{selectedNotif?.sender_id || "System"}</div>
                      </div>
                      
                      <div className="p-3 bg-base-200 rounded-lg">
                        <div className="text-xs uppercase text-base-content/60">Recipient</div>
                        <div className="text-sm text-base-content">
                          {selectedNotif?.recipient_id || (selectedNotif?.is_global ? "Global" : "—")}
                        </div>
                      </div>
                    </div> */}

                    <button
                      onClick={() => setSelectedNotif(null)}
                      className="btn btn-outline btn-primary btn-sm w-full mt-2 gap-2"
                    >
                      <ArrowBackIcon fontSize="small" />
                      Back to all notifications
                    </button>
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          // Mark as read mutation
                          if (!notif.is_read) {
                            markAsReadMutation({ notif_id: notif.id });
                            console.log(`TRIGGERED`, notif.id)
                          }
                          setSelectedNotif(notif)
                        }}
                        className={`p-4 border border-base-300 rounded-lg cursor-pointer hover:shadow-md hover:border-primary transition-all duration-200 ${notif.is_read ? "bg-base-200/50 opacity-75" : "bg-base-100 font-semibold"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-base-content mb-1">{notif.message}</div>
                            <div className="text-xs text-base-content/60 flex items-center gap-1">
                              <span>📅</span>
                              {format(new Date(notif.created_at), "MMM d, yyyy h:mm a")}
                            </div>
                          </div>
                          {!notif.is_read && (
                            <span className="badge badge-accent badge-sm">New</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <NotificationsIcon className="text-base-content/30 w-16 h-16 mx-auto mb-3" />
                    <p className="text-base-content/60">No notifications available</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-base-300 flex justify-between gap-2">
                <button
                  onClick={() => {
                    // Mark all read mutation
                    markAllAsReadMutation({ account_no: accountNo });
                  }}
                  className="btn btn-warning btn-sm"
                >
                  Mark all as read
                </button>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedNotif(null);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost flex items-center gap-2 px-4 h-14 cursor-pointer hover:bg-transparent hover:text-inherit"
          >
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img
                  src={profile_pic || placeHolderAvatar}
                  alt="Profile"
                />
              </div>
            </div>


            <span className="hidden sm:block font-medium">{fullName || "Not Found"}</span>
            <ExpandMoreIcon />
          </button>

          <div
            tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box w-60 p-4 pb-4 shadow-lg"
          >
            {/* AVATAR, NAME, ROLE */}
            <div className="p-4 flex items-center gap-3 rounded-lg no-underline">
              {isLoading ? (
                <div className="py-4 w-full flex justify-center items-center">
                  <span className="loading loading-spinner loading-lg text-primary" />
                </div>
              ) : isError ? (
                <div className="py-4 w-full text-center">
                  <div className="text-red-500 font-semibold">
                    {error?.message || "Something went wrong while loading account."}
                  </div>
                </div>
              ) : (
                <>
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={profile_pic || placeHolderAvatar}
                        alt="Profile"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-base-content">{fullName || "Not Found"}</p>
                    <p className="text-xs text-base-content/60">{getRoleLabel(role)}</p>
                  </div>
                </>
              )}
            </div>

            {/* PROFILE, SETTINGS, DARK MODE, LOGOUT */}
            <ul>
              {["regular-member", "associate-member"].includes(role) && (
                <li>
                  <button
                    title="Profile button"
                    className="flex items-center gap-2 text-base-content"
                    onClick={() => navigate(`/${getRolePath(role)}/profile`)}
                  >
                    <AccountCircleIcon
                      className="text-base-content/60"
                      fontSize="small"
                    />
                    Profile
                  </button>
                </li>
              )}
              <li>
                <button
                  title="Settings button"
                  className="flex items-center gap-2 text-base-content"
                  onClick={() => navigate(`/${getRolePath(role)}/settings`)}
                >
                  <SettingsIcon
                    className="text-base-content/60"
                    fontSize="small"
                  />
                  Settings
                </button>
              </li>
              <li>
                <button
                  title="Help button"
                  className="flex items-center gap-2 text-base-content"
                  onClick={() => navigate(`/${getRolePath(role)}/help`)}
                >
                  <HelpIcon className="text-base-content/60" fontSize="small" />
                  Help
                </button>
              </li>
              <li>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-base-content">
                    <DarkModeIcon
                      className="text-base-content/60"
                      fontSize="small"
                    />
                    Dark Mode
                  </span>
                  <input
                    id="checkbox"
                    name="checkbox"
                    type="checkbox"
                    aria-label="Toggle dark mode"
                    className="toggle theme-controller"
                    onChange={(e) =>
                      document.documentElement.setAttribute(
                        "data-theme",
                        e.target.checked ? "digitec-dark" : "digitec-light"
                      )
                    }
                  />
                </div>
              </li>
              {/* LOGOUT */}
              <li className="mt-2 pt-2">
                <button
                  title="Logout button"
                  onClick={() => handleLogout()} disabled={isLoggingOut}
                  className="btn btn-error w-full flex items-center"
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

// 🛠 Prop Types for the expected values to be recieved or something2
Topbar.propTypes = {
  role: PropTypes.oneOf([
    "treasurer",
    "board",
    "regular-member",
    "associate-member",
  ]).isRequired,
};

export default Topbar;
