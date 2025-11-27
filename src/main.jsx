import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./global.css";

import ApplicationsSection from "../src/pages/dashboard/ApplicationsSection.jsx";
import CalendarSection from "../src/pages/dashboard/CalendarSection.jsx";
import ContactsSection from "../src/pages/dashboard/ContactsSection.jsx";
import DocumentsSection from "../src/pages/dashboard/DocumentsSection.jsx";
import HomeSection from "../src/pages/dashboard/HomeSection.jsx";
import SettingsSection from "../src/pages/dashboard/SettingsSection.jsx";
import StatisticsSection from "../src/pages/dashboard/StatisticsSection.jsx";

import App from "./App.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Homepage from "./pages/Homepage.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <NotFound />,

      children: [
        { index: true, element: <Homepage /> },

        {
          element: <ProtectedRoute />,
          children: [
            {
              path: "dashboard",
              element: <Dashboard />,

              children: [
                { index: true, element: <HomeSection /> },
                { path: "home", element: <HomeSection /> },
                { path: "applications", element: <ApplicationsSection /> },
                { path: "calendar", element: <CalendarSection /> },
                { path: "contacts", element: <ContactsSection /> },
                { path: "documents", element: <DocumentsSection /> },
                { path: "statistics", element: <StatisticsSection /> },
                { path: "settings", element: <SettingsSection /> },
              ]
            }
          ]
        }
      ],
    },
  ],

  {
    basename: "/full_stack-jobtrace/"
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);
