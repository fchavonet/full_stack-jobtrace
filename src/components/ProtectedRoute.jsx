import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
