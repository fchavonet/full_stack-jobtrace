import { Settings } from "lucide-react";

import { NavLink } from "react-router-dom";

import { DASHBOARD_NAVIGATION_GROUPS } from "../../../constants/navigation.constants";
import {
  getProfileDisplayName,
  getProfileInitials,
} from "../../../utils/profile/profile.utils";

import SidebarNavItem from "./SidebarNavItem";

function getSettingsLinkClassName({ isActive }) {
  const baseClass = "w-full px-4 py-2 flex flex-row justify-center items-center gap-2 text-sm font-medium rounded-lg border border-primary cursor-pointer";

  if (isActive) {
    return baseClass + " text-primary-content bg-primary";
  }

  return baseClass + " text-primary hover:text-primary-content hover:bg-primary";
}

function Sidebar({ userProfile, onClose }) {
  return (
    <nav className="w-64 h-full flex flex-col justify-between items-center text-base-content border-r border-base-300 bg-base-100">
      <div className="w-full p-4">
        <div className="w-full flex flex-col justify-start items-stretch gap-4">
          {DASHBOARD_NAVIGATION_GROUPS.map(function (group) {
            return (
              <section key={group.id}>
                <p className="mb-2 px-4 text-xs font-bold tracking-widest text-base-content/40 uppercase">
                  {group.label}
                </p>

                <ul className="w-full p-0 flex flex-col justify-start items-stretch gap-1">
                  {group.items.map(function (item) {
                    return (
                      <SidebarNavItem item={item} key={item.id} onClick={onClose} />
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
          <div className="min-w-0 flex flex-row justify-start items-center gap-4">
            {userProfile.avatarUrl && (
              <img
                className="w-10 h-10 shrink-0 rounded-full object-cover"
                width="40"
                height="40"
                src={userProfile.avatarUrl}
                alt="Avatar utilisateur"
                loading="lazy"
                decoding="async"
              />)}

            {!userProfile.avatarUrl && (
              <div className="w-10 h-10 shrink-0 flex flex-row justify-center items-center text-sm font-bold text-primary-content rounded-full bg-primary">
                {getProfileInitials(userProfile)}
              </div>
            )}

            <p className="min-w-0 text-sm font-medium truncate">
              {getProfileDisplayName(userProfile)}
            </p>
          </div>
        </div>

        <NavLink className={getSettingsLinkClassName} to="/dashboard/settings" onClick={onClose}>
          <Settings className="w-4 h-4" />
          Paramètres
        </NavLink>
      </div>
    </nav>
  );
}

export default Sidebar;
