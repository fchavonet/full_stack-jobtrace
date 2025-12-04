import { CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";

import ApplicationModal from "../../components/dashboard/applications/ApplicationsModal";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

function ApplicationsSection() {
  const { user } = useAuth();

  const [count, setCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load applications count on mount.
  useEffect(() => {
    async function loadCount() {
      if (!user) return;

      const { count, error } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (!error && typeof count === "number") {
        setCount(count);
      }
    }

    loadCount();
  }, [user, refreshKey]);

  // Expose refresh function globally.
  useEffect(() => {
    window.refreshApplicationsCount = function () {
      setRefreshKey(prev => prev + 1);
    };

    return () => {
      delete window.refreshApplicationsCount;
    };
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex flex-row justify-between items-center w-full">
          <div>
            <h2 className="text-2xl font-bold">Candidatures</h2>

            <p className="text-sm text-gray-500">
              {count} candidature{count > 1 ? "s" : ""}
            </p>
          </div>

          <button className=" btn btn-square btn-primary lg:w-auto lg:h-auto lg:px-4 lg:py-2 flex flex-row justify-center items-center gap-2 text-white border-none shadow-none" onClick={function () { window.openNewApplicationsModal(); }}>
            <CirclePlus size="20" /> <span className="hidden lg:inline mb-0.5">Nouvelle candidature</span>
          </button>
        </div>
      </div>

      <ApplicationModal />
    </>
  );
}

export default ApplicationsSection;
