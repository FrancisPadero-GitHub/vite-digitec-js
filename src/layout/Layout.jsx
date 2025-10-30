import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { useMemberRole } from "../backend/context/useMemberRole";

const Layout = () => {
  const { memberRole } = useMemberRole();
  return (
  <div className="drawer lg:drawer-open">
    <input
      id="my-drawer"
      name="my-drawer"
      type="checkbox"
      className="drawer-toggle"
      aria-label="Toggle navigation menu"
    />

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
