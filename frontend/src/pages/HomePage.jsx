import { lazy, Suspense, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Header from "../components/layout/Header";
import { ItemCard, MetricCard, ProgressItemCard, SectionCard, } from "../components/ui/Cards";

import { useAuth } from "../hooks/useAuth";

const AuthModal = lazy(function () {
  return import("../components/auth/AuthModal.jsx");
});

function HomePage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  function getInitialAuthMode() {
    if (location.state && location.state.authMode) {
      return location.state.authMode;
    }

    return "login";
  }

  function getInitialAuthModalState() {
    if (location.state && location.state.openAuthModal) {
      return true;
    }

    return false;
  }

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(
    getInitialAuthModalState,
  );
  const [authMode, setAuthMode] = useState(getInitialAuthMode);

  function openLoginModal() {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  }

  function openSignupModal() {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setAuthMode("login");
    setIsAuthModalOpen(false);
  }

  return (
    <div className="h-screen overflow-hidden bg-base-200 text-base-content flex flex-col">
      <Header onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />

      <main className="relative w-full flex-1 min-h-0 overflow-y-auto">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none " aria-hidden="true" />

        <section className="relative w-full min-h-full p-6 pt-12 flex flex-col justify-center items-center z-10">
          <div className="w-full max-w-6xl mx-auto flex flex-col justify-center items-center gap-12">
            <div className="w-full flex flex-col lg:flex-row justify-center items-center gap-6">
              <div className="order-2 lg:order-1 w-full min-w-0 flex flex-col justify-center items-center lg:items-start gap-6 text-center lg:text-left">
                <h1 className="max-w-2xl text-4xl md:text-5xl xl:text-6xl font-black leading-tight tracking-tight text-base-content">
                  Reprenez le contrôle de votre recherche d’emploi.
                </h1>

                <p className="max-w-2xl text-base md:text-lg leading-relaxed text-base-content/60">
                  Centralisez vos candidatures, planifiez vos relances et suivez votre progression depuis un espace unique, clair et structuré.
                </p>

                <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-stretch sm:items-center gap-2">
                  {!isAuthenticated && (
                    <button className="btn btn-primary w-full sm:w-auto text-primary-content cursor-pointer" type="button" onClick={openSignupModal}>
                      Créer un compte
                    </button>
                  )}

                  {isAuthenticated && (
                    <Link className="btn btn-primary w-full sm:w-auto text-primary-content cursor-pointer" to="/dashboard">
                      Accéder au tableau de bord
                    </Link>
                  )}

                  <a className="btn btn-ghost w-full sm:w-auto cursor-pointer" href="#features">
                    Découvrir <span className="font-bold">Job<span className="text-primary">Trace</span></span>
                  </a>
                </div>

                <p className="text-sm text-primary">
                  Toutes les informations utiles à votre recherche, réunies au même endroit.
                </p>
              </div>

              <div className="order-1 lg:order-2 w-full min-w-0 flex justify-center lg:justify-end">
                <img className="w-full max-w-md lg:max-w-lg h-auto object-contain" src="/assets/illustrations/job_hunt.svg" alt="" width="560" height="420" aria-hidden="true" />
              </div>
            </div>

            <div className="w-full rounded-2xl border border-[#e3e3e8] bg-[#e3e3e8] shadow-xl z-50">
              <img className="w-full h-auto rounded-xl" src="/assets/screenshots/dashboard.webp" alt="Aperçu du tableau de bord JobTrace" />
            </div>
          </div>
        </section>
      </main>

      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            mode={authMode}
            setMode={setAuthMode}
            onClose={closeAuthModal}
          />
        </Suspense>
      )}
    </div>
  );
}

export default HomePage;
