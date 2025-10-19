import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

// db for logout
import { supabase } from "../backend/supabase";

// fetch hooks
import { useMembers } from "../backend/hooks/shared/useFetchMembers";
import { useFetchAccountNumber } from "../backend/hooks/shared/useFetchAccountNumber";

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

// constants
import { getRoleLabel, getRolePath } from "../constants/Roles"; // Remains for now
const catGif = "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTVsM3VoOHU1YWpqMjM0ajJ3bTBsODVxbnJsZDIzdTRyajBrazZ0MyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/qZgHBlenHa1zKqy6Zn/giphy.gif"


const Topbar = ({ role }) => {      // expecting an argument in layout as memberRole
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // to fetch member name for the logged in id
  const { data: loggedInAccountNumber} = useFetchAccountNumber();
  const { data: members_data, isLoading, isError, error } = useMembers();
  const members = members_data?.data || [];

  // Find member linked to this user
  const member = members?.find((m) => m.account_number === loggedInAccountNumber);

  const profile_pic = member?.avatar_url;
  
  // Renders fetched name and shortend the last name to single char
  const matchedMember = member
    ? [
      member.f_name,
      member.l_name ? `${member.l_name.charAt(0)}.` : null,
    ].filter(Boolean).join(" ")
    : null;


  const [searchTerm, setSearchTerm] = useState("");
  const [dateTimeStr, setDateTimeStr] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);




  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);

      // Confirm session is really gone
      const { data: sessionCheck } = await supabase.auth.getSession();
      console.log("Post-logout session check:", sessionCheck);

      // Clear all cached data tied to the previous user
      queryClient.clear();

      // Optional: redirect or reset app state here
      // navigate("/login");
    } catch (err) {
      console.error("Error signing out:", err.message);
    } finally {
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
      </div>

      {/* DATE, NOTIFS, PROFILE */}
      <div className="flex items-center space-x-6 text-sm select-none">
        <div className="hidden md:block">{dateTimeStr}</div>

        <div className="indicator">
          <NotificationsIcon className="w-6 h-6 cursor-pointer" />
          <span className="indicator-item badge badge-accent">12</span>
        </div>

        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost flex items-center gap-2 px-4 h-14 cursor-pointer hover:bg-transparent hover:text-inherit"
          >
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img
                  src={profile_pic || catGif}
                  alt="Profile"
                />
              </div>
            </div>


            <span className="hidden sm:block font-medium">{matchedMember || error}</span>
            <ExpandMoreIcon />
          </button>

          <div
            tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box w-60 p-4 pb-4 shadow-lg"
          >
            {/* AVATAR, NAME, ROLE */}
            <div className="p-4 flex items-center gap-3 rounded-lg no-underline">
              {isLoading ? (<tr>
                <td className="py-10">
                  <div className="flex justify-center items-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                </td>
                </tr>
                ) : isError ? (
                  <tr>
                  <td className="py-10 text-center">
                    <div className="text-red-500 font-semibold">
                      {error?.message || "Something went wrong while loading account."}
                    </div>
                  </td>
                </tr>
                ) : (              
                <>
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={profile_pic || "https://media.tenor.com/GKydCswZLZEAAAAC/cat.gif"}
                        alt="Profile"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-base-content">{matchedMember || "Error"}</p>
                    <p className="text-xs text-base-content/60">
                      {getRoleLabel(role)}
                    </p>
                  </div>
                </>
                )
              };
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
                  onClick={handleSignOut} disabled={isLoggingOut}
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

export default Topbar;
