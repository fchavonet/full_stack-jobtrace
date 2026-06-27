import { Settings } from "lucide-react";

import { NavLink } from "react-router-dom";

import { DASHBOARD_NAVIGATION_GROUPS } from "../../../constants/navigation.constants";

import SidebarNavItem from "./SidebarNavItem";

function closeDrawer() {
  const drawer = document.getElementById("dashboard-sidebar-drawer");

  if (drawer) {
    drawer.checked = false;
    drawer.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function getSettingsLinkClassName({ isActive }) {
  const baseClass = "w-full px-4 py-2 flex justify-center items-center gap-2 text-sm font-medium rounded-lg border border-primary";

  if (isActive) {
    return baseClass + " text-primary-content bg-primary";
  }

  return baseClass + " text-primary hover:text-primary-content hover:bg-primary";
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
    <nav className="w-64 h-full flex flex-col justify-between items-center border-r border-base-300 bg-base-100">
      <div className="w-full p-4">
        <div className="flex flex-col gap-4">
          {DASHBOARD_NAVIGATION_GROUPS.map(function (group) {
            return (
              <section key={group.id}>
                <p className="mb-2 px-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-base-content/40">
                  {group.label}
                </p>

                <ul className="w-full p-0 flex flex-col gap-1">
                  {group.items.map(function (item) {
                    return (
                      <SidebarNavItem item={item} key={item.id} onClick={closeDrawer} />
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <div className="w-full p-4 border-t border-base-300">
        <div className="w-full mb-4 p-2 rounded-xl bg-base-200">
          <div className="min-w-0 flex items-center gap-4">
            {userProfile.avatarUrl && (
              <img className="w-10 h-10 shrink-0 rounded-full object-cover" src={userProfile.avatarUrl} alt="Avatar utilisateur" />
            )}

            {!userProfile.avatarUrl && (
              <div className="w-10 h-10 flex shrink-0 justify-center items-center text-sm font-bold text-primary-content rounded-full bg-primary">
                {getInitials(userProfile)}
              </div>
            )}

            <p className="min-w-0 text-sm font-medium truncate">
              {getDisplayName(userProfile)}
            </p>
          </div>
        </div>

        <NavLink className={getSettingsLinkClassName} to="/dashboard/settings" onClick={closeDrawer}>
          <Settings className="w-4 h-4" />
          Paramètres
        </NavLink>
      </div>
    </nav>
  );
}

export default Sidebar;
