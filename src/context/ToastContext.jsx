import { createContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Generate a unique ID for each toast.
  function uid() {
    return Math.random().toString(36).slice(2);
  }

  // Create and display a toast message.
  const showToast = useCallback(function (message, type = "info") {
    const id = uid();

    // Add toast to the stack.
    setToasts(function (prev) {
      return [...prev, { id, message, type }];
    });

    // Remove toast automatically after 3 seconds.
    setTimeout(function () {
      setToasts(function (prev) {
        return prev.filter(function (toast) {
          return toast.id !== id;
        });
      });
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* TOAST CONTAINER */}
      <div className="toast fixed pointer-events-none z-[99999] ">
        {toasts.map(function (toast) {
          const typeClass = toast.type === "info" ? "alert-info" : toast.type === "success" ? "alert-success" : toast.type === "warning" ? "alert-warning" : "alert-error";

          return (
            // Render a single toast message.
            <div className={`alert ${typeClass}`} key={toast.id}>
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>

    </ToastContext.Provider>
  );
}

export default ToastContext;
