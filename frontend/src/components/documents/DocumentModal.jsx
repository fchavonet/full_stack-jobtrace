import { X } from "lucide-react";
import { useState } from "react";

import DocumentUploadFields from "./DocumentUploadFields";

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
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-2xl rounded-none p-4 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Nouveau document
            </h2>

            <p className="text-sm text-base-content/70">
              Ajoutez un document à votre espace candidat.
            </p>
          </div>

          <button
            className="btn btn-ghost btn-sm btn-square"
            type="button"
            onClick={handleClose}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-4" onSubmit={handleSubmit}>
          <fieldset className="fieldset w-full rounded-xl border border-base-300 bg-base-200 p-4">
            <DocumentUploadFields
              documentType={type}
              disabled={submitting}
              includeOtherType={true}
              showHelp={true}
              onDocumentTypeChange={handleTypeChange}
              onDocumentFileChange={handleFileChange}
            />
          </fieldset>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleClose}
              disabled={submitting}
            >
              Annuler
            </button>

            <button
              className="btn btn-primary text-white"
              type="submit"
              disabled={submitting}
            >
              {submitting && (
                <span className="loading loading-spinner loading-sm" />
              )}

              Enregistrer
            </button>
          </div>
        </form>
      </div>

      <div className="modal-backdrop backdrop-blur-xs" onClick={handleClose} />
    </div>
  );
}

export default DocumentModal;
