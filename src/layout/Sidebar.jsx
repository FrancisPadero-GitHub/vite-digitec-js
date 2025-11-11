import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/digitec-logo.png";

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SavingsIcon from '@mui/icons-material/Savings';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InventoryIcon from '@mui/icons-material/Inventory';
import LoginIcon from '@mui/icons-material/Login';

// 🧩 Dynamic Pathings Items to be shared by other roles

// board and treasurer
const financeBase = (role) => [
  { label: "Coop Share Capital", icon: AccountBalanceIcon, path: `/${role}/coop-share-capital` },
  { label: "Club Funds", icon: SavingsIcon, path: `/${role}/club-funds` },
  { label: "Club Expenses", icon: ReceiptLongIcon, path: `/${role}/club-expenses` },
  
];

// board and members
const loansBase = (role) => {
  const baseChildren = [
    // NOTE: they may seem the same but the parent path is different as well as the pages they are used
    // refer to the routes.jsx to view what pages they are belong to
    // this is dynamically configured
    { label: "Applications", path: `/${role}/coop-loans/loan-applications` },
    { label: "Loan Accounts", path: `/${role}/coop-loans/loan-accounts` },
    { label: "Payments", path: role === "board" ? "/board/coop-loans/payments" : `/${role}/coop-loans/loan-payments` },
  ];

  // Add shared "Schedules" to Board only (Treasurer has its own config; members don't show schedules)
  if (role === "board") {
    baseChildren.splice(2, 0, { label: "Schedules", path: `/${role}/coop-loans/payment-schedules` });
  }

  return [
    {
      label: "Coop Loans",
      icon: HandshakeIcon,
      children: baseChildren,
    },
  ];
}

// 📌 Sidebar Config Based on Role
const sidebarConfig = {
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
        ...financeBase("treasurer"),
        {
          label: "Coop Loans",
          icon: HandshakeIcon,
          children: [
            { label: "Releases", path: "/treasurer/coop-loans/releases" },
            { label: "Loan Accounts", path: "/treasurer/coop-loans/loan-accounts" },
            { label: "Schedules", path: "/treasurer/coop-loans/payment-schedules" },
            { label: "Payments", path: "/treasurer/coop-loans/payments" },

          ],
        },
      ],
    },
    {
      section: "Settings",
      items: [
        { label: "Loan Products", icon: InventoryIcon, path: "/treasurer/settings/loan-products" },
      ],
    },
  ],

  board: [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: DashboardIcon, path: "/board" },
        { label: "Member Records", icon: PeopleIcon, path: "/board/member-records" },
        // { label: "Announcements", icon: CampaignIcon, path: "/board/announcements" },
        { label: "Reports", icon: AssessmentIcon, path: "/board/reports" },
        { label: "Activity Logs", icon: HistoryIcon, path: "/board/activity-logs" },
      ],
    },
    {
      section: "Finance",
      items: [
        ...financeBase("board"), 
        ...loansBase("board")
      ]
    },
  ],

  "regular-member": [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: DashboardIcon, path: "/regular-member" },
        { label: "Reports", icon: AssessmentIcon, path: "/regular-member/reports" },
      ],
    },
    {
      section: "Finance",
      items: [
        
        { label: "Coop Share Capital", icon: AccountBalanceIcon, path: "/regular-member/share-capital" },
        { label: "Club Funds", icon: SavingsIcon, path: "/regular-member/club-funds" },
        ...loansBase("regular-member"),
      ],
    },
  ],

  "associate-member": [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: DashboardIcon, path: "/associate-member" },
        { label: "Reports", icon: AssessmentIcon, path: "/associate-member/reports" },
      ],
    },
    {
      section: "Finance",
      items: [
        { label: "Coop Share Capital", icon: AccountBalanceIcon, path: "/associate-member/share-capital" },
        { label: "Coop Loans", icon: HandshakeIcon, path: "/associate-member/coop-loans" },
      ],
    },
  ],

  admin: [
    {
      section: "Overview",
      items: [
        { label: "Users", icon: ManageAccountsIcon, path: "/admin" },
        { label: "Login Credentials", icon: LoginIcon, path: "/admin/create-user-login" },
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

// 🧭 Sidebar Component
const Sidebar = ({ role }) => {
  const sections = sidebarConfig[role] || [];
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="drawer-side z-40">
      <label htmlFor="my-drawer" className="drawer-overlay lg:hidden"></label>

      <div className="h-full w-65 bg-neutral text-white shadow-lg overflow-hidden flex flex-col">
        <div className="avatar mt-4 mb-2 flex justify-center">
          <div className="w-20">
            <img src={logo} alt="DigiTEC Logo" />
          </div>
        </div>
        <div className="h-full overflow-y-auto px-2 pb-4 flex flex-col">
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
                                      className={`flex items-center gap-2 py-1 px-3 rounded-md text-sm mb-1 ${isChildActive
                                        ? "bg-green-900 text-white"
                                        : "hover:bg-green-950/20"
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
    </aside>
  );
};

export default Sidebar;
