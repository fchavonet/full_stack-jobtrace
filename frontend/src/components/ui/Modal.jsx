import { X } from "lucide-react";

function getModalBoxClassName(maxWidthClassName, className) {
  let finalClassName = "modal-box w-full h-full lg:h-auto max-h-none lg:max-h-[92vh] p-0 flex flex-col rounded-none lg:rounded-2xl bg-base-100 shadow-sm";

  if (maxWidthClassName) {
    finalClassName = finalClassName + " " + maxWidthClassName;
  }

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

function getModalBodyClassName(className) {
  let finalClassName = "min-h-0 p-4 lg:p-6 flex-1 overflow-y-auto bg-base-200";

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

export default function Modal({
  as: Component = "div",
  isOpen,
  title,
  description,
  children,
  footer,
  onClose,
  closeDisabled = false,
  closeAriaLabel = "Fermer la fenêtre",
  maxWidthClassName = "max-w-5xl",
  className = "",
  bodyClassName = "",
  ...props
}) {
  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (closeDisabled) {
      return;
    }

    onClose();
  }

  return (
    <div className="modal modal-open bg-black/40 backdrop-blur-sm">
      <div className={getModalBoxClassName(maxWidthClassName, className)}>
        <Component className="min-h-0 flex-1 flex flex-col" {...props}>
          <div className="p-4 lg:p-6 flex flex-row justify-between items-start gap-4 border-b border-base-300">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-base-content">
                {title}
              </h2>

              {description && (
                <p className="mt-1 text-sm text-base-content/60">
                  {description}
                </p>
              )}
            </div>

            <button
              className="btn btn-ghost btn-sm btn-circle shrink-0 cursor-pointer"
              type="button"
              onClick={handleClose}
              aria-label={closeAriaLabel}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={getModalBodyClassName(bodyClassName)}>
            {children}
          </div>

          {footer && (
            <div className="p-4 lg:p-6 flex flex-col-reverse lg:flex-row lg:justify-end gap-3 border-t border-base-300 bg-base-100">
              {footer}
            </div>
          )}
        </Component>
      </div>

      <div
        className="modal-backdrop"
        onClick={handleClose}
        aria-label={closeAriaLabel}
      />
    </div>
  );
}
