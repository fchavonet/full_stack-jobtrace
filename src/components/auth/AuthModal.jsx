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
      document.getElementById("auth-modal").showModal();
    };

    window.openLoginModal = function () {
      setMode("login");
      document.getElementById("auth-modal").showModal();
    };
  }, []);

  return (
    <dialog id="auth-modal" className="modal">
      <div className="modal-box w-xs lg:w-sm p-4 rounded-2xl">
        {/* SWITCH TO: LOGIN <-> SIGNUP <-> RESET PASSWORD */}
        {mode === "login" && <LoginForm setMode={setMode} />}
        {mode === "signup" && <SignupForm setMode={setMode} />}
        {mode === "reset" && <ResetPasswordForm setMode={setMode} />}
      </div>

      {/* CLOSE MODAL */}
      <form className="modal-backdrop backdrop-blur-xs" method="dialog">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default AuthModal;
