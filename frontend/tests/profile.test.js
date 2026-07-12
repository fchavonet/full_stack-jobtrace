import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
} from "../src/api/profile.api";

import {
  apiRequest,
} from "../src/api/client";

import {
  defaultUserProfile,
  getNumberValue,
  getProfileDisplayName,
  getProfileFromResponse,
  getProfileInitials,
  getTextValue,
} from "../src/utils/profile/profile.utils";

import {
  TEST_USER,
} from "./helpers/test-data";

vi.mock("../src/api/client", function () {
  return {
    apiRequest: vi.fn(),
  };
});

beforeEach(function () {
  apiRequest.mockReset();
});

describe("Profile API", function () {
  test("GET /profile - Should get user profile", async function () {
    const response = {
      success: true,
      data: {
        user: TEST_USER,
      },
    };

    apiRequest.mockResolvedValue(response);

    const result = await getUserProfile();

    expect(apiRequest).toHaveBeenCalledWith(
      "/profile",
      {
        method: "GET",
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("PATCH /profile - Should update user profile", async function () {
    const payload = {
      firstName: "Fabien",
      lastName: "Chavonet",
      avatarUrl: "https://example.com/avatar.png",
    };

    const response = {
      success: true,
    };

    apiRequest.mockResolvedValue(response);

    const result = await updateUserProfile(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/profile",
      {
        method: "PATCH",
        body: payload,
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("PATCH /profile/password - Should update password", async function () {
    const payload = {
      currentPassword: "Password42",
      newPassword: "NewPassword42",
    };

    const response = {
      success: true,
    };

    apiRequest.mockResolvedValue(response);

    const result = await updateUserPassword(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/profile/password",
      {
        method: "PATCH",
        body: payload,
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("GET /profile - Should propagate API error", async function () {
    const apiError = {
      success: false,
      message: "Profile unavailable.",
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      getUserProfile(),
    ).rejects.toEqual(apiError);
  });

  test("PATCH /profile - Should propagate validation error", async function () {
    const apiError = {
      success: false,
      message: "Invalid profile.",
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      updateUserProfile({}),
    ).rejects.toEqual(apiError);
  });

  test("PATCH /profile/password - Should propagate password error", async function () {
    const apiError = {
      success: false,
      message: "Current password is invalid.",
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      updateUserPassword({}),
    ).rejects.toEqual(apiError);
  });
});

describe("Profile utilities", function () {
  test("defaultUserProfile - Should contain empty profile values", function () {
    expect(defaultUserProfile).toEqual({
      firstName: "",
      lastName: "",
      email: "",
      avatarUrl: "",
    });
  });

  test("getProfileFromResponse - Should return user", function () {
    expect(
      getProfileFromResponse({
        data: {
          user: TEST_USER,
        },
      }),
    ).toEqual(TEST_USER);
  });

  test("getProfileFromResponse - Should prioritize user over profile", function () {
    expect(
      getProfileFromResponse({
        data: {
          user: TEST_USER,
          profile: {
            firstName: "Other",
          },
        },
      }),
    ).toEqual(TEST_USER);
  });

  test("getProfileFromResponse - Should return profile", function () {
    const profile = {
      firstName: "Fabien",
    };

    expect(
      getProfileFromResponse({
        data: {
          profile,
        },
      }),
    ).toEqual(profile);
  });

  test("getProfileFromResponse - Should return direct data", function () {
    expect(
      getProfileFromResponse({
        data: TEST_USER,
      }),
    ).toEqual(TEST_USER);
  });

  test("getProfileFromResponse - Should return empty object", function () {
    expect(
      getProfileFromResponse(null),
    ).toEqual({});

    expect(
      getProfileFromResponse({}),
    ).toEqual({});
  });

  test("getTextValue - Should return string", function () {
    expect(
      getTextValue("Fabien"),
    ).toBe("Fabien");

    expect(
      getTextValue(""),
    ).toBe("");
  });

  test("getTextValue - Should reject non-string value", function () {
    expect(
      getTextValue(null),
    ).toBe("");

    expect(
      getTextValue(42),
    ).toBe("");

    expect(
      getTextValue({}),
    ).toBe("");
  });

  test("getNumberValue - Should return valid number", function () {
    expect(
      getNumberValue("10", 5),
    ).toBe(10);

    expect(
      getNumberValue(15, 5),
    ).toBe(15);

    expect(
      getNumberValue(1.5, 5),
    ).toBe(1.5);
  });

  test("getNumberValue - Should return default value", function () {
    expect(
      getNumberValue(0, 5),
    ).toBe(5);

    expect(
      getNumberValue(-1, 5),
    ).toBe(5);

    expect(
      getNumberValue("invalid", 5),
    ).toBe(5);

    expect(
      getNumberValue(null, 5),
    ).toBe(5);
  });

  test("getProfileInitials - Should return initials", function () {
    expect(
      getProfileInitials({
        firstName: "Fabien",
        lastName: "Chavonet",
      }),
    ).toBe("FC");
  });

  test("getProfileInitials - Should trim names", function () {
    expect(
      getProfileInitials({
        firstName: "  fabien  ",
        lastName: "  chavonet  ",
      }),
    ).toBe("FC");
  });

  test("getProfileInitials - Should support first name only", function () {
    expect(
      getProfileInitials({
        firstName: "Fabien",
        lastName: "",
      }),
    ).toBe("F");
  });

  test("getProfileInitials - Should support last name only", function () {
    expect(
      getProfileInitials({
        firstName: "",
        lastName: "Chavonet",
      }),
    ).toBe("C");
  });

  test("getProfileInitials - Should return fallback", function () {
    expect(
      getProfileInitials({
        firstName: "",
        lastName: "",
      }),
    ).toBe("JT");
  });

  test("getProfileDisplayName - Should return full name", function () {
    expect(
      getProfileDisplayName({
        firstName: "Fabien",
        lastName: "Chavonet",
      }),
    ).toBe("Fabien Chavonet");
  });

  test("getProfileDisplayName - Should trim full name", function () {
    expect(
      getProfileDisplayName({
        firstName: "  Fabien  ",
        lastName: "  Chavonet  ",
      }),
    ).toBe("Fabien     Chavonet");
  });

  test("getProfileDisplayName - Should return first name", function () {
    expect(
      getProfileDisplayName({
        firstName: "Fabien",
        lastName: "",
      }),
    ).toBe("Fabien");
  });

  test("getProfileDisplayName - Should return email", function () {
    expect(
      getProfileDisplayName({
        email: "fabien@jobtrace.test",
      }),
    ).toBe("fabien@jobtrace.test");
  });

  test("getProfileDisplayName - Should prioritize name over email", function () {
    expect(
      getProfileDisplayName({
        firstName: "Fabien",
        lastName: "Chavonet",
        email: "fabien@jobtrace.test",
      }),
    ).toBe("Fabien Chavonet");
  });

  test("getProfileDisplayName - Should return fallback", function () {
    expect(
      getProfileDisplayName({}),
    ).toBe("Utilisateur");
  });
});