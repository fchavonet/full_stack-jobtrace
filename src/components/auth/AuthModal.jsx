import { useEffect, useState } from "react";

import LoginForm from "./LoginForm";
import ResetPasswordForm from "./ResetPasswordForm";
import SignupForm from "./SignupForm";

function AuthModal() {
  const [mode, setMode] = useState("login");

  // Open auth modal with correct mode.
  useEffect(function () {
    window.openSignupModal = function () {
      setMode("signup");
      document.getElementById("auth-modal").classList.add("modal-open");
    };

    window.openLoginModal = function () {
      setMode("login");
      document.getElementById("auth-modal").classList.add("modal-open");
    };

    window.closeAuthModal = function () {
      document.getElementById("auth-modal").classList.remove("modal-open");
    };
  }, []);

  return (
    <div id="auth-modal" className="modal">
      <div className="modal-box w-xs lg:w-sm p-4 rounded-2xl">
        {/* SWITCH TO: LOGIN <-> SIGNUP <-> RESET PASSWORD */}
        {mode === "login" && <LoginForm setMode={setMode} />}
        {mode === "signup" && <SignupForm setMode={setMode} />}
        {mode === "reset" && <ResetPasswordForm setMode={setMode} />}
      </div>

      {/* CLOSE MODAL */}
      <div className="modal-backdrop backdrop-blur-xs" onClick={function () { window.closeAuthModal(); }}></div>
    </div>
  );
}

export default AuthModal;
