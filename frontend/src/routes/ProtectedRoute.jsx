import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-200 text-base-content">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary" />

          <p className="text-sm text-base-content/70">
            Chargement de votre session...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
