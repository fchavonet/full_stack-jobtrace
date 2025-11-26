import { Link } from "react-router-dom";

import ScreenshotDark from "../../../assets/screenshot/sample-dark.webp";
import ScreenshotLight from "../../../assets/screenshot/sample-light.webp";
import { useAuth } from "../../../hooks/useAuth";
import { useTheme } from "../../../hooks/useTheme";

function HeroSection() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <section id="hero-section" className="w-full">
      <div className="container h-full mx-auto p-4 flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-12">
        <div className="max-w-xl flex flex-1 flex-col justify-center items-start gap-4">
          {/* TITLE */}
          <h2 className="text-2xl lg:text-4xl font-bold">
            Reprenez le contrôle de votre recherche d’emploi.
          </h2>

          {/* DESCRIPTION */}
          <p className="text-base opacity-75">
            <span className="font-bold">Job<span className="text-primary">Trace</span></span> vous aide à organiser vos candidatures, suivre vos relances, planifier vos entretiens et garder une vue d’ensemble claire et professionnelle.
          </p>

          {/* CALL TO ACTION */}
          <div className="w-full lg:w-auto flex flex-row justify-center lg:justify-start">
            {user ? (
              <Link className="btn btn-primary border-none shadow-none" to="/dashboard">
                Accéder à votre dashboard
              </Link>
            ) : (
              <button className="btn btn-primary border-none shadow-none" onClick={function () { window.openSignupModal(); }}>
                Créer un compte
              </button>
            )}
          </div>
        </div>

        {/* SCREENSHOT */}
        <div className="flex lg:flex-1 flex-row justify-center items-center">
          <div className="w-full p-2 rounded-2xl shadow-xl ring-1 bg-base-300 ring-base-300">
            {theme === "dark" && (<img className="w-full rounded-2xl shadow-xl" src={ScreenshotDark} alt="Aperçu du dashboard de JobTrace" />)}
            {theme !== "dark" && (<img className="w-full rounded-2xl shadow-xl" src={ScreenshotLight} alt="Aperçu du dashboard de JobTrace" />)}
          </div>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;
