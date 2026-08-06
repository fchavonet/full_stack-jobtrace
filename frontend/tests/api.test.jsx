import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  deleteCurrentUser,
  exportCurrentUserData,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyUserEmail,
} from "../src/api/auth.api";

import {
  apiRequest,
} from "../src/api/client";

vi.mock("../src/api/client", function () {
  return {
    apiRequest: vi.fn(),
  };
});

beforeEach(function () {
  apiRequest.mockReset();
});

describe("Authentication API", function () {
  test("POST /auth/register - Should send registration payload", async function () {
    const payload = {
      email: "dick.grayson@jobtrace.test",
      password: "Password42",
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await registerUser(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  });

  test("GET /auth/verify-email - Should encode verification token", async function () {
    apiRequest.mockResolvedValue({
      success: true,
    });

    await verifyUserEmail(
      "token with spaces",
    );

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/verify-email?token=token%20with%20spaces",
      {
        method: "GET",
      },
    );
  });

  test("POST /auth/login - Should send login payload", async function () {
    const payload = {
      email: "dick.grayson@jobtrace.test",
      password: "Password42",
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await loginUser(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  });

  test("POST /auth/logout - Should request logout", async function () {
    apiRequest.mockResolvedValue({
      success: true,
    });

    await logoutUser();

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/logout",
      {
        method: "POST",
      },
    );
  });

  test("GET /auth/me - Should request current user", async function () {
    apiRequest.mockResolvedValue({
      success: true,
    });

    await getCurrentUser();

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/me",
      {
        method: "GET",
      },
    );
  });

  test("DELETE /auth/me - Should request account deletion", async function () {
    const payload = {
      currentPassword: "Password42",
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await deleteCurrentUser(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/me",
      {
        method: "DELETE",
        body: JSON.stringify(payload),
      },
    );
  });

  test("GET /auth/export - Should request user export", async function () {
    apiRequest.mockResolvedValue({
      success: true,
    });

    await exportCurrentUserData();

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/export",
      {
        method: "GET",
      },
    );
  });

  test("POST /auth/forgot-password - Should send reset request", async function () {
    const payload = {
      email: "dick.grayson@jobtrace.test",
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await requestPasswordReset(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  });

  test("POST /auth/reset-password - Should send new password", async function () {
    const payload = {
      token: "reset-token",
      password: "NewPassword42",
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await resetPassword(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  });
});