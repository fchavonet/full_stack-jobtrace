import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  return (
    <div className="h-screen flex flex-col text-base-content bg-base-200 overflow-hidden">
      <Header
        authenticatedLinkIcon="home"
        authenticatedLinkLabel="Accueil"
        authenticatedLinkTo="/"
        pageTitle="Espace candidat"
      />

      <main className="relative h-[calc(100vh-65px)] flex overflow-hidden">
        <input
          id="dashboard-sidebar-drawer"
          className="peer sr-only"
          type="checkbox"
        />

        <label
          className="pointer-events-none fixed inset-x-0 bottom-0 top-[65px] z-40 bg-black/0 backdrop-blur-0 transition-all duration-200 peer-checked:pointer-events-auto peer-checked:bg-black/40 peer-checked:backdrop-blur-sm lg:hidden"
          htmlFor="dashboard-sidebar-drawer"
          aria-label="Fermer le menu"
        />

        <aside className="fixed bottom-0 left-0 top-[65px] z-50 w-64 -translate-x-full bg-base-100 transition-transform duration-200 ease-out peer-checked:translate-x-0 peer-checked:shadow-2xl lg:static lg:z-auto lg:h-full lg:translate-x-0 lg:shadow-none lg:transition-none">
          <Sidebar />
        </aside>

        <section className="h-full flex-1 overflow-y-auto">
          <div className="w-full mx-auto  p-4 lg:p-4">
            <Outlet />
          </div>
        </section>

        <label
          className="btn btn-primary btn-square fixed bottom-4 right-4 z-[60] shadow-lg lg:hidden"
          htmlFor="dashboard-sidebar-drawer"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </label>
      </main>
    </div>
  );
}

export default DashboardLayout;
