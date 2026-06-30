import { createContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function createToastId() {
    return crypto.randomUUID();
  }

  function getToastClass(type) {
    if (type === "success") {
      return "alert-success";
    }

    if (type === "error") {
      return "alert-error";
    }

    if (type === "warning") {
      return "alert-warning";
    }

    return "alert-info";
  }

  function getToastAnimationClass(toast) {
    if (toast.isClosing) {
      return "opacity-0 translate-y-2 scale-95";
    }

    return "opacity-100 translate-y-0 scale-100";
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
          isClosing: false,
        },
      ];
    });

    setTimeout(function () {
      setToasts(function (currentToasts) {
        return currentToasts.map(function (toast) {
          if (toast.id !== id) {
            return toast;
          }

          return {
            ...toast,
            isClosing: true,
          };
        });
      });
    }, 3000);

    setTimeout(function () {
      setToasts(function (currentToasts) {
        return currentToasts.filter(function (toast) {
          return toast.id !== id;
        });
      });
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-4 right-4 z-[9999] flex max-w-lg flex-col gap-2 px-4 transition-all duration-300 pointer-events-none sm:px-0">
        {toasts.map(function (toast) {
          return (
            <div
              className={
                "alert text-white shadow-lg transition-all duration-300 ease-out " +
                getToastClass(toast.type) +
                " " +
                getToastAnimationClass(toast)
              }
              key={toast.id}
            >
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
