import Modal from "../ui/Modal";

import LegalNoticesContent from "./LegalNoticesContent";
import PrivacyContent from "./PrivacyContent";
import TermsOfUseContent from "./TermsOfUseContent";

function getLegalModalTitle(type) {
  let title = "";

  if (type === "legal-notices") {
    title = "Mentions légales";
  }

  if (type === "privacy") {
    title = "Politique de confidentialité";
  }

  if (type === "terms") {
    title = "Conditions générales d’utilisation";
  }

  return title;
}

function getLegalModalDescription(type) {
  let description = "";

  if (type === "legal-notices") {
    description = "Consultez les informations relatives à l’éditeur et à l’hébergement de JobTrace.";
  }

  if (type === "privacy") {
    description = "Consultez les informations relatives au traitement de vos données personnelles.";
  }

  if (type === "terms") {
    description = "Consultez les règles applicables à l’utilisation de JobTrace.";
  }

  return description;
}

function LegalModal({ type, onClose }) {
  let content = null;

  if (type === "legal-notices") {
    content = <LegalNoticesContent />;
  }

  if (type === "privacy") {
    content = <PrivacyContent />;
  }

  if (type === "terms") {
    content = <TermsOfUseContent />;
  }

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
        {content}
      </div>
    </Modal>
  );
}

export default LegalModal;
