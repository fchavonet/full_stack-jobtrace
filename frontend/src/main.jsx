import ReactDOM from "react-dom/client";

import "./global.css";

import AppRouter from "./routes/AppRouter.jsx";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ThemeProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ThemeProvider>
  </AuthProvider>
);
