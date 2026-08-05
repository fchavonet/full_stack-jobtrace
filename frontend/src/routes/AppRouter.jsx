import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import App from "../App.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const HomePage = lazy(function () {
  return import("../pages/HomePage.jsx");
});

const NotFoundPage = lazy(function () {
  return import("../pages/NotFoundPage.jsx");
});

const ResetPasswordPage = lazy(function () {
  return import("../pages/ResetPasswordPage.jsx");
});

const VerifyEmailPage = lazy(function () {
  return import("../pages/VerifyEmailPage.jsx");
});

const DashboardLayout = lazy(function () {
  return import("../components/layout/DashboardLayout.jsx");
});

const DashboardPage = lazy(function () {
  return import("../pages/DashboardPage.jsx");
});

const ApplicationsPage = lazy(function () {
  return import("../pages/ApplicationsPage.jsx");
});

const CalendarPage = lazy(function () {
  return import("../pages/CalendarPage.jsx");
});

const ContactsPage = lazy(function () {
  return import("../pages/ContactsPage.jsx");
});

const DocumentsPage = lazy(function () {
  return import("../pages/DocumentsPage.jsx");
});

const AchievementsPage = lazy(function () {
  return import("../pages/AchievementsPage.jsx");
});

const StatisticsPage = lazy(function () {
  return import("../pages/StatisticsPage.jsx");
});

const SettingsPage = lazy(function () {
  return import("../pages/SettingsPage.jsx");
});

function PageLoader() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-base-200 text-base-content">
      <span className="loading loading-spinner loading-lg text-primary" />

      <p className="mt-3 text-sm text-base-content/70">
        Chargement...
      </p>
    </main>
  );
}

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

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default AppRouter;
