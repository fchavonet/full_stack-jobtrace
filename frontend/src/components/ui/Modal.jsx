import { X } from "lucide-react";

function getModalBoxClassName(maxWidthClassName, className) {
  let finalClassName = "modal-box w-full max-w-5xl h-full max-h-none p-0 flex flex-col rounded-none bg-base-100 shadow-sm lg:h-auto lg:max-h-[92vh] lg:rounded-2xl";

  if (maxWidthClassName) {
    finalClassName = finalClassName + " lg:" + maxWidthClassName;
  }

  if (className) {
    finalClassName = finalClassName + " " + className;
  }

  return finalClassName;
}

function getModalBodyClassName(bodyClassName) {
  let finalClassName = "min-h-0 flex-1 overflow-y-auto bg-base-200 p-4 lg:p-6";

  if (bodyClassName) {
    finalClassName = finalClassName + " " + bodyClassName;
  }

  return finalClassName;
}

function Modal({
  as: Component = "div",
  isOpen,
  title,
  description,
  children,
  footer,
  customHeader,
  onClose,
  closeDisabled = false,
  closeAriaLabel = "Fermer",
  maxWidthClassName = "max-w-5xl",
  className = "",
  bodyClassName = "",
  ...props
}) {
  if (!isOpen) {
    return null;
  }

  let headerContent = (
    <div className="p-4 lg:p-6 flex flex-row justify-between items-start gap-4 border-b border-base-300 bg-base-100">
      <div className="min-w-0 flex-1">
        {title && (
          <h2
            className="text-xl font-semibold text-base-content truncate"
            title={title}
          >
            {title}
          </h2>
        )}

        {description && (
          <p className="mt-1 text-sm text-base-content/60">
            {description}
          </p>
        )}
      </div>

      <button
        className="btn btn-ghost btn-sm btn-circle shrink-0 cursor-pointer"
        type="button"
        onClick={onClose}
        disabled={closeDisabled}
        aria-label={closeAriaLabel}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  if (customHeader) {
    headerContent = customHeader;
  }

  return (
    <div className="modal modal-open bg-black/40 backdrop-blur-sm">
      <Component
        className={getModalBoxClassName(maxWidthClassName, className)}
        {...props}
      >
        {headerContent}

        <div className={getModalBodyClassName(bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className="p-4 lg:p-6 flex flex-col-reverse lg:flex-row lg:justify-end gap-3 border-t border-base-300 bg-base-100">
            {footer}
          </div>
        )}
      </Component>

      <div
        className="modal-backdrop"
        onClick={onClose}
        aria-label={closeAriaLabel}
      />
    </div>
  );
}

export default Modal;
