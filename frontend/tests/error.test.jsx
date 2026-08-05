import {
  render,
  screen,
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router";

import {
  describe,
  expect,
  test,
  vi,
} from "vitest";

import NotFoundPage from "../src/pages/NotFoundPage";
import ProtectedRoute from "../src/routes/ProtectedRoute";

import {
  useAuth,
} from "../src/hooks/useAuth";

vi.mock("../src/hooks/useAuth", function () {
  return {
    useAuth: vi.fn(),
  };
});

function renderProtectedRoute(
  initialEntry = "/dashboard",
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/"
          element={<p>Page publique</p>}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<p>Dashboard privé</p>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Error handling routes", function () {
  test("GET /unknown - Should display not found page", function () {
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <Routes>
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Page introuvable",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "link",
        {
          name: "Retour à l’accueil",
        },
      ),
    ).toHaveAttribute("href", "/");
  });

  test("ProtectedRoute - Should display loading state", function () {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    renderProtectedRoute();

    expect(
      screen.getByText(
        "Chargement de votre session...",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Dashboard privé"),
    ).not.toBeInTheDocument();
  });

  test("ProtectedRoute - Should redirect unauthenticated user", function () {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Page publique"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Dashboard privé"),
    ).not.toBeInTheDocument();
  });

  test("ProtectedRoute - Should display protected content for authenticated user", function () {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Dashboard privé"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Page publique"),
    ).not.toBeInTheDocument();
  });
});
