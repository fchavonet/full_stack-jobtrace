import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./global.css";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";

import App from "./App.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";

import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";

import AchievementsPage from "./pages/AchievementsPage.jsx";
import ApplicationsPage from "./pages/ApplicationsPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import ContactsPage from "./pages/ContactsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import StatisticsPage from "./pages/StatisticsPage.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "verify-email",
        element: <VerifyEmailPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
              {
                path: "applications",
                element: <ApplicationsPage />,
              },
              {
                path: "calendar",
                element: <CalendarPage />,
              },
              {
                path: "contacts",
                element: <ContactsPage />,
              },
              {
                path: "documents",
                element: <DocumentsPage />,
              },
              {
                path: "achievements",
                element: <AchievementsPage />,
              },
              {
                path: "statistics",
                element: <StatisticsPage />,
              },
              {
                path: "settings",
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
