import { useState } from "react";

import DocumentUploadFields from "./DocumentUploadFields";

import { SectionCard } from "../ui/Cards";
import Modal from "../ui/Modal";

function DocumentModal({ submitting, onClose, onSubmitDocument }) {
  const [type, setType] = useState("resume");
  const [file, setFile] = useState(null);

  function handleTypeChange(event) {
    setType(event.target.value);
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmitDocument({
      type,
      file,
    });
  }

  function handleClose() { 
    if (submitting) {
      return;
    }

    onClose();
  }

  return (
    <Modal
      as="form"
      isOpen={true}
      title="Nouveau document"
      description="Ajoutez un document à votre espace candidat."
      onClose={handleClose}
      closeDisabled={submitting}
      closeAriaLabel="Fermer le formulaire"
      maxWidthClassName="max-w-5xl"
      onSubmit={handleSubmit}
      footer={
        <>
          <button
            className="btn btn-ghost w-full lg:w-auto cursor-pointer"
            type="button"
            onClick={handleClose}
            disabled={submitting}
          >
            Annuler
          </button>

          <button
            className="btn btn-primary w-full lg:w-auto text-primary-content cursor-pointer"
            type="submit"
            disabled={submitting}
          >
            {submitting && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Enregistrer
          </button>
        </>
      }
    >
      <SectionCard
        title="Fichier à importer"
        description="Choisissez le type de document et le fichier à ajouter."
      >
        <DocumentUploadFields
          documentType={type}
          disabled={submitting}
          includeOtherType={true}
          showHelp={true}
          onDocumentTypeChange={handleTypeChange}
          onDocumentFileChange={handleFileChange}
        />
      </SectionCard>
    </Modal>
  );
}

export default DocumentModal;
