import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/dashboard/Sidebar";

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const drawer = document.getElementById("sidebar-drawer");

    function handleChange() {
      setIsOpen(drawer.checked);
    }

    drawer.addEventListener("change", handleChange);
    return () => drawer.removeEventListener("change", handleChange);
  }, []);
  return (
    <main className="drawer lg:drawer-open">
      <input id="sidebar-drawer" className="drawer-toggle" type="checkbox" />

      {/* SIDEBAR */}
      <aside className="drawer-side">
        <label className="drawer-overlay" htmlFor="sidebar-drawer" aria-label="close sidebar"></label>

        <div className="menu w-64 min-h-full p-0 flex flex-col justify-between items-center border-r border-base-300 bg-base-100">
          <Sidebar />
        </div>
      </aside>

      {/* SECTIONS */}
      <section className="drawer-content min-h-screen p-4 bg-base-200">
        <Outlet className="p-0" />

        <label className="drawer-button absolute right-4 bottom-4 btn btn-square btn-primary lg:hidden z-50" htmlFor="sidebar-drawer">
          {isOpen ? <PanelRightClose /> : <PanelRightOpen />}
        </label>
      </section>
    </main>
  );
}

export default Dashboard;
