import ForgotPasswordForm from "./ForgotPasswordForm";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

function AuthModal({ isOpen, mode, setMode, onClose }) {
  function closeModal() {
    if (onClose) {
      onClose();
    }
  }

  function stopPropagation(event) {
    event.stopPropagation();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-base-100 p-4 text-base-content shadow-2xl"
        onClick={stopPropagation}
      >
        {mode === "login" && (
          <LoginForm closeModal={closeModal} setMode={setMode} />
        )}

        {mode === "signup" && (
          <SignupForm setMode={setMode} />
        )}

        {mode === "forgot-password" && (
          <ForgotPasswordForm setMode={setMode} />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
