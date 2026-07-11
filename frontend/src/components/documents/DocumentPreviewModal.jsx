import { Download, FileText } from "lucide-react";

import { ItemCard } from "../ui/Cards";
import Modal from "../ui/Modal";

import {
  getDocumentName,
  isImageDocument,
  isPdfDocument,
} from "../../utils/documents/document.utils";

function DocumentPreviewContent({
  doc,
  previewUrl,
  previewLoading,
  previewFailed,
}) {
  return (
    <ItemCard className="w-full h-[56vh] max-h-[56vh] min-h-0 flex flex-col justify-center items-center overflow-hidden lg:h-[60vh] lg:max-h-[60vh]">
      {previewLoading && (
        <span className="loading loading-spinner loading-md" />
      )}

      {!previewLoading && previewFailed && (
        <div className="text-center">
          <FileText className="mx-auto w-12 h-12 text-base-content/40" />

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
          <FileText className="mx-auto w-12 h-12 text-base-content/40" />

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
          className="max-w-full max-h-full rounded bg-base-100 object-contain shadow-sm"
          src={previewUrl}
          alt={"Aperçu de " + getDocumentName(doc)}
        />
      )}

      {!previewLoading && !previewFailed && previewUrl && isPdfDocument(doc) && (
        <iframe
          className="w-full h-full min-h-0 rounded bg-white shadow-sm"
          src={previewUrl + "#toolbar=0&navpanes=0"}
          title={"Aperçu de " + getDocumentName(doc)}
        />
      )}
    </ItemCard>
  );
}

function DocumentPreviewModal({
  doc,
  previewUrl,
  previewLoading,
  previewFailed,
  onClose,
  onDownloadDocument,
}) {
  return (
    <Modal
      isOpen={true}
      title={getDocumentName(doc)}
      description="Aperçu du document"
      onClose={onClose}
      closeAriaLabel="Fermer l’aperçu"
      maxWidthClassName="max-w-5xl"
      bodyClassName="min-h-0 flex-1 flex flex-col justify-center items-stretch"
      footer={
        <button
          className="btn btn-primary w-full lg:w-auto flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer"
          type="button"
          onClick={function () {
            onDownloadDocument(doc);
          }}
        >
          <Download className="w-4 h-4" />
          Télécharger
        </button>
      }
    >
      <DocumentPreviewContent
        doc={doc}
        previewUrl={previewUrl}
        previewLoading={previewLoading}
        previewFailed={previewFailed}
      />
    </Modal>
  );
}

export default DocumentPreviewModal;
