import { X } from "lucide-react";
import { useState } from "react";

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
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-control">
                <span className="label mb-1">
                  Type de document
                </span>

                <select
                  className="select select-bordered w-full"
                  value={type}
                  onChange={handleTypeChange}
                  disabled={submitting}
                >
                  <option value="resume">
                    CV
                  </option>

                  <option value="cover_letter">
                    Lettre de motivation
                  </option>

                  <option value="other">
                    Autre document
                  </option>
                </select>
              </label>

              <label className="form-control">
                <span className="label mb-1">
                  Fichier
                </span>

                <input
                  className="file-input file-input-bordered w-full"
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-base-300 bg-base-100 p-3 text-sm text-base-content/70">
              <p>
                Formats acceptés : PDF, DOC, DOCX, PNG, JPG, JPEG.
              </p>

              <p>
                Taille maximale : 5 Mo.
              </p>
            </div>
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
