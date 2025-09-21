import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { useAuth } from "../backend/context/AuthProvider.jsx";
import { useMembers } from "../backend/hooks/useFetchMembers.js";

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { data: members } = useMembers();

  // Normalize account type to match route naming
  const normalizeRole = (accountType = "") => {
    switch (accountType) {
      case "Admin":
        return "admin";
      case "Treasurer":
        return "treasurer";
      case "Board":
        return "board";
      case "Regular":
        return "regular-member";
      case "Associate":
        return "associate-member";
      default:
        return accountType.toLowerCase().replace(/\s+/g, "-");
    }
  };

  // role segment from the URL
  const roleFromUrl = location.pathname.split("/")[1];

  // Find member linked to this user
  const member = members?.find((m) => m.login_id === user?.id);

  // Get normalized member role
  const memberRole = member ? normalizeRole(member.account_type) : null;

  // Redirect if user role doesn't match URL role
  if (!memberRole || roleFromUrl !== memberRole) {
    console.log("Sidebar from Layout.jsx didn't match any URL role fetched from db")
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      {/* PAGE CONTENT, HEADER, FOOTER */}
      <div className="bg-base-200 drawer-content flex flex-col min-h-screen">
        <Topbar role={memberRole} />
        <main className="p-5 space-y-4 flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* SIDEBAR */}
      <Sidebar role={memberRole} />
    </div>
  );
};

export default Layout;
