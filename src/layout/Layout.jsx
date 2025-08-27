import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { roleInfo } from "../constants/Roles.js";

const Layout = () => {
  const location = useLocation();

  // TAKE ROLE NAME FROM URL
  const roleFromUrl = location.pathname.split("/")[1];

  // CHECK IF ROLE ACTUALLY A PART OF THE VALID ROLES FROM ROLES
  const role = roleFromUrl in roleInfo ? roleFromUrl : null;
  if (!role) return <Navigate to="/not-found" replace />;

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      {/* PAGE CONTENT, HEADER, FOOTER */}
      <div className="bg-base-200 drawer-content flex flex-col min-h-screen">
        <Topbar role={role} />
        <main className="p-5 space-y-4 flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* SIDEBAR */}
      <Sidebar role={role} />
    </div>
  );
};

export default Layout;
