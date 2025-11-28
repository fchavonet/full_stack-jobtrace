import { BriefcaseBusiness, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useToast } from "../../hooks/useToast";

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();

  // Handle user logout and redirect to homepage.
  async function handleLogout() {
    await logout();
    showToast("Déconnexion réussie", "success");
    navigate("/");
  }

  return (
    <header className="w-full bg-base-100">
      <div className="container p-4 mx-auto flex flex-row justify-between items-center">
        {/* BRAND */}
        <Link className="flex flex-row justify-center items-center gap-2 text-4xl font-bold" to="/">
          <BriefcaseBusiness className="text-primary" size="34" /><h1>Job<span className="text-primary">Trace</span></h1>
        </Link>

        <div className="flex flex-row justify-center items-center gap-4">
          {/* */}
          {user ? (
            <>
              {/* DESKTOP LOGOUT BUTTON */}
              <button className="btn btn-primary w-40 hidden lg:flex text-white border-none shadow-none" onClick={handleLogout}>
                Se déconnecter
              </button>

              {/* MOBILE LOGOUT BUTTON */}
              <button className="btn btn-square btn-primary flex lg:hidden text-white border-none shadow-none" onClick={handleLogout}>
                <LogOut className="transform -scale-x-100" />
              </button>
            </>
          ) : (
            <>
              {/* DESKTOP LOGIN BUTTON */}
              <button className="btn btn-primary w-40 hidden lg:flex text-white border-none shadow-none" onClick={function () { window.openLoginModal(); }}>
                Se connecter
              </button>

              {/* MOBILE LOGIN BUTTON */}
              <button className="btn btn-square btn-primary flex lg:hidden text-white border-none shadow-none" onClick={function () { window.openLoginModal(); }}>
                <LogIn />
              </button>
            </>
          )}

          {/* MODE TOGGLE */}
          <label className="swap swap-rotate">
            <input className="theme-controller" type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
            <Sun className="swap-on" />
            <Moon className="swap-off" />
          </label>
        </div>
      </div>
    </header>
  );
}

export default Header;
