import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  describe,
  expect,
  test,
} from "vitest";

import {
  ThemeProvider,
} from "../src/contexts/ThemeContext";

import {
  useTheme,
} from "../src/hooks/useTheme";

function ThemeConsumer() {
  const {
    setTheme,
    theme,
  } = useTheme();

  return (
    <div>
      <p>Thème actuel : {theme}</p>

      <button
        type="button"
        onClick={function () {
          setTheme("dark");
        }}
      >
        Activer le thème sombre
      </button>

      <button
        type="button"
        onClick={function () {
          setTheme("light");
        }}
      >
        Activer le thème clair
      </button>

      <button
        type="button"
        onClick={function () {
          setTheme("unknown");
        }}
      >
        Activer un thème invalide
      </button>
    </div>
  );
}

function renderThemeProvider() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>,
  );
}

describe("Theme context", function () {
  test("ThemeProvider - Should use light theme by default", function () {
    renderThemeProvider();

    expect(
      screen.getByText("Thème actuel : light"),
    ).toBeInTheDocument();

    expect(
      document.documentElement,
    ).toHaveAttribute("data-theme", "light");
  });

  test("ThemeProvider - Should restore dark theme from local storage", function () {
    localStorage.setItem(
      "jobtrace_theme",
      "dark",
    );

    renderThemeProvider();

    expect(
      screen.getByText("Thème actuel : dark"),
    ).toBeInTheDocument();

    expect(
      document.documentElement,
    ).toHaveAttribute("data-theme", "dark");
  });

  test("ThemeProvider - Should ignore invalid stored theme", function () {
    localStorage.setItem(
      "jobtrace_theme",
      "unknown",
    );

    renderThemeProvider();

    expect(
      screen.getByText("Thème actuel : light"),
    ).toBeInTheDocument();

    expect(
      document.documentElement,
    ).toHaveAttribute("data-theme", "light");
  });

  test("ThemeProvider - Should update and persist dark theme", async function () {
    const user = userEvent.setup();

    renderThemeProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Activer le thème sombre",
        },
      ),
    );

    expect(
      screen.getByText("Thème actuel : dark"),
    ).toBeInTheDocument();

    expect(
      localStorage.getItem("jobtrace_theme"),
    ).toBe("dark");

    expect(
      document.documentElement,
    ).toHaveAttribute("data-theme", "dark");
  });

  test("ThemeProvider - Should update and persist light theme", async function () {
    const user = userEvent.setup();

    localStorage.setItem(
      "jobtrace_theme",
      "dark",
    );

    renderThemeProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Activer le thème clair",
        },
      ),
    );

    expect(
      screen.getByText("Thème actuel : light"),
    ).toBeInTheDocument();

    expect(
      localStorage.getItem("jobtrace_theme"),
    ).toBe("light");

    expect(
      document.documentElement,
    ).toHaveAttribute("data-theme", "light");
  });

  test("ThemeProvider - Should fallback to light for invalid selected theme", async function () {
    const user = userEvent.setup();

    localStorage.setItem(
      "jobtrace_theme",
      "dark",
    );

    renderThemeProvider();

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Activer un thème invalide",
        },
      ),
    );

    expect(
      screen.getByText("Thème actuel : light"),
    ).toBeInTheDocument();

    expect(
      localStorage.getItem("jobtrace_theme"),
    ).toBe("light");
  });
});
