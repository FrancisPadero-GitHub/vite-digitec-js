import { createBrowserRouter, RouterProvider } from "react-router";

// TanStack Query + Auth Provider for universal user ID retrieval
import { AuthProvider } from "./backend/context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./ProtectedRoutes.jsx";


// Pages
import Layout from "./layout/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import NotFound from "./pages/NotFound.jsx";

// SHARED PAGES 
import Dashboard from "./pages/shared/Dashboard.jsx";
import MemberRecords from "./pages/shared/MemberRecords.jsx";
import Reports from "./pages/shared/Reports.jsx";
import MemberProfile from "./pages/shared/MemberProfile.jsx";
import ActivityLogs from "./pages/shared/ActivityLogs.jsx";

// ADMIN
import AddMember from "./pages/admin/AddMember.jsx";
import SystemSettings from "./pages/admin/SystemSettings.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";

// TREASURER PAGES
import CoopShareCapital from "./pages/treasurer/CoopShareCapital.jsx";
import ClubFunds from "./pages/treasurer/ClubFunds.jsx";
import ClubExpenses from "./pages/treasurer/ClubExpenses.jsx";
import CoopLoans from "./pages/treasurer/CoopLoans.jsx";

// BOD Pages
import LoanApplications from "./pages/board/LoanApplications.jsx";

// REGULAR AND ASSOCIATE PAGES
import MemberDashboard from "./pages/members/MemberDashboard.jsx";
import MemberShareCapital from "./pages/members/MemberShareCapital.jsx";
import MemberCoopLoans from "./pages/members/MemberCoopLoans.jsx";
import MemberReports from "./pages/members/MemberReports.jsx";
import MemberHelp from "./pages/members/MemberHelp.jsx";
import MemberSettings from "./pages/members/MemberSettings.jsx";

// REGULAR MEMBERS Pages
import RegularMemberClubFunds from "./pages/members/RegularMemberClubFunds.jsx";
import Profile from "./pages/members/Profile.jsx";
import MemberLoanApp from "./pages/members/MemberLoanApp.jsx";



const queryClient = new QueryClient();

function AppRoutes() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Landing />,
    },
    {
      path: "/login",
      element: <Login />,
    },



    // ADMIN
    /**
     * So the idea on parent path and children is 
     *  
     * the children will inherit the parent path for example 
     * 
     * /admin/add-member
     * 
     * and also this will be used in sidebar to pinpoint where the Link path will be
     * 
     */
    {
      path: "/admin",
      element: (
        <ProtectedRoute roleAllowed="admin">
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <UserManagement /> },
        { path: "add-member", element: <AddMember /> },
        { path: "system-settings", element: <SystemSettings /> },
        { path: "activity-logs", element: <ActivityLogs /> },
      ],
    },

    // BOD
    {
      path: "/board",
      element: (
        <ProtectedRoute roleAllowed="board">
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Dashboard /> },
        { path: "member-records", element: <MemberRecords /> },
        { path: "member-profile", element: <MemberProfile /> },
        { path: "activity-logs", element: <ActivityLogs /> },
        { path: "loan-applications", element: <LoanApplications /> },
        { path: "reports", element: <Reports /> },
      ],
    },

    // REGULAR MEMBERS
    {
      path: "/regular-member",
      element: (
        <ProtectedRoute roleAllowed="regular-member">
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <MemberDashboard /> },
        { path: "regular-member-club-funds", element: <RegularMemberClubFunds /> },
        { path: "regular-member-share-capital", element: <MemberShareCapital /> },
        
        // Coop Loans collapsible sub-routes
        // { path: "coop-loans/my-information", element: <MemberCoopLoans type="information" /> },
        // { path: "coop-loans/payments", element: <MemberCoopLoans type="payments" /> },
        // { path: "coop-loans/active", element: <MemberCoopLoans type="active" /> },
        { path: "coop-loans/my-applications", element: <MemberLoanApp /> },
        // { path: "coop-loans/approved", element: <MemberCoopLoans type="approved" /> },
        
        { path: "regular-member-reports", element: <MemberReports /> },
        { path: "regular-member-help", element: <MemberHelp /> },
        { path: "regular-member-settings", element: <MemberSettings /> },
        { path: "profile", element: <Profile /> },
      ],
    },


    // ASSOCIATE MEMBERS
    {
      path: "/associate-member",
      element: (
        <ProtectedRoute roleAllowed="associate-member">
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <MemberDashboard /> },
        { path: "associate-member-share-capital", element: <MemberShareCapital /> },
        { path: "associate-member-coop-loans", element: <MemberCoopLoans /> },
        { path: "associate-member-reports", element: <MemberReports /> },
        { path: "associate-member-help", element: <MemberHelp /> },
        { path: "associate-member-settings", element: <MemberSettings /> },
        { path: "profile", element: <Profile /> },

      ],
    },


    // TREASURER
    {
      path:"/treasurer",
      element: (
        <ProtectedRoute roleAllowed="treasurer">
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Dashboard /> },
        { path: "member-records", element: <MemberRecords /> },
        { path: "member-profile", element: <MemberProfile /> },
        { path: "activity-logs", element: <ActivityLogs /> },
        { path: "coop-share-capital", element: <CoopShareCapital /> },
        { path: "club-funds", element: <ClubFunds /> },
        { path: "club-expenses", element: <ClubExpenses /> },
        { path: "coop-loans", element: <CoopLoans /> },
        { path: "reports", element: <Reports /> },
      ],
    },

    // NOT FOUND
    {
      path: "*",
      element: <NotFound />,
    },


  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppRoutes;

// This is for the Tanstack Query Dev tools
window.__TANSTACK_QUERY_CLIENT__ = queryClient;