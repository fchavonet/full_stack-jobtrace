import { useEffect, useState } from "react";

import LoginForm from "./LoginForm";
import ResetPasswordForm from "./ResetPasswordForm";
import SignupForm from "./SignupForm";

function AuthModal() {
  const [mode, setMode] = useState("login");

  // Reset to LOGIN every time the modal opens.
  useEffect(function () {
    const modal = document.getElementById("auth-modal");

    if (!modal) {
      return;
    }

    const observer = new MutationObserver(function () {
      if (modal.open) {
        setMode("login");
      }
    });

    observer.observe(modal, { attributes: true, attributeFilter: ["open"] });

    return function () {
      observer.disconnect();
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
