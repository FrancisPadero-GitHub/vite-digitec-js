import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { useMemberRole } from "../backend/context/useMemberRole";

const Layout = () => {
  const { memberRole } = useMemberRole();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-base-200">
      {/* SIDEBAR */}
      <Sidebar role={memberRole} isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* OVERLAY for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-col min-h-screen lg:ml-64">
        {/* TOPBAR */}
        <Topbar role={memberRole} onToggleSidebar={toggleSidebar} />
        
        {/* MAIN CONTENT with top padding to account for fixed header */}
        <main className="flex-grow p-4 mt-[8vh] md:mt-[9vh]">
          <Outlet />
        </main>
        
        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
