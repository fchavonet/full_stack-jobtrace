import {
  BarChart3,
  CalendarDays,
  FilePen,
  FileText,
  House,
  Settings,
  Target,
  UsersRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function closeDrawer() {
  const drawer = document.getElementById("dashboard-sidebar-drawer");

  if (drawer) {
    drawer.checked = false;
  }
}

function getNavLinkClassName({ isActive }) {
  let className = "flex items-center gap-2 rounded-lg px-3 py-2 text-base hover:bg-primary hover:text-primary-content";

  if (isActive) {
    className = "flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-base text-primary-content";
  }

  return className;
}

function getDisabledLinkClassName() {
  return "flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-base text-base-content/40";
}

function Sidebar() {
  return (
    <nav className="flex h-full w-64 flex-col justify-between border-r border-base-300 bg-base-100">
      <div className="w-full p-4">
        <ul className="menu w-full gap-2 p-0">
          <li>
            <NavLink className={getNavLinkClassName} to="/dashboard" onClick={closeDrawer}>
              <House />
              Accueil
            </NavLink>
          </li>

          <li>
            <button className={getDisabledLinkClassName()} type="button" disabled>
              <FilePen />
              Candidatures
            </button>
          </li>

          <li>
            <button className={getDisabledLinkClassName()} type="button" disabled>
              <CalendarDays />
              Calendrier
            </button>
          </li>

          <li>
            <button className={getDisabledLinkClassName()} type="button" disabled>
              <UsersRound />
              Contacts
            </button>
          </li>

          <li>
            <button className={getDisabledLinkClassName()} type="button" disabled>
              <FileText />
              Documents
            </button>
          </li>

          <li>
            <button className={getDisabledLinkClassName()} type="button" disabled>
              <Target />
              Objectifs
            </button>
          </li>

          <li>
            <button className={getDisabledLinkClassName()} type="button" disabled>
              <BarChart3 />
              Statistiques
            </button>
          </li>
        </ul>
      </div>

      <div className="border-t border-base-300 p-4">
        <button
          className="btn btn-outline btn-secondary w-full"
          type="button"
          disabled
        >
          <Settings size={20} />
          Paramètres
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;
