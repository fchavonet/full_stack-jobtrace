import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  apiFileRequest,
  apiRequest,
  getApiUrl,
} from "../src/api/client";

import {
  getEntityId,
  getErrorMessage,
  getListFromResponse,
  getResponseEntity,
} from "../src/utils/common/apiResponse.utils";

import {
  formatDate,
  formatDateTime,
  formatFileSize,
  formatSalary,
} from "../src/utils/common/format.utils";

import {
  normalizeValue,
} from "../src/utils/common/string.utils";

function createFetchResponse({
  body = "",
  blob,
  contentType = "application/json",
  ok = true,
  status = 200,
} = {}) {
  return {
    ok,
    status,
    headers: {
      get: vi.fn(function (headerName) {
        if (headerName === "content-type") {
          return contentType;
        }

        return null;
      }),
    },
    text: vi.fn().mockResolvedValue(body),
    blob: vi.fn().mockResolvedValue(
      blob || new Blob(
        ["test"],
        {
          type: contentType,
        },
      ),
    ),
  };
}

afterEach(function () {
  vi.unstubAllGlobals();
});

describe("Common utilities", function () {
  describe("normalizeValue", function () {
    test("normalizeValue - Should normalize accents, casing and spaces", function () {
      const result = normalizeValue(
        "  Développeur Frontend  ",
      );

      expect(result).toBe("developpeur frontend");
    });

    test("normalizeValue - Should return empty string for missing value", function () {
      expect(normalizeValue(null)).toBe("");
      expect(normalizeValue(undefined)).toBe("");
      expect(normalizeValue("")).toBe("");
    });

    test("normalizeValue - Should convert number to string", function () {
      expect(normalizeValue(42)).toBe("42");
    });
  });

  describe("formatDate", function () {
    test("formatDate - Should format valid date using French locale", function () {
      const result = formatDate("2026-07-01T12:00:00.000Z");

      expect(result).toBe("01/07/2026");
    });

    test("formatDate - Should return fallback for missing date", function () {
      expect(formatDate(null)).toBe("-");
      expect(formatDate(undefined)).toBe("-");
      expect(formatDate("")).toBe("-");
    });

    test("formatDate - Should return fallback for invalid date", function () {
      expect(formatDate("invalid-date")).toBe("-");
    });
  });

  describe("formatDateTime", function () {
    test("formatDateTime - Should format valid date and time", function () {
      const result = formatDateTime(
        "2026-07-01T12:00:00.000Z",
      );

      expect(result).toContain("01/07/2026");
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    test("formatDateTime - Should return fallback for missing date", function () {
      expect(formatDateTime(null)).toBe("-");
      expect(formatDateTime(undefined)).toBe("-");
    });

    test("formatDateTime - Should return fallback for invalid date", function () {
      expect(formatDateTime("invalid-date")).toBe("-");
    });
  });

  describe("formatSalary", function () {
    test("formatSalary - Should format numeric salary", function () {
      const result = formatSalary(45000);

      expect(result).toContain("45");
      expect(result).toContain("€");
    });

    test("formatSalary - Should format numeric string", function () {
      const result = formatSalary("32000");

      expect(result).toContain("32");
      expect(result).toContain("€");
    });

    test("formatSalary - Should return fallback for missing salary", function () {
      expect(formatSalary(null)).toBe("Non renseigné");
      expect(formatSalary(undefined)).toBe("Non renseigné");
      expect(formatSalary("")).toBe("Non renseigné");
    });

    test("formatSalary - Should return fallback for invalid salary", function () {
      expect(
        formatSalary("invalid-number"),
      ).toBe("Non renseigné");
    });
  });

  describe("formatFileSize", function () {
    test("formatFileSize - Should format size in kilobytes", function () {
      expect(formatFileSize(2048)).toBe("2 Ko");
    });

    test("formatFileSize - Should format size in megabytes", function () {
      expect(
        formatFileSize(1572864),
      ).toBe("1.5 Mo");
    });

    test("formatFileSize - Should return fallback for invalid size", function () {
      expect(formatFileSize(null)).toBe("Taille inconnue");
      expect(formatFileSize(0)).toBe("Taille inconnue");
      expect(formatFileSize(-1)).toBe("Taille inconnue");
      expect(
        formatFileSize("invalid-number"),
      ).toBe("Taille inconnue");
    });
  });
});

describe("API response utilities", function () {
  const entity = {
    id: "entity-id",
    name: "Entity",
  };

  test("getResponseEntity - Should return direct entity", function () {
    expect(
      getResponseEntity(entity, "application"),
    ).toEqual(entity);
  });

  test("getResponseEntity - Should return entity from data", function () {
    expect(
      getResponseEntity(
        {
          data: entity,
        },
        "application",
      ),
    ).toEqual(entity);
  });

  test("getResponseEntity - Should return named entity from data", function () {
    expect(
      getResponseEntity(
        {
          data: {
            application: entity,
          },
        },
        "application",
      ),
    ).toEqual(entity);
  });

  test("getResponseEntity - Should return named root entity", function () {
    expect(
      getResponseEntity(
        {
          application: entity,
        },
        "application",
      ),
    ).toEqual(entity);
  });

  test("getResponseEntity - Should return null when entity is missing", function () {
    expect(
      getResponseEntity(null, "application"),
    ).toBeNull();

    expect(
      getResponseEntity({}, "application"),
    ).toBeNull();
  });

  test("getEntityId - Should return entity identifier", function () {
    expect(
      getEntityId(
        {
          data: {
            application: entity,
          },
        },
        "application",
      ),
    ).toBe("entity-id");
  });

  test("getEntityId - Should return null when identifier is missing", function () {
    expect(
      getEntityId({}, "application"),
    ).toBeNull();
  });

  test("getListFromResponse - Should return direct array", function () {
    expect(
      getListFromResponse(
        [entity],
        "applications",
      ),
    ).toEqual([entity]);
  });

  test("getListFromResponse - Should return named root list", function () {
    expect(
      getListFromResponse(
        {
          applications: [entity],
        },
        "applications",
      ),
    ).toEqual([entity]);
  });

  test("getListFromResponse - Should return direct data list", function () {
    expect(
      getListFromResponse(
        {
          data: [entity],
        },
        "applications",
      ),
    ).toEqual([entity]);
  });

  test("getListFromResponse - Should return named data list", function () {
    expect(
      getListFromResponse(
        {
          data: {
            applications: [entity],
          },
        },
        "applications",
      ),
    ).toEqual([entity]);
  });

  test("getListFromResponse - Should return empty array when list is missing", function () {
    expect(
      getListFromResponse({}, "applications"),
    ).toEqual([]);
  });

  test("getErrorMessage - Should return direct message", function () {
    expect(
      getErrorMessage(
        {
          message: "Direct message.",
        },
        "Fallback.",
      ),
    ).toBe("Direct message.");
  });

  test("getErrorMessage - Should return joined validation errors", function () {
    expect(
      getErrorMessage(
        {
          errors: [
            "First error.",
            "Second error.",
          ],
        },
        "Fallback.",
      ),
    ).toBe("First error. Second error.");
  });

  test("getErrorMessage - Should return error property", function () {
    expect(
      getErrorMessage(
        {
          error: "Error property.",
        },
        "Fallback.",
      ),
    ).toBe("Error property.");
  });

  test("getErrorMessage - Should return fallback message", function () {
    expect(
      getErrorMessage(null, "Fallback."),
    ).toBe("Fallback.");
  });
});

describe("API client", function () {
  test("getApiUrl - Should return configured API URL", function () {
    expect(getApiUrl()).toBe(
      "http://localhost:4000/api",
    );
  });

  test("apiRequest - Should send JSON request with credentials", async function () {
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        body: JSON.stringify({
          success: true,
        }),
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest(
      "/applications",
      {
        method: "POST",
        body: {
          company: "Wayne Enterprises",
        },
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/applications",
      {
        method: "POST",
        body: JSON.stringify({
          company: "Wayne Enterprises",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    expect(result).toEqual({
      success: true,
    });
  });

  test("apiRequest - Should preserve string body", async function () {
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        body: JSON.stringify({
          success: true,
        }),
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await apiRequest(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email: "dick.grayson@jobtrace.test",
        }),
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/auth/login",
      expect.objectContaining({
        body: JSON.stringify({
          email: "dick.grayson@jobtrace.test",
        }),
      }),
    );
  });

  test("apiRequest - Should send FormData without JSON content type", async function () {
    const formData = new FormData();

    formData.append(
      "file",
      new File(
        ["document"],
        "resume.pdf",
        {
          type: "application/pdf",
        },
      ),
    );

    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        body: JSON.stringify({
          success: true,
        }),
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await apiRequest(
      "/documents",
      {
        method: "POST",
        body: formData,
      },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/documents",
      {
        method: "POST",
        body: formData,
        headers: {},
        credentials: "include",
      },
    );
  });

  test("apiRequest - Should return null for empty response", async function () {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createFetchResponse({
          body: "",
        }),
      ),
    );

    await expect(
      apiRequest("/auth/logout"),
    ).resolves.toBeNull();
  });

  test("apiRequest - Should return plain text response", async function () {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createFetchResponse({
          body: "Plain response",
        }),
      ),
    );

    await expect(
      apiRequest("/health"),
    ).resolves.toBe("Plain response");
  });

  test("apiRequest - Should throw parsed API error", async function () {
    const apiError = {
      success: false,
      message: "Authentication required.",
      errors: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createFetchResponse({
          body: JSON.stringify(apiError),
          ok: false,
          status: 401,
        }),
      ),
    );

    await expect(
      apiRequest("/auth/me"),
    ).rejects.toEqual(apiError);
  });

  test("apiFileRequest - Should return downloaded file", async function () {
    const expectedBlob = new Blob(
      ["PDF content"],
      {
        type: "application/pdf",
      },
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createFetchResponse({
          blob: expectedBlob,
          contentType: "application/pdf",
        }),
      ),
    );

    const result = await apiFileRequest(
      "/documents/document-id/download",
    );

    expect(result).toEqual({
      blob: expectedBlob,
      contentType: "application/pdf",
    });
  });

  test("apiFileRequest - Should throw API error response", async function () {
    const apiError = {
      success: false,
      message: "Document not found.",
      errors: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createFetchResponse({
          body: JSON.stringify(apiError),
          contentType: "application/json",
          ok: false,
          status: 404,
        }),
      ),
    );

    await expect(
      apiFileRequest(
        "/documents/unknown/download",
      ),
    ).rejects.toEqual(apiError);
  });

  test("apiFileRequest - Should reject successful JSON response", async function () {
    const apiError = {
      success: false,
      message: "Invalid response.",
      errors: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createFetchResponse({
          body: JSON.stringify(apiError),
          contentType: "application/json",
        }),
      ),
    );

    await expect(
      apiFileRequest(
        "/documents/document-id/download",
      ),
    ).rejects.toEqual(apiError);
  });

  test("apiFileRequest - Should reject JSON blob", async function () {
    const jsonBlob = new Blob(
      [
        JSON.stringify({
          success: false,
        }),
      ],
      {
        type: "application/json",
      },
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createFetchResponse({
          blob: jsonBlob,
          contentType: "application/pdf",
        }),
      ),
    );

    await expect(
      apiFileRequest(
        "/documents/document-id/download",
      ),
    ).rejects.toThrow("Invalid file response.");
  });
});
