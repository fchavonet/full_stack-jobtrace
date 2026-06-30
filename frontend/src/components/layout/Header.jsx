import { BriefcaseBusiness, Home, LayoutDashboard, LogIn, LogOut, UserPlus, } from "lucide-react";

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
    <header className="sticky top-0 px-4 lg:px-8 text-base-content border-b border-base-300 bg-base-100/90 backdrop-blur-sm z-30">
      <div className="navbar w-full min-h-[65px] px-0">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link className="flex shrink-0 items-center gap-2 text-2xl font-bold" to="/">
            <BriefcaseBusiness className="w-6 h-6 text-primary" />

            <span>
              Job<span className="text-primary">Trace</span>
            </span>
          </Link>

          {pageTitle && (
            <div className="hidden md:block min-w-0 mt-1 pl-4 border-l border-base-300">
              <p className="text-sm font-semibold text-base-content/60 truncate ">
                {pageTitle}
              </p>
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <nav className="flex shrink-0 items-center gap-2">
            <button className="btn btn-square btn-ghost sm:hidden" type="button" aria-label="Connexion" onClick={handleOpenLogin}>
              <LogIn className="w-4 h-4" />
            </button>

            <button className="btn btn-square btn-primary sm:hidden text-white" type="button" aria-label="Créer un compte" onClick={handleOpenSignup}>
              <UserPlus className="w-4 h-4" />
            </button>

            <button className="btn btn-ghost hidden sm:inline-flex" type="button" onClick={handleOpenLogin}>
              Connexion
            </button>

            <button className="btn btn-primary hidden sm:inline-flex text-white" type="button" onClick={handleOpenSignup}>
              Créer un compte
            </button>
          </nav>
        )}

        {isAuthenticated && (
          <nav className="flex shrink-0 items-center gap-2">
            <Link className="btn btn-square btn-ghost sm:hidden" to={authenticatedLinkTo} aria-label={authenticatedLinkLabel}>
              {authenticatedIcon}
            </Link>

            <button className="btn btn-square btn-primary sm:hidden text-white" type="button" aria-label="Déconnexion" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </button>

            <Link className="btn btn-ghost hidden sm:inline-flex" to={authenticatedLinkTo}>
              {authenticatedLinkLabel}
            </Link>

            <button className="btn btn-primary hidden sm:inline-flex text-white" type="button" onClick={handleLogout} >
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
