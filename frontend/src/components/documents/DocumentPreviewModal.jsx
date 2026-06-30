import { Download, FileText, X } from "lucide-react";

import {
  getDocumentName,
  isImageDocument,
  isPdfDocument,
} from "../../utils/documents/document.utils";

function DocumentPreviewModal({
  doc,
  previewUrl,
  previewLoading,
  previewFailed,
  onClose,
  onDownloadDocument,
}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box flex h-full max-h-none w-full max-w-none flex-col rounded-none p-4 lg:h-[90vh] lg:max-w-5xl lg:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold">
              {getDocumentName(doc)}
            </h2>

            <p className="text-sm text-base-content/60">
              Aperçu du document
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              className="btn btn-ghost btn-sm btn-square"
              type="button"
              onClick={function () {
                onDownloadDocument(doc);
              }}
              aria-label="Télécharger le document"
            >
              <Download size={16} />
            </button>

            <button
              className="btn btn-ghost btn-sm btn-square"
              type="button"
              onClick={onClose}
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-box bg-base-200 p-3">
          {previewLoading && (
            <span className="loading loading-spinner loading-md" />
          )}

          {!previewLoading && previewFailed && (
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-base-content/40" />

              <h3 className="mt-3 text-lg font-semibold">
                Aperçu indisponible
              </h3>

              <p className="mt-1 text-sm text-base-content/60">
                Le fichier reste téléchargeable.
              </p>
            </div>
          )}

          {!previewLoading && !previewFailed && !previewUrl && (
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-base-content/40" />

              <h3 className="mt-3 text-lg font-semibold">
                Aperçu non disponible
              </h3>

              <p className="mt-1 text-sm text-base-content/60">
                Ce format peut être téléchargé, mais pas prévisualisé ici.
              </p>
            </div>
          )}

          {!previewLoading && !previewFailed && previewUrl && isImageDocument(doc) && (
            <img
              className="max-h-full max-w-full rounded bg-base-100 object-contain shadow-sm"
              src={previewUrl}
              alt={"Aperçu de " + getDocumentName(doc)}
            />
          )}

          {!previewLoading && !previewFailed && previewUrl && isPdfDocument(doc) && (
            <iframe
              className="h-full min-h-[70vh] w-full rounded bg-white shadow-sm"
              src={previewUrl + "#toolbar=0&navpanes=0"}
              title={"Aperçu de " + getDocumentName(doc)}
            />
          )}
        </div>
      </div>

      <div className="modal-backdrop backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}

export default DocumentPreviewModal;
