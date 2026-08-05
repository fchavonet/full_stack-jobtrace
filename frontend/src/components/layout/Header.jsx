import {
  BriefcaseBusiness,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";

import { Link, useNavigate } from "react-router";

import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

function getAuthenticatedIcon(authenticatedLinkIcon) {
  if (authenticatedLinkIcon === "home") {
    return <Home className="w-5 h-5" />;
  }

  return <LayoutDashboard className="w-5 h-5" />;
}

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

  async function handleLogout() {
    try {
      await logout();

      showToast("Déconnexion réussie.", "success");
      navigate("/");
    } catch {
      showToast("Impossible de se déconnecter.", "error");
    }
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

  const authenticatedIcon = getAuthenticatedIcon(authenticatedLinkIcon);

  return (
    <header className="sticky top-0 w-full px-4 md:px-6 text-base-content border-b border-base-300 bg-base-100 z-30">
      <div className="navbar w-full min-h-[65px] px-0">
        <div className="min-w-0 flex-1 flex flex-row justify-start items-center gap-4">
          <Link
            className="shrink-0 flex flex-row justify-start items-center gap-2 text-2xl font-bold cursor-pointer"
            to="/"
          >
            <BriefcaseBusiness className="w-6 h-6 text-primary" />

            <span>
              Job<span className="text-primary">Trace</span>
            </span>
          </Link>

          {pageTitle && (
            <div className="hidden md:block min-w-0 mt-1 pl-4 text-sm font-semibold text-base-content/60 border-l border-base-300 truncate">
              {pageTitle}
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <nav className="shrink-0 flex flex-row justify-end items-center gap-2">
            <button
              className="btn btn-square btn-ghost md:hidden cursor-pointer"
              type="button"
              aria-label="Se connecter"
              onClick={handleOpenLogin}
            >
              <LogIn className="w-4 h-4" />
            </button>

            <button
              className="btn btn-square btn-primary md:hidden text-primary-content cursor-pointer"
              type="button"
              aria-label="Créer un compte"
              onClick={handleOpenSignup}
            >
              <UserPlus className="w-4 h-4" />
            </button>

            <button
              className="btn btn-ghost hidden md:inline-flex cursor-pointer"
              type="button"
              onClick={handleOpenLogin}
            >
              Se connecter
            </button>

            <button
              className="btn btn-primary hidden md:inline-flex text-primary-content cursor-pointer"
              type="button"
              onClick={handleOpenSignup}
            >
              Créer un compte
            </button>
          </nav>
        )}

        {isAuthenticated && (
          <nav className="shrink-0 flex flex-row justify-end items-center gap-2">
            <Link
              className="btn btn-square btn-ghost md:hidden cursor-pointer"
              to={authenticatedLinkTo}
              aria-label={authenticatedLinkLabel}
            >
              {authenticatedIcon}
            </Link>

            <button
              className="btn btn-square btn-primary md:hidden text-primary-content cursor-pointer"
              type="button"
              aria-label="Déconnexion"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </button>

            <Link
              className="btn btn-ghost hidden md:inline-flex cursor-pointer"
              to={authenticatedLinkTo}
            >
              {authenticatedLinkLabel}
            </Link>

            <button
              className="btn btn-primary hidden md:inline-flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer"
              type="button"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
