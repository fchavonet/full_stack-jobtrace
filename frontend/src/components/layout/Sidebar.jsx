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

function Sidebar() {
  return (
    <nav className="flex h-full w-64 flex-col justify-between border-r border-base-300 bg-base-100 opacity-100">
      <div className="w-full p-4">
        <ul className="menu w-full gap-2 p-0">
          <li>
            <NavLink className={getNavLinkClassName} to="/dashboard" end onClick={closeDrawer}>
              <House />
              Tablead de bord
            </NavLink>
          </li>

          <li>
            <NavLink className={getNavLinkClassName} to="/dashboard/applications" onClick={closeDrawer}>
              <FilePen />
              Candidatures
            </NavLink>
          </li>

          <li>
            <NavLink className={getNavLinkClassName} to="/dashboard/calendar" onClick={closeDrawer}>
              <CalendarDays />
              Calendrier
            </NavLink>
          </li>

          <li>
            <NavLink className={getNavLinkClassName} to="/dashboard/contacts" onClick={closeDrawer}>
              <UsersRound />
              Contacts
            </NavLink>
          </li>

          <li>
            <NavLink className={getNavLinkClassName} to="/dashboard/documents" onClick={closeDrawer}>
              <FileText />
              Documents
            </NavLink>
          </li>

          <NavLink className={getNavLinkClassName} to="/dashboard/achievements" onClick={closeDrawer}>
            <Target />
            Objectifs
          </NavLink>

          <li>
            <NavLink className={getNavLinkClassName} to="/dashboard/statistics" onClick={closeDrawer}>
              <BarChart3 />
              Statistiques
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="border-t border-base-300 p-4">
        <NavLink className={getNavLinkClassName} to="/dashboard/settings" onClick={closeDrawer}>
          <Settings />
          Paramètres
        </NavLink>
      </div>
    </nav>
  );
}

export default Sidebar;
