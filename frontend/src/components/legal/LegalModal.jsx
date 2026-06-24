import { X } from "lucide-react";

import AccountDeletionContent from "./AccountDeletionContent";
import PrivacyContent from "./PrivacyContent";

function getLegalModalTitle(type) {
  let title = "";

  if (type === "privacy") {
    title = "Confidentialité et données personnelles";
  }

  if (type === "delete") {
    title = "Suppression du compte";
  }

  return title;
}

function LegalModal({ type, onClose }) {
  if (!type) {
    return null;
  }

  function stopPropagation(event) {
    event.stopPropagation();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-base-100 p-6 text-base-content shadow-2xl"
        onClick={stopPropagation}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold">
            {getLegalModalTitle(type)}
          </h2>

          <button
            className="btn btn-ghost btn-sm btn-circle"
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          {type === "privacy" && (
            <PrivacyContent />
          )}

          {type === "delete" && (
            <AccountDeletionContent />
          )}
        </div>
      </div>
    </div>
  );
}

export default LegalModal;
