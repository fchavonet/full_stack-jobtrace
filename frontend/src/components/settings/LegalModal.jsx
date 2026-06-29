import Modal from "../ui/Modal";

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

function getLegalModalDescription(type) {
  let description = "";

  if (type === "privacy") {
    description = "Consultez les informations relatives à vos données.";
  }

  if (type === "delete") {
    description = "Comprenez les conséquences avant de supprimer votre compte.";
  }

  return description;
}

function LegalModal({ type, onClose, onOpenPrivacyModal }) {
  return (
    <Modal
      isOpen={Boolean(type)}
      title={getLegalModalTitle(type)}
      description={getLegalModalDescription(type)}
      onClose={onClose}
      footer={
        <button
          className="btn btn-primary w-full md:w-auto text-primary-content cursor-pointer"
          type="button"
          onClick={onClose}
        >
          Fermer
        </button>
      }
    >
      <div className="w-full p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
        {type === "privacy" && (
          <PrivacyContent />
        )}

        {type === "delete" && (
          <AccountDeletionContent onOpenPrivacyModal={onOpenPrivacyModal} />
        )}
      </div>
    </Modal>
  );
}

export default LegalModal;
