import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Load initial theme from local storage.
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Apply theme to document root on change.
  useEffect(function () {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Switch light and dark modes and persist to local storage.
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
