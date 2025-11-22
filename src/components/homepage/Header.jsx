import { BriefcaseBusiness, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="w-full p-4">
      {/* BRAND */}
      <div className="container mx-auto flex flex-row justify-between items-center">
        <Link className="flex flex-row justify-center items-center gap-2 text-4xl font-bold" to="/">
          <BriefcaseBusiness className="text-primary" size="34" /><h1>Job<span className="text-primary">Trace</span></h1>
        </Link>

        <div>
          {/* MODE TOGGLE */}
          <label className="swap swap-rotate">
            <input className="theme-controller" type="checkbox" value="dark" />
            <Sun className="swap-on" />
            <Moon className="swap-off" />
          </label>
        </div>
      </div>
    </header>
  );
}

export default Header;