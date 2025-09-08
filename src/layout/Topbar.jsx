import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpIcon from "@mui/icons-material/Help";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { getRoleLabel, getRolePath } from "../constants/Roles";
import { format } from "date-fns";

import { supabase } from "../backend/supabase";

const Topbar = ({ role }) => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [dateTimeStr, setDateTimeStr] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      setIsLoggingOut(false);
    }
  };

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
      {/* SIDEBAR TOGGLE FOR MOBILE */}
      <label htmlFor="my-drawer" className="md:hidden lg:hidden cursor-pointer">
        <MenuOutlinedIcon className="w-6 h-6" />
      </label>

      {/* SEARCH */}
      <div className="hidden sm:flex relative w-72 max-w-md">
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-full py-2 px-3 pr-10 border border-white focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center shadow-md"
        >
          <SearchIcon />
        </button>
      </div>

      {/* DATE, NOTIFS, PROFILE */}
      <div className="flex items-center space-x-6 text-sm select-none">
        <div className="hidden md:block">{dateTimeStr}</div>

        <div className="indicator">
          <NotificationsIcon className="w-6 h-6 cursor-pointer" />
          <span className="indicator-item badge badge-accent">12</span>
        </div>

        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost flex items-center gap-2 px-4 h-14 cursor-pointer hover:bg-transparent hover:text-inherit"
          >
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img
                  src="https://media.tenor.com/GKydCswZLZEAAAAC/cat.gif"
                  alt="Profile"
                />
              </div>
            </div>
            <span className="hidden sm:block font-medium">Cindy B.</span>
            <ExpandMoreIcon />
          </label>

          <div
            tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box w-60 p-4 pb-4 shadow-lg"
          >
            {/* AVATAR, NAME, ROLE */}
            <div className="p-4 flex items-center gap-3 rounded-lg no-underline">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img
                    src="https://media.tenor.com/GKydCswZLZEAAAAC/cat.gif"
                    alt="Profile"
                  />
                </div>
              </div>
              <div>
                <p className="font-medium text-base-content">Cindy Booc</p>
                <p className="text-xs text-base-content/60">
                  {getRoleLabel(role)}
                </p>
              </div>
            </div>

            {/* PROFILE, SETTINGS, DARK MODE, LOGOUT */}
            {["regular-member", "associate-member"].includes(role) && (
              <li>
                <button
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
                  type="checkbox"
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
                onClick={handleSignOut} disabled={isLoggingOut}
                className="btn btn-error w-full flex items-center"
              >
                <LogoutIcon fontSize="small" />
                Logout
              </button>
            </li>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
