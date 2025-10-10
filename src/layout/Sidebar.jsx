import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/digitec-logo.png"
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SavingsIcon from '@mui/icons-material/Savings';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';



// SIDEBAR CONFIG BASED ON ROLE
const sidebarConfig = {
  // TREASURER PATHS

 /**
  * The path on these must be complete both parent and children path
  * for example 
  * 
  * treasurer/member-records/ 
  * 
  * instead of just 
  * 
  * /member-records
  * 
  * because it inherits its leading path to the parent
  * 
  */
  treasurer: [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: DashboardIcon, path: "/treasurer" },
        { label: "Member Records", icon: PeopleIcon, path: "/treasurer/member-records" },
        { label: "Reports", icon: AssessmentIcon, path: "/treasurer/reports" },
        { label: "Activity Logs", icon: HistoryIcon, path: "/treasurer/activity-logs" },
      ],
    },
    {
      section: "Finance",
      items: [
        { label: "Coop Share Capital", icon: AccountBalanceIcon, path: "/treasurer/coop-share-capital" },
        { label: "Club Funds", icon: SavingsIcon, path: "/treasurer/club-funds" },
        { label: "Club Expenses", icon: ReceiptLongIcon, path: "/treasurer/club-expenses" },
        { label: "Coop Loans", icon: HandshakeIcon, path: "/treasurer/coop-loans" },
      ],
    },
  ],

  // BOD PATHS
  board: [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: DashboardIcon, path: "/board" },
        { label: "Member Records", icon: PeopleIcon, path: "/board/member-records" },
        { label: "Reports", icon: AssessmentIcon, path: "/board/reports" },
        { label: "Activity Logs", icon: HistoryIcon, path: "/board/activity-logs" },
      ],
    },
    {
      section: "Loans",
      items: [
        { label: "Applications", icon: StickyNote2Icon, path: "/board/loan-applications" },
        { label: "Accounts", icon: RequestQuoteIcon, path: "/board/loan-accounts" },
      ],
    },
  ],

  // MEMBER PATHS
  "regular-member": [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: DashboardIcon, path: "/regular-member" },
        { label: "Reports", icon: AssessmentIcon, path: "/regular-member/regular-member-reports" },
      ],
    },
    {
      section: "Finance",
      items: [
        { label: "Coop Share Capital", icon: AccountBalanceIcon, path: "/regular-member/regular-member-share-capital" },
        { label: "Club Funds", icon: SavingsIcon, path: "/regular-member/regular-member-club-funds" },
        // { label: "Coop Loans", icon: HandshakeIcon, path: "/regular-member/regular-member-coop-loans" },
   
        {
          label: "Coop Loans",
          icon: HandshakeIcon,
          children: [
            // { label: "Loan Information", path: "/regular-member/coop-loans/my-information" },
            // { label: "View Loan Payment History", path: "/regular-member/coop-loans/payments" },
            { label: "Applications", path: "/regular-member/coop-loans/my-applications" },
            { label: "Loan Accounts", path: "/regular-member/coop-loans/accounts" },
            // { label: "View Approved Loans (History)", path: "/regular-member/coop-loans/approved" },
          ],
        },
      ],
    },
  ],

  "associate-member": [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: DashboardIcon, path: "/associate-member" },
        { label: "Reports", icon: AssessmentIcon, path: "/associate-member/associate-member-reports" },
      ],
    },
    {
      section: "Finance",
      items: [
        { label: "Coop Share Capital", icon: AccountBalanceIcon, path: "/associate-member/associate-member-share-capital" },
        { label: "Coop Loans", icon: HandshakeIcon, path: "/associate-member/associate-member-coop-loans" },
      ],
    },
  ],

  // ADMIN PATHS
  admin: [
    {
      section: "Overview",
      items: [
        { label: "Users", icon: ManageAccountsIcon, path: "/admin" },
        // REMOVED kay na balhin sa user management as button to invoke this path
        //{ label: "Add Member", icon: AddCircleOutlineIcon, path: "/admin/add-member" },
        { label: "Activity Logs", icon: HistoryIcon, path: "/admin/activity-logs" },
      ],
    },
    {
      section: "System Settings",
      items: [
        { label: "Settings", icon: SettingsIcon, path: "/admin/system-settings" },
      ],
    },
  ],
};

/**
 * 
 * @param {string} role - takes a string parameter fetched from members account_type column in Layout.jsx
 * @returns rendered sidebar component with role specific navigations
 */

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ role }) => {
  const sections = sidebarConfig[role] || [];
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({}); // Track collapses

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="drawer-side z-40">
      <label htmlFor="my-drawer" className="drawer-overlay lg:hidden"></label>

      <div className="h-full w-65 bg-neutral text-white shadow-lg overflow-hidden flex flex-col">
        <div className="avatar mt-4 mb-2 flex justify-center">
          <div className="w-20">
            <img src={logo} alt="DigiTEC Logo" />
          </div>
        </div>

        {/* Navigation */}
        <ul className="menu flex-grow">
          {sections.map((section) => (
            <li key={section.section}>
              <div className="menu-title pb-3 uppercase text-xs text-gray-300 mt-5">
                {section.section}
              </div>
              <ul>
                {section.items.map((item, i) => {
                  const isActive = location.pathname === item.path;

                  if (item.children) {
                    const isOpen = openMenus[item.label] || false;
                    return (
                      <li key={i}>
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className="flex items-center justify-between w-full py-2 px-4 rounded-md text-base mb-2 hover:bg-green-950/30"
                        >
                          <div className="flex items-center gap-3">
                            <item.icon fontSize="small" />
                            <span>{item.label}</span>
                          </div>
                          {isOpen ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </button>
                        {isOpen && (
                          <ul className="ml-8 mt-1">
                            {item.children.map((child, idx) => {
                              const isChildActive = location.pathname === child.path;
                              return (
                                <li key={idx}>
                                  <Link
                                    to={child.path}
                                    className={`flex items-center gap-2 py-1 px-3 rounded-md text-sm mb-1 ${isChildActive ? "bg-green-900 text-white" : "hover:bg-green-950/20"
                                      }`}
                                  >
                                    <span>•</span>
                                    {child.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  return (
                    <li key={i}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 py-2 px-4 rounded-md text-base mb-2 ${isActive ? "bg-green-950 text-white" : ""
                          }`}
                      >
                        <item.icon fontSize="small" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
