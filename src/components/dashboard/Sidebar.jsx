import { BriefcaseBusiness, FileChartColumn, FileClock, FilePen, FileText, FileUser, House, Moon, Settings, Sun } from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Close drawer on mobile after navigation.
  function closeDrawer() {
    const drawer = document.getElementById("sidebar-drawer");
    if (drawer) {
      drawer.checked = false;
    }
  }

  const navigate = useNavigate();

  // Handle user logout and redirect to homepage.
  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <>
      <div className="w-full">
        {/* BRAND */}
        <Link className="w-full p-4 flex flex-row justify-center items-center gap-2 text-4xl font-bold border-b border-base-300" to="/">
          <BriefcaseBusiness className="text-primary" size="34" /><h1>Job<span className="text-primary">Trace</span></h1>
        </Link>

        {/* NAVIGATION MENU */}
        <nav className="w-full p-4">
          <ul className="w-full menu p-0 gap-2">
            <li>
              <NavLink className={({ isActive }) => `flex items-center gap-2 text-base ${isActive ? "text-white bg-primary " : "hover:text-white hover:bg-primary"}`} to="home" onClick={closeDrawer}>
                <House /> Accueil
              </NavLink>
            </li>

            <li>
              <NavLink className={({ isActive }) => `flex items-center gap-2 text-base ${isActive ? "text-white bg-primary" : "hover:text-white hover:bg-primary"}`} to="applications" onClick={closeDrawer}>
                <FilePen /> Candidatures
              </NavLink>
            </li>

            <li>
              <NavLink className={({ isActive }) => `flex items-center gap-2 text-base ${isActive ? "text-white bg-primary" : "hover:text-white hover:bg-primary"}`} to="calendar" onClick={closeDrawer}>
                <FileClock /> Calendrier
              </NavLink>
            </li>

            <li>
              <NavLink className={({ isActive }) => `flex items-center gap-2 text-base ${isActive ? "text-white bg-primary" : "hover:text-white hover:bg-primary"}`} to="contacts" onClick={closeDrawer}>
                <FileUser /> Contacts
              </NavLink>
            </li>

            <li>
              <NavLink className={({ isActive }) => `flex items-center gap-2 text-base ${isActive ? "text-white bg-primary" : "hover:text-white hover:bg-primary"}`} to="documents" onClick={closeDrawer}>
                <FileText /> Documents
              </NavLink>
            </li>

            <li>
              <NavLink className={({ isActive }) => `flex items-center gap-2 text-base ${isActive ? "text-white bg-primary" : "hover:text-white hover:bg-primary"}`} to="statistics" onClick={closeDrawer}>
                <FileChartColumn /> Statistiques
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* FOOTER SECTION */}
      <div className="w-full p-4 flex flex-col justify-center items-center gap-2 border-t border-base-300">
        {user.email}

        <div className="w-full flex flex-row justify-between items-center gap-2">
          <NavLink className={({ isActive }) => `btn btn-outline btn-secondary flex flex-grow justify-center items-center gap-2 ${isActive ? "text-white bg-secondary" : "hover:text-white hover:bg-secondary"}`} to="settings" onClick={closeDrawer}>
            <Settings size="20" /> Paramètres
          </NavLink>

          {/* MODE TOGGLE */}
          <label className="swap swap-rotate">
            <input className="theme-controller" type="checkbox" checked={theme === "dark"} onChange={toggleTheme} />
            <Sun className="swap-on" />
            <Moon className="swap-off" />
          </label>
        </div>

        <button className="w-full btn btn-primary texte-white border-none shadow-none" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>
    </>
  );
}

export default Sidebar;
