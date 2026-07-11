import { AlertTriangle } from "lucide-react";

import { SectionCard } from "./Cards";
import Modal from "./Modal";

function ConfirmationModal({
  isOpen,
  title = "Confirmation",
  description,
  confirmLabel = "OK",
  cancelLabel = "Annuler",
  submitting = false,
  onClose,
  onConfirm,
}) {
  let finalConfirmLabel = confirmLabel;

  if (submitting) {
    finalConfirmLabel = "Confirmation...";
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description="Cette action nécessite votre confirmation."
      onClose={handleClose}
      closeDisabled={submitting}
      closeAriaLabel="Fermer la confirmation"
      maxWidthClassName="max-w-xl"
      bodyClassName="flex flex-col justify-center"
      footer={
        <>
          <button
            className="btn btn-ghost w-full lg:w-auto cursor-pointer"
            type="button"
            onClick={handleClose}
            disabled={submitting}
          >
            {cancelLabel}
          </button>

          <button
            className="btn btn-error w-full lg:w-auto text-error-content cursor-pointer"
            type="button"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting && (
              <span className="loading loading-spinner loading-sm" />
            )}

            {finalConfirmLabel}
          </button>
        </>
      }
    >
      <SectionCard className="border border-error/20 bg-error/5">
        <div className="w-full flex flex-col justify-center items-center gap-4 text-center">
          <div className="w-12 h-12 flex justify-center items-center rounded-full bg-error/10">
            <AlertTriangle className="w-6 h-6 text-error" />
          </div>

          <p className="max-w-md text-sm text-base-content/70">
            {description}
          </p>
        </div>
      </SectionCard>
    </Modal>
  );
}

export default ConfirmationModal;
