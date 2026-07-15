import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  AuthProvider,
} from "../src/contexts/AuthContext";

import {
  useAuth,
} from "../src/hooks/useAuth";

import {
  TEST_USER,
} from "./helpers/test-data";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../src/api/auth.api";

vi.mock("../src/api/auth.api", function () {
  return {
    getCurrentUser: vi.fn(),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    registerUser: vi.fn(),
  };
});

function AuthConsumer() {
  const {
    isAuthenticated,
    loading,
    login,
    logout,
    refreshCurrentUser,
    register,
    user,
  } = useAuth();

  async function handleLogin() {
    try {
      await login({
        email: "dick.grayson@jobtrace.test",
        password: "Password42",
      });
    } catch {
      return;
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      return;
    }
  }

  async function handleRegister() {
    try {
      await register({
        email: "dick.grayson@jobtrace.test",
        password: "Password42",
      });
    } catch {
      return;
    }
  }

  async function handleRefreshCurrentUser() {
    try {
      await refreshCurrentUser();
    } catch {
      return;
    }
  }

  return (
    <div>
      <p>
        Chargement : {loading ? "oui" : "non"}
      </p>

      <p>
        Authentifié : {isAuthenticated ? "oui" : "non"}
      </p>

      <p>
        Utilisateur : {user ? user.email : "aucun"}
      </p>

      <button
        type="button"
        onClick={handleLogin}
      >
        Se connecter
      </button>

      <button
        type="button"
        onClick={handleLogout}
      >
        Se déconnecter
      </button>

      <button
        type="button"
        onClick={handleRegister}
      >
        S’inscrire
      </button>

      <button
        type="button"
        onClick={handleRefreshCurrentUser}
      >
        Actualiser la session
      </button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

beforeEach(function () {
  getCurrentUser.mockReset();
  loginUser.mockReset();
  logoutUser.mockReset();
  registerUser.mockReset();
});

describe("Authentication context", function () {
  test("AuthProvider - Should restore current user", async function () {
    getCurrentUser.mockResolvedValue({
      data: {
        user: TEST_USER,
      },
    });

    renderAuthProvider();

    expect(
      screen.getByText("Chargement : oui"),
    ).toBeInTheDocument();

    await waitFor(function () {
      expect(
        screen.getByText("Chargement : non"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Authentifié : oui"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Utilisateur : dick.grayson@jobtrace.test",
      ),
    ).toBeInTheDocument();
  });

  test("AuthProvider - Should remain unauthenticated when session request fails", async function () {
    getCurrentUser.mockRejectedValue({
      success: false,
      message: "Authentication required.",
    });

    renderAuthProvider();

    await waitFor(function () {
      expect(
        screen.getByText("Chargement : non"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Authentifié : non"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Utilisateur : aucun"),
    ).toBeInTheDocument();
  });

  test("AuthProvider - Should authenticate user after login", async function () {
    const user = userEvent.setup();

    getCurrentUser.mockRejectedValue({
      success: false,
    });

    loginUser.mockResolvedValue({
      data: {
        user: TEST_USER,
      },
    });

    renderAuthProvider();

    await waitFor(function () {
      expect(
        screen.getByText("Chargement : non"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Se connecter",
        },
      ),
    );

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : oui"),
      ).toBeInTheDocument();
    });

    expect(loginUser).toHaveBeenCalledWith({
      email: "dick.grayson@jobtrace.test",
      password: "Password42",
    });
  });

  test("AuthProvider - Should clear user after logout", async function () {
    const user = userEvent.setup();

    getCurrentUser.mockResolvedValue({
      data: {
        user: TEST_USER,
      },
    });

    logoutUser.mockResolvedValue({
      success: true,
    });

    renderAuthProvider();

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : oui"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Se déconnecter",
        },
      ),
    );

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : non"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Utilisateur : aucun"),
    ).toBeInTheDocument();

    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  test("AuthProvider - Should clear user when logout request fails", async function () {
    const user = userEvent.setup();

    getCurrentUser.mockResolvedValue({
      data: {
        user: TEST_USER,
      },
    });

    logoutUser.mockRejectedValue({
      success: false,
      message: "Logout failed.",
    });

    renderAuthProvider();

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : oui"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Se déconnecter",
        },
      ),
    );

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : non"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Utilisateur : aucun"),
    ).toBeInTheDocument();

    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  test("AuthProvider - Should register user without authenticating session", async function () {
    const user = userEvent.setup();

    getCurrentUser.mockRejectedValue({
      success: false,
    });

    registerUser.mockResolvedValue({
      success: true,
    });

    renderAuthProvider();

    await waitFor(function () {
      expect(
        screen.getByText("Chargement : non"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "S’inscrire",
        },
      ),
    );

    expect(registerUser).toHaveBeenCalledWith({
      email: "dick.grayson@jobtrace.test",
      password: "Password42",
    });

    expect(
      screen.getByText("Authentifié : non"),
    ).toBeInTheDocument();
  });

  test("AuthProvider - Should refresh current user", async function () {
    const user = userEvent.setup();

    getCurrentUser
      .mockRejectedValueOnce({
        success: false,
      })
      .mockResolvedValueOnce({
        data: {
          user: TEST_USER,
        },
      });

    renderAuthProvider();

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : non"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Actualiser la session",
        },
      ),
    );

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : oui"),
      ).toBeInTheDocument();
    });

    expect(getCurrentUser).toHaveBeenCalledTimes(2);
  });

  test("AuthProvider - Should clear user when refresh fails", async function () {
    const user = userEvent.setup();

    getCurrentUser
      .mockResolvedValueOnce({
        data: {
          user: TEST_USER,
        },
      })
      .mockRejectedValueOnce({
        success: false,
        message: "Session expired.",
      });

    renderAuthProvider();

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : oui"),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Actualiser la session",
        },
      ),
    );

    await waitFor(function () {
      expect(
        screen.getByText("Authentifié : non"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Utilisateur : aucun"),
    ).toBeInTheDocument();
  });

  test("useAuth - Should throw outside AuthProvider", function () {
    function InvalidConsumer() {
      useAuth();

      return null;
    }

    expect(function () {
      render(<InvalidConsumer />);
    }).toThrow(
      "useAuth must be used inside AuthProvider.",
    );
  });
});
