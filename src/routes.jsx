import { createBrowserRouter, RouterProvider } from "react-router";

// TanStack Query + Auth Provider for universal user ID retrieval
import { AuthProvider } from "./backend/context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoutes from "./ProtectedRoutes.jsx";


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
import CoopLoansReleases from "./pages/treasurer/CoopLoansReleases.jsx";
import CoopLoansPayments from "./pages/treasurer/CoopLoansPayments.jsx";

// BOD Pages
import LoanApplications from "./pages/board/LoanApplications.jsx";
import LoanAccounts from "./pages/board/LoanAccounts.jsx";
import LoanAccountDetails from "./pages/board/LoanAccountDetails.jsx";

// REGULAR AND ASSOCIATE PAGES
import MemberDashboard from "./pages/members/MemberDashboard.jsx";
import MemberShareCapital from "./pages/members/MemberShareCapital.jsx";
import MemberLoanApp from "./pages/members/MemberLoanApp.jsx";
import MemberReports from "./pages/members/MemberReports.jsx";
import MemberHelp from "./pages/members/MemberHelp.jsx";
import MemberSettings from "./pages/members/MemberSettings.jsx";

// REGULAR MEMBERS Pages
import RegularMemberClubFunds from "./pages/members/RegularMemberClubFunds.jsx";
import Profile from "./pages/members/Profile.jsx";
import MemberLoanAcc from "./pages/members/MemberLoanAcc.jsx";


const queryClient = new QueryClient();

function AppRoutes() {
  // SHARED PAGES ROUTES
  const sharedRoutes = [
    { index: true, element: <Dashboard /> },
    { path: "member-records", element: <MemberRecords /> },
    { path: "member-profile/:memberId", element: <MemberProfile /> },
    { path: "activity-logs", element: <ActivityLogs /> },
    { path: "reports", element: <Reports /> },
  ];

  // Role-specific routes
  const adminRoutes = [
    { index: true, element: <UserManagement /> },
    { path: "add-member", element: <AddMember /> },
    { path: "system-settings", element: <SystemSettings /> },
    { path: "activity-logs", element: <ActivityLogs /> },
  ];

  const boardRoutes = [
    ...sharedRoutes,
    { path: "loan-applications", element: <LoanApplications /> },
    { path: "loan-accounts", element: <LoanAccounts /> },
    { path: "loan-account/details/:loan_id", element: <LoanAccountDetails /> },
  ];

  const treasurerRoutes = [
    ...sharedRoutes,
    { path: "coop-share-capital", element: <CoopShareCapital /> },
    { path: "club-funds", element: <ClubFunds /> },
    { path: "club-expenses", element: <ClubExpenses /> },
    { path: "coop-loans/releases", element: <CoopLoansReleases /> },
    { path: "coop-loans/payments", element: <CoopLoansPayments /> },
  ];

  const regularMemberRoutes = [
    { index: true, element: <MemberDashboard /> },
    { path: "regular-member-club-funds", element: <RegularMemberClubFunds /> },
    { path: "regular-member-share-capital", element: <MemberShareCapital /> },
    { path: "coop-loans/accounts", element: <MemberLoanAcc /> },
    { path: "coop-loans/my-applications", element: <MemberLoanApp /> },
    { path: "loan-account/details/:loan_id", element: <LoanAccountDetails /> },
    { path: "regular-member-reports", element: <MemberReports /> },
    { path: "regular-member-help", element: <MemberHelp /> },
    { path: "regular-member-settings", element: <MemberSettings /> },
    { path: "profile", element: <Profile /> },
  ];

  const associateMemberRoutes = [
    { index: true, element: <MemberDashboard /> },
    { path: "associate-member-share-capital", element: <MemberShareCapital /> },
    { path: "associate-member-coop-loans", element: <MemberLoanApp /> },
    { path: "associate-member-reports", element: <MemberReports /> },
    { path: "associate-member-help", element: <MemberHelp /> },
    { path: "associate-member-settings", element: <MemberSettings /> },
    { path: "profile", element: <Profile /> },
  ];

  // Then the router
  const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "/login", element: <Login /> },

    {
      path: "/admin",
      element: (
        <ProtectedRoutes roleAllowed="admin">
          <Layout />
        </ProtectedRoutes>
      ),
      children: adminRoutes,
    },

    {
      path: "/board",
      element: (
        <ProtectedRoutes roleAllowed="board">
          <Layout />
        </ProtectedRoutes>
      ),
      children: boardRoutes,
    },

    {
      path: "/treasurer",
      element: (
        <ProtectedRoutes roleAllowed="treasurer">
          <Layout />
        </ProtectedRoutes>
      ),
      children: treasurerRoutes,
    },

    {
      path: "/regular-member",
      element: (
        <ProtectedRoutes roleAllowed="regular-member">
          <Layout />
        </ProtectedRoutes>
      ),
      children: regularMemberRoutes,
    },

    {
      path: "/associate-member",
      element: (
        <ProtectedRoutes roleAllowed="associate-member">
          <Layout />
        </ProtectedRoutes>
      ),
      children: associateMemberRoutes,
    },

    { path: "*", element: <NotFound /> },
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