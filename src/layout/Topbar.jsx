import { useState, useEffect, useRef } from "react";
// Custom bell jiggle animation
const bellJiggleStyle = `
@keyframes bell-jiggle {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(-15deg); }
  20% { transform: rotate(10deg); }
  30% { transform: rotate(-10deg); }
  40% { transform: rotate(6deg); }
  50% { transform: rotate(-4deg); }
  60% { transform: rotate(2deg); }
  70% { transform: rotate(-1deg); }
  80% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}
.bell-jiggle {
  animation: bell-jiggle 1s cubic-bezier(.36,.07,.19,.97) both;
  animation-iteration-count: infinite;
}
`;
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../backend/context/AuthProvider";
import PropTypes from 'prop-types';
import logo from "../assets/digitec-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { openNotificationModal, closeNotificationModal, setSelectedNotification, notificationModalState } from "../features/redux/notificationModalSlice";

// fetch hooks
import { useMembers } from "../backend/hooks/shared/useFetchMembers";
import { useFetchNotifications } from "../backend/hooks/shared/useFetchNotifications";

// mutation hooks
import { useMarkAsRead } from "../backend/hooks/shared/useMarkAsRead";
import { useDeleteNotif } from "../backend/hooks/shared/useDeleteNotif";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useLogout } from "../backend/hooks/auth/authLogout";

// icons 
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpIcon from "@mui/icons-material/Help";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// components
import NotificationDetail from "../components/shared/NotificationDetail";

// constants
import { getRoleLabel, getRolePath } from "../constants/Roles"; // Remains for now
import placeHolderAvatar from '../assets/placeholder-avatar.png';

