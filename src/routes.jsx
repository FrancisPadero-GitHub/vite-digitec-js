import { createBrowserRouter, RouterProvider } from "react-router";

// TanStack Query + Auth Provider for universal user ID retrieval
import { AuthProvider } from "./backend/context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoutes from "./ProtectedRoutes";


// Pages
import Layout from "./layout/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";

// SHARED PAGES 
import Dashboard from "./pages/shared/Dashboard";
import MemberRecords from "./pages/shared/MemberRecords";
import Reports from "./pages/shared/Reports";
import MemberProfile from "./pages/shared/MemberProfile";
import ActivityLogs from "./pages/shared/ActivityLogs";

// ADMIN
import AddMember from "./pages/admin/AddMember";
import SystemSettings from "./pages/admin/SystemSettings";
import UserManagement from "./pages/admin/UserManagement";

// TREASURER PAGES
import CoopShareCapital from "./pages/treasurer/CoopShareCapital";
import ClubFunds from "./pages/treasurer/ClubFunds";
import ClubExpenses from "./pages/treasurer/ClubExpenses";
import CoopLoansReleases from "./pages/treasurer/CoopLoansReleases";
import CoopLoansPayments from "./pages/treasurer/CoopLoansPayments";

// BOD Pages
import LoanApplications from "./pages/board/LoanApplications";
import LoanAccounts from "./pages/board/LoanAccounts";
import LoanAccountDetails from "./pages/board/LoanAccountDetails";
import LoansPayments from "./pages/board/LoanPayments";

// REGULAR AND ASSOCIATE PAGES
import MemberDashboard from "./pages/members/MemberDashboard";
import MemberCoopShareCapital from "./pages/members/MemberCoopShareCapital";
import MemberPayments from "./pages/members/MemberPayments";
import MemberLoanApp from "./pages/members/MemberLoanApp";
import MemberReports from "./pages/members/MemberReports";
import MemberHelp from "./pages/members/MemberHelp";
import MemberSettings from "./pages/members/MemberSettings";

// REGULAR MEMBERS Pages
import MemberClubFunds from "./pages/members/MemberClubFunds";
import Profile from "./pages/members/Profile";
import MemberLoanAcc from "./pages/members/MemberLoanAcc";



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

  const boardSharedTreasurerPages = [
    { path: "coop-share-capital", element: <CoopShareCapital /> },
    { path: "club-funds", element: <ClubFunds /> },
    { path: "club-expenses", element: <ClubExpenses /> },
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
    ...boardSharedTreasurerPages, 
    { path: "coop-loans/loan-accounts", element: <LoanAccounts /> },   
    { path: "coop-loans/loan-applications", element: <LoanApplications /> },
    { path: "coop-loans/loan-payments", element: <LoansPayments /> },
    { path: "loan-account/details/:loan_id", element: <LoanAccountDetails /> },   
  ];

  const treasurerRoutes = [
    ...sharedRoutes,
    ...boardSharedTreasurerPages,
    { path: "coop-loans/releases", element: <CoopLoansReleases /> },
    { path: "coop-loans/payments", element: <CoopLoansPayments /> },
  ];

  const regularMemberRoutes = [
    { index: true, element: <MemberDashboard /> },
    { path: "regular-member-club-funds", element: <MemberClubFunds /> },
    { path: "regular-member-share-capital", element: <MemberCoopShareCapital /> },
    { path: "coop-loans/loan-accounts", element: <MemberLoanAcc /> }, 
    { path: "coop-loans/loan-applications", element: <MemberLoanApp /> },
    { path: "coop-loans/loan-payments", element: <MemberPayments /> },
    { path: "loan-account/details/:loan_id", element: <LoanAccountDetails /> },
    { path: "regular-member-help", element: <MemberHelp /> },
    { path: "regular-member-settings", element: <MemberSettings /> },
    { path: "profile", element: <Profile /> },
  ];

  const associateMemberRoutes = [
    { index: true, element: <MemberDashboard /> },
    { path: "associate-member-share-capital", element: <MemberCoopShareCapital /> },
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