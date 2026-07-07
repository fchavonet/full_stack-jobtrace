import { lazy, Suspense, useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/layout/Header";

const AuthModal = lazy(function () {
  return import("../components/auth/AuthModal.jsx");
});

function HomePage() {
  const location = useLocation();

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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(getInitialAuthModalState);
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
    <div className="min-h-screen bg-base-200 text-base-content">
      <Header
        onOpenLogin={openLoginModal}
        onOpenSignup={openSignupModal}
      />

      <main>

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
