import { BriefcaseBusiness } from "lucide-react";
import { useState } from "react";

import AuthModal from "../components/auth/AuthModal";

function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  function openLoginModal() {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  }

  function openSignupModal() {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  return (
    <main className="min-h-screen">
      <section className="max-w-5xl min-h-screen mx-auto p-4 flex flex-col justify-center items-center gap-4">
        <h1 className="flex flex-row justify-center items-center text-4xl font-bold">
          <BriefcaseBusiness className="h-10 w-10 me-4 text-primary" />
          Job<span className="text-primary">Trace</span>
        </h1>

        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-2">
          <button className="w-full sm:w-auto btn btn-primary" type="button" onClick={openLoginModal}>
            Se connecter
          </button>

          <button className="w-full sm:w-auto btn btn-outline" type="button" onClick={openSignupModal}>
            Créer un compte
          </button>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={closeAuthModal}
      />
    </main>
  );
}

export default HomePage;
