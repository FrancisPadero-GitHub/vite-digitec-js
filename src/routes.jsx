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
import DashboardV2 from "./pages/shared/DashboardV2";
import MemberRecords from "./pages/shared/MemberRecords";
import Reports from "./pages/shared/Reports";
import MemberProfile from "./pages/shared/MemberProfile";
import ActivityLogs from "./pages/shared/ActivityLogs";

import IncomeStatement from "./pages/shared/reports/IncomeStatement";
import BalanceSheet from "./pages/shared/reports/BalanceSheet";
import MemberStatements from "./pages/shared/reports/MemberStatements";
import LoanReports from "./pages/shared/reports/LoanReports";
import ClubCoopFunds from "./pages/shared/reports/ClubCoopFunds";
import TransactionLogs from "./pages/shared/reports/TransactionLogs";
import SummaryCharts from "./pages/shared/reports/SummaryCharts";

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
import CoopLoanPaymentSchedules from "./pages/treasurer/CoopLoanPaymentSchedules";
import LoanProducts from "./pages/treasurer/LoanProducts";
import TreasurerSettings from "./pages/treasurer/Settings";

// BOD Pages
import LoanApplicationsV2 from "./pages/board/LoanApplicationsV2";
import LoanAccounts from "./pages/board/LoanAccounts";
import LoanAccountDetails from "./pages/board/LoanAccountDetails";
import BoardSettings from "./pages/board/Settings";
import Announcement from "./pages/board/Announcement";

// REGULAR AND ASSOCIATE PAGES
import MemberDashboardV2 from "./pages/members/MemberDashboardV2";
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
    { index: true, element: <DashboardV2 /> },
    { path: "member-records", element: <MemberRecords /> },
    { path: "member-profile/:memberId", element: <MemberProfile /> },
    { path: "activity-logs", element: <ActivityLogs /> },
    { path: "reports", element: <Reports /> },
    { path: "reports/income-statement", element: <IncomeStatement /> },
    { path: "reports/balance-sheet", element: <BalanceSheet /> },
    { path: "reports/member-statements", element: <MemberStatements /> },
    { path: "reports/loan-reports", element: <LoanReports /> },
    { path: "reports/club-coop-funds", element: <ClubCoopFunds /> },
    { path: "reports/transaction-logs", element: <TransactionLogs /> },
    { path: "reports/summary-charts", element: <SummaryCharts /> },
    { path: "coop-loans/loan-accounts", element: <LoanAccounts /> },   
  ];

  const boardSharedTreasurerPages = [
    { path: "coop-share-capital", element: <CoopShareCapital /> },
    { path: "club-funds", element: <ClubFunds /> },
    { path: "club-expenses", element: <ClubExpenses /> },
    { path: "coop-loans/payment-schedules", element: <CoopLoanPaymentSchedules /> },
    { path: "coop-loans/payments", element: <CoopLoansPayments /> },
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
    { path: "coop-loans/loan-applications", element: <LoanApplicationsV2 /> },
    { path: "loan-account/details/:loan_id", element: <LoanAccountDetails /> },
    { path: "settings", element: <BoardSettings /> },
    { path: "announcements", element: <Announcement /> },
  ];

  const treasurerRoutes = [
    ...sharedRoutes,
    ...boardSharedTreasurerPages,
    { path: "loan-account/details/:loan_id", element: <LoanAccountDetails /> },
    { path: "coop-loans/releases", element: <CoopLoansReleases /> },
    { path: "settings/loan-products", element: <LoanProducts /> },
    { path: "settings", element: <TreasurerSettings /> },
  ];

  const regularMemberRoutes = [
    { index: true, element: <MemberDashboardV2 /> },
    { path: "club-funds", element: <MemberClubFunds /> },
    { path: "share-capital", element: <MemberCoopShareCapital /> },
    { path: "coop-loans/loan-accounts", element: <MemberLoanAcc /> },
    { path: "coop-loans/loan-applications", element: <MemberLoanApp /> },
    { path: "coop-loans/loan-payments", element: <MemberPayments /> },
    { path: "loan-account/details/:loan_id", element: <LoanAccountDetails /> },
    { path: "help", element: <MemberHelp /> },
    { path: "reports", element: <MemberReports /> },
    { path: "settings", element: <MemberSettings /> },
    { path: "profile", element: <Profile /> },
  ];

  const associateMemberRoutes = [
    { index: true, element: <MemberDashboardV2 /> },
    { path: "share-capital", element: <MemberCoopShareCapital /> },
    { path: "coop-loans", element: <MemberLoanApp /> },
    { path: "reports", element: <MemberReports /> },
    { path: "help", element: <MemberHelp /> },
    { path: "settings", element: <MemberSettings /> },
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