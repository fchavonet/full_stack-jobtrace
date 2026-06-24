import {
  BriefcaseBusiness,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

function Header({
  pageTitle,
  onOpenLogin,
  onOpenSignup,
  authenticatedLinkLabel = "Tableau de bord",
  authenticatedLinkTo = "/dashboard",
  authenticatedLinkIcon = "dashboard",
}) {
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    showToast("Déconnexion réussie.", "success");
    navigate("/");
  }

  function handleOpenLogin() {
    if (onOpenLogin) {
      onOpenLogin();
    }
  }

  function handleOpenSignup() {
    if (onOpenSignup) {
      onOpenSignup();
    }
  }

  let authenticatedIcon = <LayoutDashboard className="h-5 w-5" />;

  if (authenticatedLinkIcon === "home") {
    authenticatedIcon = <Home className="h-5 w-5" />;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/90 px-4 text-base-content backdrop-blur-sm lg:px-8">
      <div className="navbar min-h-[65px] w-full px-0">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link className="flex shrink-0 items-center gap-2 text-2xl font-bold" to="/">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />

            <span>
              Job<span className="text-primary">Trace</span>
            </span>
          </Link>

          {pageTitle && (
            <div className="hidden min-w-0 mt-1 border-l border-base-300 pl-4 md:block">
              <p className="truncate text-sm font-semibold text-base-content/60">
                {pageTitle}
              </p>
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <nav className="flex shrink-0 items-center gap-2">
            <button
              className="btn btn-ghost btn-square sm:hidden"
              type="button"
              aria-label="Connexion"
              onClick={handleOpenLogin}
            >
              <LogIn className="h-5 w-5" />
            </button>

            <button
              className="btn btn-primary btn-square text-white sm:hidden"
              type="button"
              aria-label="Créer un compte"
              onClick={handleOpenSignup}
            >
              <UserPlus className="h-5 w-5" />
            </button>

            <button
              className="btn btn-ghost hidden sm:inline-flex"
              type="button"
              onClick={handleOpenLogin}
            >
              Connexion
            </button>

            <button
              className="btn btn-primary hidden text-white sm:inline-flex"
              type="button"
              onClick={handleOpenSignup}
            >
              Créer un compte
            </button>
          </nav>
        )}

        {isAuthenticated && (
          <nav className="flex shrink-0 items-center gap-2">
            <Link
              className="btn btn-ghost btn-square sm:hidden"
              to={authenticatedLinkTo}
              aria-label={authenticatedLinkLabel}
            >
              {authenticatedIcon}
            </Link>

            <button
              className="btn btn-primary btn-square text-white sm:hidden"
              type="button"
              aria-label="Déconnexion"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </button>

            <Link className="btn btn-ghost hidden sm:inline-flex" to={authenticatedLinkTo}>
              {authenticatedLinkLabel}
            </Link>

            <button
              className="btn btn-primary hidden text-white sm:inline-flex"
              type="button"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
