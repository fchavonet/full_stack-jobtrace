import { createContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function createToastId() {
    return crypto.randomUUID();
  }

  function getToastClass(type) {
    if (type === "success") {
      return "alert-success text-success-content";
    }

    if (type === "error") {
      return "alert-error text-error-content";
    }

    if (type === "warning") {
      return "alert-warning text-warning-content";
    }

    return "alert-info text-info-content";
  }

  const showToast = useCallback(function (message, type = "info") {
    const id = createToastId();

    setToasts(function (currentToasts) {
      return [
        ...currentToasts,
        {
          id,
          message,
          type,
        },
      ];
    });

    setTimeout(function () {
      setToasts(function (currentToasts) {
        return currentToasts.filter(function (toast) {
          return toast.id !== id;
        });
      });
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed right-4 bottom-4 z-[9999] w-full max-w-lg px-4 flex flex-col justify-center items-end gap-2 pointer-events-none sm:px-0">
        {toasts.map(function (toast) {
          return (
            <div className={"alert shadow-lg " + getToastClass(toast.type)} key={toast.id}>
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
