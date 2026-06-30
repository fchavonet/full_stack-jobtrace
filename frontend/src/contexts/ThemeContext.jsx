import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "jobtrace_theme";
const defaultTheme = "light";

function getStoredTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "dark") {
    return "dark";
  }

  return defaultTheme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);

  const setTheme = useCallback(function (nextTheme) {
    let validTheme = defaultTheme;

    if (nextTheme === "dark") {
      validTheme = "dark";
    }

    setThemeState(validTheme);
    localStorage.setItem(THEME_STORAGE_KEY, validTheme);
    document.documentElement.setAttribute("data-theme", validTheme);
  }, []);

  useEffect(function () {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo(function () {
    return {
      theme,
      setTheme,
    };
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
