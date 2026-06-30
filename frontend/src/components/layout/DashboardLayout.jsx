import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { getUserProfile } from "../../api/profile.api";

import {
  defaultUserProfile,
  getProfileFromResponse,
  getTextValue,
} from "../../utils/profile/profile.utils";

import Header from "./Header";
import Sidebar from "./sidebar/Sidebar";

function DashboardLayout() {
  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function handleSidebarToggle(event) {
    setIsSidebarOpen(event.target.checked);
  }

  useEffect(function () {
    async function loadUserProfile() {
      try {
        const response = await getUserProfile();
        const profile = getProfileFromResponse(response) || {};

        setUserProfile({
          firstName: getTextValue(profile.firstName),
          lastName: getTextValue(profile.lastName),
          email: getTextValue(profile.email),
          avatarUrl: getTextValue(profile.avatarUrl),
        });
      } catch {
        setUserProfile(defaultUserProfile);
      }
    }

    function handleProfileUpdated() {
      loadUserProfile();
    }

    loadUserProfile();

    window.addEventListener("jobtrace-profile-updated", handleProfileUpdated);

    return function () {
      window.removeEventListener("jobtrace-profile-updated", handleProfileUpdated);
    };
  }, []);

  return (
    <div className="h-screen flex  flex-col text-base-content bg-base-200 overflow-hidden">
      <Header authenticatedLinkIcon="home" authenticatedLinkLabel="Accueil" authenticatedLinkTo="/" pageTitle="Espace candidat" />

      <main className="relative h-[calc(100vh-65px)] flex overflow-hidden">
        <input id="dashboard-sidebar-drawer" className="sr-only peer" type="checkbox" onChange={handleSidebarToggle} />

        <label className="fixed lg:hidden top-[65px] bottom-0 inset-x-0 bg-black/0 peer-checked:bg-black/40 backdrop-blur-0 peer-checked:backdrop-blur-sm transition-all duration-200 z-40 pointer-events-none peer-checked:pointer-events-auto" htmlFor="dashboard-sidebar-drawer" aria-label="Fermer le menu" onClick={function () { setIsSidebarOpen(false); }} />

        <aside className="fixed lg:static top-[65px] bottom-0 left-0 w-64 lg:h-full bg-base-100 -translate-x-full lg:translate-x-0 peer-checked:translate-x-0 transition-transform lg:transition-none duration-200 ease-out z-50 lg:z-auto">
          <Sidebar userProfile={userProfile} />
        </aside>

        <section className="h-full flex-1 overflow-y-auto">
          <div className="w-full mx-auto p-4">
            <Outlet />
          </div>
        </section>

        <label className="btn btn-square btn-primary fixed bottom-4 right-4 lg:hidden shadow-lg z-[50]" htmlFor="dashboard-sidebar-drawer" aria-label="Ouvrir ou fermer le menu" >
          {!isSidebarOpen && <PanelLeftOpen className="w-5 h-5" />}
          {isSidebarOpen && <PanelLeftClose className="w-5 h-5" />}
        </label>
      </main>
    </div>
  );
}

export default DashboardLayout;
