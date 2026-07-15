import { BarChart3, CalendarDays, FilePen, FileText, Target, UsersRound, } from "lucide-react";

import { lazy, Suspense, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import LegalModal from "../components/homepage/LegalModal";
import Header from "../components/layout/Header";
import IconBox from "../components/ui/IconBox";
import { SectionCard } from "../components/ui/Cards";

import { useAuth } from "../hooks/useAuth";

import dashboardScreenshot from "../../assets/images/screenshots/dashboard.webp";
import jobHuntIllustration from "../../assets/images/illustrations/job_hunt.svg";
import interviewIllustration from "../../assets/images/illustrations/interview.svg";

const AuthModal = lazy(function () {
  return import("../components/auth/AuthModal.jsx");
});

const features = [
  {
    icon: FilePen,
    title: "Centralisez vos candidatures",
    description: "Retrouvez toutes vos candidatures et leurs informations importantes dans un espace unique.",
  },
  {
    icon: CalendarDays,
    title: "Planifiez vos relances",
    description: "Organisez vos prochaines actions et identifiez facilement les entreprises à recontacter.",
  },
  {
    icon: Target,
    title: "Suivez vos objectifs",
    description: "Définissez votre rythme de recherche et gardez une vision claire de votre progression.",
  },
  {
    icon: UsersRound,
    title: "Gérez vos contacts",
    description: "Conservez les coordonnées des recruteurs et associez-les aux candidatures concernées.",
  },
  {
    icon: FileText,
    title: "Rassemblez vos documents",
    description: "Centralisez vos CV, lettres de motivation et autres documents utiles à votre recherche.",
  },
  {
    icon: BarChart3,
    title: "Analysez votre activité",
    description: "Consultez vos statistiques et identifiez les tendances de votre recherche d’emploi.",
  },
];

function HomePage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [legalModalType, setLegalModalType] = useState("");

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

  function openLegalNoticesModal() {
    setLegalModalType("legal-notices");
  }

  function openPrivacyModal() {
    setLegalModalType("privacy");
  }

  function openTermsModal() {
    setLegalModalType("terms");
  }

  function closeLegalModal() {
    setLegalModalType("");
  }

  return (
    <div className="h-screen flex flex-col text-base-content bg-[color-mix(in_oklab,var(--color-primary)_10%,var(--color-base-200))] overflow-hidden">
      <Header onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />

      <main className="relative w-full min-h-0 flex-1 bg-base-200 overflow-y-auto scroll-smooth">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none " aria-hidden="true" />

        {/* Hero section */}
        <section className="relative w-full px-6 py-12 flex flex-col justify-center items-center z-10">
          <div className="w-full max-w-6xl mx-auto flex flex-col justify-center items-center gap-6">
            <div className="w-full flex flex-col lg:flex-row justify-center items-center gap-6">
              <div className="order-2 lg:order-1 w-full min-w-0 flex flex-col justify-center items-center lg:items-start gap-6 text-center lg:text-left">
                <h1 className="max-w-2xl text-4xl md:text-5xl xl:text-6xl font-black leading-tight tracking-tight text-base-content">
                  Reprenez le contrôle de votre recherche d’emploi.
                </h1>

                <p className="max-w-2xl text-base md:text-lg text-base-content/60">
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
                    Découvrir<span className="font-bold">Job<span className="text-primary">Trace</span></span>
                  </a>
                </div>

                <p className="text-sm text-primary">
                  Toutes les informations utiles à votre recherche, réunies au même endroit.
                </p>
              </div>

              <div className="order-1 lg:order-2 w-full min-w-0 flex justify-center lg:justify-end">
                <img className="w-full max-w-md lg:max-w-lg h-auto object-contain" src={jobHuntIllustration} alt="" width="560" height="420" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="relative w-full -mt-4 px-6 py-12 flex justify-center items-center">
          <div className="w-full max-w-4xl rounded-2xl border-4 border-[#e3e3e8] bg-[#e3e3e8]">
            <img className="w-full h-auto rounded-xl" src={dashboardScreenshot} alt="Aperçu du tableau de bord JobTrace" />
          </div>
        </section>

        {/* Transition section */}
        <div className="relative w-full px-6 py-6 md:py-12" aria-hidden="true">
          <div className="w-full max-w-6xl mx-auto flex justify-center">
            <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>

        {/* Features section */}
        <section id="features" className="relative w-full -mt-4 px-6 py-12 scroll-mt-0">
          <div className="w-full max-w-6xl mx-auto flex flex-col justify-center items-center gap-6">
            <div className="w-full max-w-2xl mx-auto flex flex-col justify-center items-center gap-6 text-center">
              <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-base-content">
                Tout ce dont vous avez besoin pour organiser votre recherche.
              </h2>

              <p className="max-w-xl text-base md:text-lg leading-relaxed text-base-content/60">
                <span className="text-base-content font-bold">Job<span className="text-primary">Trace</span></span>{" "}rassemble les informations liées à vos candidatures, vos contacts et vos documents afin de vous aider à avancer avec méthode.
              </p>
            </div>

            <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(function (feature) {
                return (
                  <SectionCard key={feature.title} className="h-full" contentClassName="mt-0">
                    <div className="h-full flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1 flex flex-col justify-start items-stretch gap-2">
                        <h3 className="text-lg font-bold leading-tight text-base-content whitespace-nowrap">
                          {feature.title}
                        </h3>

                        <p className="text-sm leading-relaxed text-base-content/60">
                          {feature.description}
                        </p>
                      </div>

                      <IconBox size={40} icon={feature.icon} iconSize={18} />
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* Transition section */}
        <div className="relative w-full px-6 py-6 md:py-12" aria-hidden="true">
          <div className="w-full max-w-6xl mx-auto flex justify-center">
            <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>

        {/* FAQ section */}
        <section className="relative w-full -mt-4 px-6 py-12 flex justify-center items-center">
          <div className="w-full max-w-6xl mx-auto flex flex-col justify-center items-center gap-6">
            <div className="w-full max-w-2xl mx-auto flex flex-col justify-center items-center gap-6 text-center">
              <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-base-content">
                Questions fréquentes
              </h2>

              <p className="max-w-xl text-base md:text-lg leading-relaxed text-base-content/60">
                Retrouvez les réponses aux principales questions que vous nous avez posé concernant{" "}<span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span>.
              </p>
            </div>

            <div className="w-full max-w-4xl mt-6 flex flex-col justify-start items-stretch gap-2">
              <div className="collapse collapse-arrow rounded-2xl bg-base-100 shadow-sm">
                <input type="radio" name="homepage-faq" defaultChecked />

                <div className="collapse-title pr-12 text-lg font-bold text-base-content">
                  À quoi sert <span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span> ?
                </div>

                <div className="collapse-content">
                  <p className="text-sm text-base-content/60">
                    <span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span> vous permet de centraliser vos candidatures, vos contacts, vos documents et vos relances afin de suivre votre recherche d’emploi depuis un espace unique.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow rounded-2xl bg-base-100 shadow-sm">
                <input type="radio" name="homepage-faq" />

                <div className="collapse-title pr-12 text-lg font-bold text-base-content">
                  <span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span> est-il adapté à une recherche de stage ou d’alternance ?
                </div>

                <div className="collapse-content">
                  <p className="text-sm leading-relaxed text-base-content/60">
                    Oui. <span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span> peut être utilisé pour organiser une recherche d’emploi, de stage ou d’alternance, quel que soit le secteur d’activité.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow rounded-2xl bg-base-100 shadow-sm">
                <input type="radio" name="homepage-faq" />

                <div className="collapse-title pr-12 text-lg font-bold text-base-content">
                  Ai-je besoin d'installer un logiciel ?
                </div>

                <div className="collapse-content">
                  <p className="text-sm text-base-content/60">
                    Non. <span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span> est une application web accessible directement depuis votre navigateur. Il suffit de créer un compte pour commencer à gérer vos candidatures.                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow rounded-2xl bg-base-100 shadow-sm">
                <input type="radio" name="homepage-faq" />

                <div className="collapse-title pr-12 text-lg font-bold text-base-content">
                  Dois-je payer pour utiliser <span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span> ?
                </div>

                <div className="collapse-content">
                  <p className="text-sm text-base-content/60">
                    Non. <span className="font-bold text-base-content">Job<span className="text-primary">Trace</span></span> est actuellement accessible gratuitement. Vous pouvez créer un compte, gérer vos candidatures et profiter de l'ensemble des fonctionnalités disponibles sans abonnement.
                  </p>
                </div>
              </div>

              <div className="collapse collapse-arrow rounded-2xl bg-base-100 shadow-sm">
                <input type="radio" name="homepage-faq" />

                <div className="collapse-title pr-12 text-lg font-bold text-base-content">
                  Mes données sont-elles privées ?
                </div>

                <div className="collapse-content">
                  <p className="text-sm text-base-content/60">
                    Oui. Chaque utilisateur accède uniquement à ses propres candidatures, contacts et documents depuis un espace personnel protégé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transition section */}
        <div className="relative w-full px-6 py-6 md:py-12" aria-hidden="true">
          <div className="w-full max-w-6xl mx-auto flex justify-center">
            <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>

        {/* Call to action section */}
        <section className="relative z-10 w-full px-6 py-12">
          <div className="w-full max-w-6xl mx-auto">
            <div className="w-full p-8 md:p-12 flex flex-col lg:flex-row justify-between items-center gap-6 rounded-2xl bg-primary text-primary-content">
              <div className="w-full max-w-2xl flex flex-col justify-center items-center lg:items-start gap-3 text-center lg:text-left">
                <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight">
                  Votre prochain emploi commence ici.
                </h2>

                <p className="max-w-2xl text-base md:text-lg text-primary-content/80">
                  Créez gratuitement votre espace et centralisez vos candidatures, vos relances, vos contacts et vos documents dans une application pensée pour vous accompagner jusqu’à votre prochaine embauche.
                </p>
              </div>

              <div className="w-full lg:w-auto shrink-0 flex justify-center items-center">
                {!isAuthenticated && (
                  <button className="btn w-full sm:w-auto border-primary-content bg-primary-content text-primary hover:border-primary-content/90 hover:bg-primary-content/90" type="button" onClick={openSignupModal}>
                    Créer un compte
                  </button>
                )}

                {isAuthenticated && (
                  <Link className="btn w-full sm:w-auto border-primary-content bg-primary-content text-primary hover:border-primary-content/90 hover:bg-primary-content/90" to="/dashboard">
                    Accéder au tableau de bord
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom area */}
        <div className="relative w-full">
          <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none " aria-hidden="true" />

          {/* Closing illustration */}
          <section className="relative z-10 w-full px-6 py-12">
            <div className="w-full max-w-6xl mx-auto flex justify-center items-center">
              <img className="w-full max-w-xs md:max-w-sm h-auto object-contain" src={interviewIllustration} alt="" width="420" height="320" aria-hidden="true" />
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 w-full px-6 py-12 md:py-6">
            <div className="w-full max-w-6xl mx-auto">
              <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col justify-center items-center md:items-start gap-2 text-center md:text-left">
                  <Link className="text-xl font-black text-base-content" to="/" aria-label="Accueil JobTrace">
                    Job<span className="text-primary">Trace</span>
                  </Link>

                  <p className="text-sm text-base-content/60">
                    Reprenez le contrôle de votre recherche d’emploi.
                  </p>
                </div>

                <nav className="self-stretch flex flex-wrap justify-center md:justify-end items-end gap-x-6 gap-y-3" aria-label="Liens légaux">
                  <button className="text-sm text-base-content/60 hover:text-primary cursor-pointer transition-colors" type="button" onClick={openLegalNoticesModal}>
                    Mentions légales
                  </button>

                  <button className="text-sm text-base-content/60 hover:text-primary cursor-pointer transition-colors" type="button" onClick={openPrivacyModal}>
                    Politique de confidentialité
                  </button>

                  <button className="text-sm text-base-content/60 hover:text-primary cursor-pointer transition-colors" type="button" onClick={openTermsModal}>
                    Conditions générales d’utilisation
                  </button>
                </nav>
              </div>

              <div className="w-full mt-6 pt-6 flex flex-col sm:flex-row justify-between items-end gap-3 text-center sm:text-left border-t border-base-content/15">
                <p className="text-xs text-base-content/50">
                  © {new Date().getFullYear()} JobTrace. Tous droits réservés.
                </p>

                <p className="text-xs text-base-content/50">
                  Conçu pour vous accompagner jusqu'au bout.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal isOpen={isAuthModalOpen} mode={authMode} setMode={setAuthMode} onClose={closeAuthModal} />
        </Suspense>
      )}

      <LegalModal type={legalModalType} onClose={closeLegalModal} />
    </div>
  );
}

export default HomePage;
