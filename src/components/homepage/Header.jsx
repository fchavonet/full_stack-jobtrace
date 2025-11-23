import { BriefcaseBusiness, LogIn, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

import { useTheme } from "../../hooks/useTheme";

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full p-4">
      {/* BRAND */}
      <div className="container mx-auto flex flex-row justify-between items-center">
        <Link className="flex flex-row justify-center items-center gap-2 text-4xl font-bold" to="/">
          <BriefcaseBusiness className="text-primary" size="34" /><h1>Job<span className="text-primary">Trace</span></h1>
        </Link>

        <div className="flex flex-row justify-center items-center gap-4">
          {/* DESKTOP LOGIN BUTTON */}
          <Link className="btn btn-primary hidden lg:flex text-white border-none shadow-none" to="/dashboard">
            Se connecter
          </Link>

          {/* MOBILE LOGIN BUTTON */}
          <Link className="btn btn-square btn-primary flex lg:hidden text-white border-none shadow-none flex lg:hidden" to="/dashboard">
            <LogIn />
          </Link>

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