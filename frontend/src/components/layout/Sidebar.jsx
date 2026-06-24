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

function getSettingsLinkClassName({ isActive }) {
  let className = "flex items-center justify-start gap-2 rounded-lg border border-primary px-3 py-2 text-base font-medium text-primary hover:bg-primary hover:text-primary-content";

  if (isActive) {
    className = "flex items-center justify-start gap-2 rounded-lg border border-primary bg-primary px-3 py-2 text-base font-medium text-primary-content";
  }

  return className;
}

function getDisplayName(userProfile) {
  const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  if (userProfile.email) {
    return userProfile.email;
  }

  return "Utilisateur";
}

function getInitials(userProfile) {
  const firstInitial = userProfile.firstName.trim().charAt(0).toUpperCase();
  const lastInitial = userProfile.lastName.trim().charAt(0).toUpperCase();

  let initials = firstInitial + lastInitial;

  if (!initials) {
    initials = "JT";
  }

  return initials;
}

function Sidebar({ userProfile }) {
  return (
    <nav className="flex h-full w-64 flex-col justify-between border-r border-base-300 bg-base-100 opacity-100">
      <div className="w-full p-4">
        <ul className="menu w-full gap-2 p-0">
          <li>
            <NavLink
              className={getNavLinkClassName}
              to="/dashboard"
              end
              onClick={closeDrawer}
            >
              <House />
              Tableau de bord
            </NavLink>
          </li>

          <li>
            <NavLink
              className={getNavLinkClassName}
              to="/dashboard/applications"
              onClick={closeDrawer}
            >
              <FilePen />
              Candidatures
            </NavLink>
          </li>

          <li>
            <NavLink
              className={getNavLinkClassName}
              to="/dashboard/calendar"
              onClick={closeDrawer}
            >
              <CalendarDays />
              Calendrier
            </NavLink>
          </li>

          <li>
            <NavLink
              className={getNavLinkClassName}
              to="/dashboard/contacts"
              onClick={closeDrawer}
            >
              <UsersRound />
              Contacts
            </NavLink>
          </li>

          <li>
            <NavLink
              className={getNavLinkClassName}
              to="/dashboard/documents"
              onClick={closeDrawer}
            >
              <FileText />
              Documents
            </NavLink>
          </li>

          <li>
            <NavLink
              className={getNavLinkClassName}
              to="/dashboard/achievements"
              onClick={closeDrawer}
            >
              <Target />
              Objectifs
            </NavLink>
          </li>

          <li>
            <NavLink
              className={getNavLinkClassName}
              to="/dashboard/statistics"
              onClick={closeDrawer}
            >
              <BarChart3 />
              Statistiques
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="border-t border-base-300 p-4">
        <div className="mb-3 rounded-xl bg-base-200 p-3">
          <div className="flex min-w-0 items-center gap-3">
            {userProfile.avatarUrl && (
              <img
                className="h-11 w-11 shrink-0 rounded-full object-cover"
                src={userProfile.avatarUrl}
                alt="Avatar utilisateur"
              />
            )}

            {!userProfile.avatarUrl && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                {getInitials(userProfile)}
              </div>
            )}

            <p className="min-w-0 truncate text-sm font-medium">
              {getDisplayName(userProfile)}
            </p>
          </div>
        </div>

        <NavLink
          className={getSettingsLinkClassName}
          to="/dashboard/settings"
          onClick={closeDrawer}
        >
          <Settings className="h-5 w-5" />
          Paramètres
        </NavLink>
      </div>
    </nav>
  );
}

export default Sidebar;
