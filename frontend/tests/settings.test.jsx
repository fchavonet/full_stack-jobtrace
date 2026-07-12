import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  updateUserSettings,
} from "../src/api/settings.api";

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

describe("Settings API", function () {
  test("PATCH /profile/settings - Should update all settings", async function () {
    const payload = {
      theme: "dark",
      dailyGoal: 5,
      followUpDelayDays: 15,
    };

    const response = {
      success: true,
      data: {
        settings: payload,
      },
    };

    apiRequest.mockResolvedValue(response);

    const result = await updateUserSettings(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/profile/settings",
      {
        method: "PATCH",
        body: payload,
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("PATCH /profile/settings - Should update theme only", async function () {
    const payload = {
      theme: "light",
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await updateUserSettings(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/profile/settings",
      {
        method: "PATCH",
        body: payload,
        authenticated: true,
      },
    );
  });

  test("PATCH /profile/settings - Should update daily goal only", async function () {
    const payload = {
      dailyGoal: 10,
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await updateUserSettings(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/profile/settings",
      {
        method: "PATCH",
        body: payload,
        authenticated: true,
      },
    );
  });

  test("PATCH /profile/settings - Should update follow-up delay only", async function () {
    const payload = {
      followUpDelayDays: 7,
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await updateUserSettings(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/profile/settings",
      {
        method: "PATCH",
        body: payload,
        authenticated: true,
      },
    );
  });

  test("PATCH /profile/settings - Should preserve payload reference", async function () {
    const payload = {
      theme: "dark",
      dailyGoal: 8,
    };

    apiRequest.mockResolvedValue({
      success: true,
    });

    await updateUserSettings(payload);

    expect(
      apiRequest.mock.calls[0][1].body,
    ).toBe(payload);
  });

  test("PATCH /profile/settings - Should propagate API error", async function () {
    const apiError = {
      success: false,
      message: "Settings update failed.",
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      updateUserSettings({
        theme: "dark",
      }),
    ).rejects.toEqual(apiError);
  });

  test("PATCH /profile/settings - Should propagate validation error", async function () {
    const apiError = {
      success: false,
      message: "Invalid daily goal.",
      errors: [
        "Daily goal must be positive.",
      ],
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      updateUserSettings({
        dailyGoal: 0,
      }),
    ).rejects.toEqual(apiError);
  });

  test("PATCH /profile/settings - Should accept empty payload", async function () {
    const payload = {};

    apiRequest.mockResolvedValue({
      success: true,
    });

    await updateUserSettings(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/profile/settings",
      {
        method: "PATCH",
        body: payload,
        authenticated: true,
      },
    );
  });
});
