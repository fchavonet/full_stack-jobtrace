import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
