import { Link, useLocation } from "react-router-dom";
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// SIDEBAR CONFIG BASED ON ROLE
const sidebarConfig = {
  // TREASURER PATHS
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
      section: "Applications",
      items: [
        { label: "Loan Applications", icon: StickyNote2Icon, path: "/board/loan-applications" },
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
        { label: "Club Funds", icon: SavingsIcon, path: "/regular-member/regular-member-club-funds" },
        { label: "Coop Share Capital", icon: AccountBalanceIcon, path: "/regular-member/regular-member-share-capital" },
        { label: "Coop Loans", icon: HandshakeIcon, path: "/regular-member/regular-member-coop-loans" },
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
        { label: "User Management", icon: ManageAccountsIcon, path: "/admin" },
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

// SIDEBAR COMPONENT
const Sidebar = ({ role }) => {
  const sections = sidebarConfig[role] || [];
  const location = useLocation();

  return (
    <div className="drawer-side z-40">
      <label htmlFor="my-drawer" className="drawer-overlay lg:hidden"></label>

      <div className="h-full w-65 bg-neutral text-white shadow-lg overflow-hidden flex flex-col">
        <div className="avatar mt-4 mb-2 flex justify-center">
          <div className="w-20">
            <img src="/src/assets/digitec-logo.png" alt="DigiTEC Logo" />
          </div>
        </div>

        {/* Navigation */}
        <ul className="menu flex-grow">
          {sections.map((section) => (
            <li key={section.section}>
              <div className="menu-title pb-3 uppercase text-xs text-gray-300 mt-5">{section.section}</div>
              <ul>
                {section.items.map((item, i) => {
                  const isActive = location.pathname === item.path;
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
