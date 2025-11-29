import { Bell, Clock, Database, LockKeyhole } from "lucide-react";
import { useEffect } from "react";

import PasswordSettings from "../../components/dashboard/settings/PasswordSettings";
import ProfileSettings from "../../components/dashboard/settings/ProfileSettings";

function SettingsSection() {
  useEffect(function () {
    const hash = window.location.hash;

    if (!hash) return;

    const element = document.querySelector(hash);

    if (!element) return;

    // Petit timeout = laisse React finir le render
    setTimeout(function () {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  return (
    <div className="flex flex-col justify-center itams-center gap-4">
      <div>
        <h2 className="text-2xl font-bold">Paramètres</h2>

        <p className="text-sm text-gray-500">
          Personnalisez votre expérience sur <span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span>...
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <ProfileSettings />
        <PasswordSettings />
      </div>

      <div className="card p-4 border border-base-300 bg-base-100">
        <h3 className="card-title"><Clock /> Paramètres des candidatures</h3>
      </div>

      <div className="card p-4 border border-base-300 bg-base-100">
        <h3 className="card-title"><Bell /> Notifications</h3>
      </div>

      <div className="card p-4 border border-base-300 bg-base-100">
        <h3 className="card-title"><Database /> Données</h3>
      </div>
    </div>
  );
}

export default SettingsSection;