const Topbar = ({ role, onToggleSidebar }) => {
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
  const { mutate: deleteNotification, isPending: isDeleteNotifPending } = useDeleteNotif();


  /**
   *  State variables
   * 
   */
  const dispatch = useDispatch();
  const { isOpen: showModal, selectedNotif } = useSelector(notificationModalState);
  const [showDropdown, setShowDropdown] = useState(false);

  // ref used for closing dropdown when clicking outside
  const notifRef = useRef(null);

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

  // Close notifications dropdown when clicking outside of it or pressing Escape
  useEffect(() => {
    if (!showDropdown) return; // don't add listeners if dropdown is closed

    const onOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    const onEscape = (e) => {
      if (e.key === "Escape") setShowDropdown(false);
    };

    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [showDropdown]);

  return (
    <>
      {/* Inject custom bell jiggle animation style */}
      <style>{bellJiggleStyle}</style>
      <header className="fixed top-0 left-0 right-0 bg-neutral text-white px-4 py-3 flex justify-between items-center shadow-lg z-50">

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">

          {/* SIDEBAR TOGGLE */}
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-neutral-focus rounded-md transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <MenuOutlinedIcon className="w-6 h-6" />
          </button>

          {/* LOGO + TITLE */}
          <div className="flex items-center gap-3 lg:ml-6">
            <img
              src={logo}
              alt="DigiTEC Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-md object-contain shrink-0"
            />

            <div className="leading-tight min-w-0">
              {/* responsive labels: very small, small, and medium+ */}
              <span className="font-bold tracking-wide text-gray-250 text-sm sm:text-lg md:text-xl block truncate">
                <span className="inline sm:hidden">DigiTEC</span>
                <span className="hidden sm:inline md:hidden">DigiTEC – ECTEC</span>
                <span className="hidden md:inline">DigiTEC – ECTEC Multi-Purpose Cooperative Portal</span>
              </span>
            </div>
          </div>
        </div>

        {/* DATE, NOTIFS, PROFILE */}
        <div className="flex items-center text-sm select-none">

        <div className="hidden lg:block mr-5">{dateTimeStr}</div>

        {/* NOTIFICATIONS */}
        <div ref={notifRef} className="relative">
          <button
            className={`indicator relative`}
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <NotificationsIcon
              className={`cursor-pointer ${notifications && notifications.filter((n) => !n.is_read).length > 0 ? 'bell-jiggle' : ''}`}
              style={{ width: "32px", height: "32px" }}
            />
            {notifications && notifications?.length > 0 && notifications.some((n) => !n.is_read) && (
              <span className="indicator-item badge badge-accent">
                {notifications.filter((n) => !n.is_read).length}
              </span>
            )}
          </button>

          {/* DROPDOWN LIST */}
          {showDropdown && (
            <div className="absolute -translate-x-1/2 left-0 right-auto sm:right-0 sm:left-auto sm:translate-x-0 mt-3 w-70 md:w-90 lg:w-95 bg-base-100 text-base-content shadow-2xl border border-base-300 z-40 animate-[fadeIn_0.2s_ease-out]">
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
                        if (!notif.is_read) {
                          markAsReadMutation({ notif_id: notif.id });
                        }
                        dispatch(setSelectedNotification(notif));
                        dispatch(openNotificationModal(notif));
                        setShowDropdown(false);
                      }}
                      className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-primary hover:shadow-md ${notif.is_read ? "bg-base-200/30 opacity-75" : "bg-base-200 font-semibold"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-sm text-base-content line-clamp-2">{notif.title}</div>
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
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification({ notif_id: notif.id });
                            }}
                            title="Delete notification"
                            className="btn btn-ghost btn-xs btn-circle"
                            disabled={isDeleteNotifPending}
                            aria-disabled={isDeleteNotifPending}
                          >
                            {isDeleteNotifPending ? (
                              <AiOutlineLoading3Quarters className="animate-spin" />
                            ) : (
                              <span>🗑</span>
                            )}
                          </button>
                        </div>
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

              {/* Footer only show if there are any notifications */}
              {notifications?.length > 0 && (
                <div className="p-3 border-t border-base-300 bg-base-200/30">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      dispatch(openNotificationModal(null));
                    }}
                    className="btn btn-primary btn-sm w-full gap-2"
                  >
                    View All Notifications
                    <ExpandMoreIcon fontSize="small" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-2xl w-full max-w-lg shadow-2xl border border-base-300 animate-[fadeIn_0.2s_ease-out]">
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-base-300">

                <div>
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    <NotificationsIcon className="text-primary" />
                    {selectedNotif ? "Notification Details" : "All Notifications"}
                  </h2>
                </div>
                {!selectedNotif ? (
                  <button
                    onClick={() => {
                      // Delete all notifications for current account
                      deleteNotification({ account_no: accountNo });
                    }}
                    className="link text-red-600 btn-sm font-bold"
                    aria-label="Delete all notifications"
                    title="Delete all"
                    disabled={isDeleteNotifPending}
                    aria-disabled={isDeleteNotifPending}
                  >
                    {isDeleteNotifPending ? (
                      <AiOutlineLoading3Quarters className="inline animate-spin" />
                    ) : (
                      "Delete all"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Delete the selected notification
                      deleteNotification({ notif_id: selectedNotif.id }, {
                        onSuccess: () => {
                          dispatch(setSelectedNotification(null));
                        }
                      });
                    }}
                    className="link text-red-600 btn-sm font-bold"
                    aria-label="Delete notification"
                    title="Delete"
                    disabled={isDeleteNotifPending}
                    aria-disabled={isDeleteNotifPending}
                  >
                    {isDeleteNotifPending ? (
                      <AiOutlineLoading3Quarters className="inline animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                )}

              </div>

              {/* Content */}
              <div className="p-5 max-h-[70vh] overflow-y-auto">
                {selectedNotif ? (
                  <NotificationDetail
                    title={selectedNotif?.title}
                    message={selectedNotif?.message}
                    type={selectedNotif?.type}
                    createdAt={selectedNotif?.created_at}
                    senderId={selectedNotif?.sender_id}
                    recipientId={selectedNotif?.recipient_id}
                    isGlobal={selectedNotif?.is_global}
                    onBack={() => dispatch(setSelectedNotification(null))}
                    onNext={() => {
                      // Find current notification index
                      const currentIndex = notifications.findIndex(n => n.id === selectedNotif.id);
                      // Get next notification if exists
                      if (currentIndex !== -1 && currentIndex < notifications.length - 1) {
                        const nextNotif = notifications[currentIndex + 1];
                        // Mark as read if unread
                        if (!nextNotif.is_read) {
                          markAsReadMutation({ notif_id: nextNotif.id });
                        }
                        dispatch(setSelectedNotification(nextNotif));
                      }
                    }}
                    hasNext={(() => {
                      const currentIndex = notifications?.findIndex(n => n.id === selectedNotif.id) ?? -1;
                      return currentIndex !== -1 && currentIndex < (notifications?.length ?? 0) - 1;
                    })()}
                  />
                ) : notifications && notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          // Mark as read mutation
                          if (!notif.is_read) {
                            markAsReadMutation({ notif_id: notif.id });
                            // console.log(`TRIGGERED`, notif.id)
                          }
                          dispatch(setSelectedNotification(notif));
                        }}
                        className={`p-4 border border-base-300 rounded-lg cursor-pointer hover:shadow-md hover:border-primary transition-all duration-200 ${notif.is_read ? "bg-base-200/50 opacity-75" : "bg-base-100 font-semibold"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-base-content mb-1">{notif.title}</div>
                            <div className="text-xs text-base-content/60 flex items-center gap-1">
                              <span>📅</span>
                              {format(new Date(notif.created_at), "MMM d, yyyy h:mm a")}
                            </div>
                          </div>
                          {!notif.is_read && (
                            <span className="badge badge-accent badge-sm">New</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification({ notif_id: notif.id });
                            }}
                            title="Delete notification"
                            className="btn btn-ghost btn-xs btn-circle"
                            disabled={isDeleteNotifPending}
                            aria-disabled={isDeleteNotifPending}
                          >
                            {isDeleteNotifPending ? (
                              <AiOutlineLoading3Quarters className="animate-spin" />
                            ) : (
                              "🗑"
                            )}
                          </button>
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
              <div className={`p-5 border-t border-base-300 flex ${!selectedNotif ? "justify-between" : "justify-end"} gap-2`}>
                {!selectedNotif && (
                  <button
                    onClick={() => {
                      // Mark all read mutation
                      markAllAsReadMutation({ account_no: accountNo });
                    }}
                    className="btn btn-warning btn-sm"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={() => {
                    dispatch(closeNotificationModal());
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
            className="btn btn-ghost flex items-center h-14 cursor-pointer hover:bg-transparent hover:text-inherit"
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
    </div>
      </header>
    </>
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
  onToggleSidebar: PropTypes.func.isRequired,
};

export default Topbar;
