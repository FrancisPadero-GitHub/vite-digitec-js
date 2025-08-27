import { createBrowserRouter, RouterProvider } from "react-router";
import { getRolePath } from "./constants/Roles.js";

// Pages
import Layout from "./layout/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import NotFound from "./pages/NotFound.jsx";

// TanStack Query + Auth Provider for universal user ID retrieval
import { AuthProvider } from "./backend/context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


// ADMIN

import AddMember from "./pages/admin/AddMember";
import SystemSettings from "./pages/admin/SystemSettings";












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
    {
      path: `/${getRolePath("admin")}`,
      element: <Layout />,
      children: [
        { index: true, element: <AddMember /> },
        { path: "add-member", element: <AddMember /> },
        { path: "system-settings", element: <SystemSettings /> },
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
