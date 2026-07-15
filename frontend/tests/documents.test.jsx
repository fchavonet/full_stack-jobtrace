import {
  fireEvent,
  render,
  screen,
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
  deleteDocument,
  getDocumentDirectUrl,
  getDocumentFile,
  listDocuments,
  uploadDocument,
} from "../src/api/documents.api";

import {
  apiFileRequest,
  apiRequest,
  getApiUrl,
} from "../src/api/client";

import DocumentModal from "../src/components/documents/DocumentModal";
import DocumentSummaryCard from "../src/components/documents/DocumentSummaryCard";
import DocumentUploadFields from "../src/components/documents/DocumentUploadFields";

import {
  canPreviewDocument,
  cleanDocumentName,
  formatDocumentDate,
  formatDocumentFileSize,
  getDocumentDate,
  getDocumentExtension,
  getDocumentExtensionLabel,
  getDocumentLabel,
  getDocumentMimeType,
  getDocumentName,
  getDocumentSize,
  getDocumentType,
  getDocumentTypeLabel,
  getFilteredDocuments,
  getUploadErrorMessage,
  isImageDocument,
  isPdfDocument,
  revokePreviewUrls,
  revokeUrl,
  validateDocumentFile,
} from "../src/utils/documents/document.utils";

import {
  TEST_DOCUMENT,
} from "./helpers/test-data";

vi.mock("../src/api/client", function () {
  return {
    apiFileRequest: vi.fn(),
    apiRequest: vi.fn(),
    getApiUrl: vi.fn(),
  };
});

beforeEach(function () {
  apiFileRequest.mockReset();
  apiRequest.mockReset();
  getApiUrl.mockReset();

  getApiUrl.mockReturnValue(
    "http://localhost:4000/api",
  );
});

describe("Documents API", function () {
  test("GET /documents - Should list documents", async function () {
    const response = {
      success: true,
      data: {
        documents: [
          TEST_DOCUMENT,
        ],
      },
    };

    apiRequest.mockResolvedValue(response);

    const result = await listDocuments();

    expect(apiRequest).toHaveBeenCalledWith(
      "/documents",
      {
        method: "GET",
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("POST /documents - Should upload document", async function () {
    const formData = new FormData();

    formData.append(
      "type",
      "resume",
    );

    formData.append(
      "document",
      new File(
        ["resume"],
        "resume.pdf",
        {
          type: "application/pdf",
        },
      ),
    );

    const response = {
      success: true,
      data: {
        document: TEST_DOCUMENT,
      },
    };

    apiRequest.mockResolvedValue(response);

    const result = await uploadDocument(formData);

    expect(apiRequest).toHaveBeenCalledWith(
      "/documents",
      {
        method: "POST",
        body: formData,
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("GET /documents/:id - Should get document file", async function () {
    const response = {
      blob: new Blob(
        ["PDF content"],
        {
          type: "application/pdf",
        },
      ),
      contentType: "application/pdf",
    };

    apiFileRequest.mockResolvedValue(response);

    const result = await getDocumentFile(
      TEST_DOCUMENT.id,
    );

    expect(apiFileRequest).toHaveBeenCalledWith(
      "/documents/" + TEST_DOCUMENT.id,
      {
        method: "GET",
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("GET /documents/:id/download - Should use fallback route", async function () {
    const response = {
      blob: new Blob(
        ["PDF content"],
        {
          type: "application/pdf",
        },
      ),
      contentType: "application/pdf",
    };

    apiFileRequest
      .mockRejectedValueOnce(
        new Error("Direct route unavailable."),
      )
      .mockResolvedValueOnce(response);

    const result = await getDocumentFile(
      TEST_DOCUMENT.id,
    );

    expect(apiFileRequest).toHaveBeenNthCalledWith(
      1,
      "/documents/" + TEST_DOCUMENT.id,
      {
        method: "GET",
        authenticated: true,
      },
    );

    expect(apiFileRequest).toHaveBeenNthCalledWith(
      2,
      "/documents/"
      + TEST_DOCUMENT.id
      + "/download",
      {
        method: "GET",
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("DELETE /documents/:id - Should delete document", async function () {
    const response = {
      success: true,
      message: "Document deleted.",
    };

    apiRequest.mockResolvedValue(response);

    const result = await deleteDocument(
      TEST_DOCUMENT.id,
    );

    expect(apiRequest).toHaveBeenCalledWith(
      "/documents/" + TEST_DOCUMENT.id,
      {
        method: "DELETE",
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("getDocumentDirectUrl - Should return empty URL", function () {
    expect(
      getDocumentDirectUrl(null),
    ).toBe("");

    expect(
      getDocumentDirectUrl({}),
    ).toBe("");
  });

  test("getDocumentDirectUrl - Should preserve HTTP URL", function () {
    expect(
      getDocumentDirectUrl({
        fileUrl: "http://example.com/document.pdf",
      }),
    ).toBe(
      "http://example.com/document.pdf",
    );
  });

  test("getDocumentDirectUrl - Should preserve HTTPS URL", function () {
    expect(
      getDocumentDirectUrl({
        fileUrl: "https://example.com/document.pdf",
      }),
    ).toBe(
      "https://example.com/document.pdf",
    );
  });

  test("getDocumentDirectUrl - Should build URL from absolute path", function () {
    expect(
      getDocumentDirectUrl({
        fileUrl: "/uploads/document.pdf",
      }),
    ).toBe(
      "http://localhost:4000/uploads/document.pdf",
    );
  });

  test("getDocumentDirectUrl - Should build URL from relative path", function () {
    expect(
      getDocumentDirectUrl({
        path: "uploads/document.pdf",
      }),
    ).toBe(
      "http://localhost:4000/uploads/document.pdf",
    );
  });

  test("getDocumentDirectUrl - Should support snake case file URL", function () {
    expect(
      getDocumentDirectUrl({
        file_url: "/uploads/document.pdf",
      }),
    ).toBe(
      "http://localhost:4000/uploads/document.pdf",
    );
  });

  test("getDocumentDirectUrl - Should support generic URL property", function () {
    expect(
      getDocumentDirectUrl({
        url: "/uploads/document.pdf",
      }),
    ).toBe(
      "http://localhost:4000/uploads/document.pdf",
    );
  });

  test("getDocumentDirectUrl - Should remove trailing API slash", function () {
    getApiUrl.mockReturnValue(
      "http://localhost:4000/api/",
    );

    expect(
      getDocumentDirectUrl({
        path: "/uploads/document.pdf",
      }),
    ).toBe(
      "http://localhost:4000/uploads/document.pdf",
    );
  });
});

describe("Document name utilities", function () {
  test("cleanDocumentName - Should trim document name", function () {
    expect(
      cleanDocumentName(
        "  CV Frontend.pdf  ",
      ),
    ).toBe(
      "CV Frontend.pdf",
    );
  });

  test("cleanDocumentName - Should replace path separators", function () {
    expect(
      cleanDocumentName(
        "documents/CV\\Frontend.pdf",
      ),
    ).toBe(
      "documents-CV-Frontend.pdf",
    );
  });

  test("cleanDocumentName - Should remove control characters", function () {
    expect(
      cleanDocumentName(
        "CV\u0000Frontend.pdf",
      ),
    ).toBe(
      "CVFrontend.pdf",
    );
  });

  test("cleanDocumentName - Should return empty string", function () {
    expect(
      cleanDocumentName(null),
    ).toBe("");

    expect(
      cleanDocumentName(undefined),
    ).toBe("");

    expect(
      cleanDocumentName(42),
    ).toBe("");
  });

  test("getDocumentName - Should return original name", function () {
    expect(
      getDocumentName({
        originalName: "CV Fabien.pdf",
      }),
    ).toBe(
      "CV Fabien.pdf",
    );
  });

  test("getDocumentName - Should support snake case original name", function () {
    expect(
      getDocumentName({
        original_name: "CV Fabien.pdf",
      }),
    ).toBe(
      "CV Fabien.pdf",
    );
  });

  test("getDocumentName - Should return generic name property", function () {
    expect(
      getDocumentName({
        name: "CV Fabien.pdf",
      }),
    ).toBe(
      "CV Fabien.pdf",
    );
  });

  test("getDocumentName - Should support nested document", function () {
    expect(
      getDocumentName({
        document: {
          originalName: "CV Fabien.pdf",
        },
      }),
    ).toBe(
      "CV Fabien.pdf",
    );
  });

  test("getDocumentName - Should return fallback", function () {
    expect(
      getDocumentName(null),
    ).toBe(
      "Document sans nom",
    );

    expect(
      getDocumentName({}),
    ).toBe(
      "Document sans nom",
    );
  });

  test("getDocumentLabel - Should return document name", function () {
    expect(
      getDocumentLabel({
        originalName: "CV Fabien.pdf",
      }),
    ).toBe(
      "CV Fabien.pdf",
    );
  });
});

describe("Document metadata utilities", function () {
  test("getDocumentMimeType - Should return MIME type", function () {
    expect(
      getDocumentMimeType({
        mimeType: "application/pdf",
      }),
    ).toBe(
      "application/pdf",
    );
  });

  test("getDocumentMimeType - Should support snake case MIME type", function () {
    expect(
      getDocumentMimeType({
        mime_type: "image/png",
      }),
    ).toBe(
      "image/png",
    );
  });

  test("getDocumentMimeType - Should return empty MIME type", function () {
    expect(
      getDocumentMimeType(null),
    ).toBe("");
  });

  test("getDocumentSize - Should return document size", function () {
    expect(
      getDocumentSize({
        size: 2048,
      }),
    ).toBe(2048);
  });

  test("getDocumentSize - Should reject invalid size", function () {
    expect(
      getDocumentSize({
        size: "2048",
      }),
    ).toBe(0);

    expect(
      getDocumentSize(null),
    ).toBe(0);
  });

  test("getDocumentDate - Should return creation date", function () {
    expect(
      getDocumentDate({
        createdAt: "2026-07-12T10:00:00.000Z",
      }),
    ).toBe(
      "2026-07-12T10:00:00.000Z",
    );
  });

  test("getDocumentDate - Should support snake case date", function () {
    expect(
      getDocumentDate({
        created_at: "2026-07-12T10:00:00.000Z",
      }),
    ).toBe(
      "2026-07-12T10:00:00.000Z",
    );
  });

  test("getDocumentDate - Should return empty date", function () {
    expect(
      getDocumentDate(null),
    ).toBe("");
  });

  test("getDocumentType - Should return document type", function () {
    expect(
      getDocumentType({
        type: "resume",
      }),
    ).toBe(
      "resume",
    );
  });

  test("getDocumentType - Should support string type", function () {
    expect(
      getDocumentType("resume"),
    ).toBe(
      "resume",
    );
  });

  test("getDocumentType - Should return default type", function () {
    expect(
      getDocumentType({}),
    ).toBe(
      "document",
    );
  });

  test("getDocumentTypeLabel - Should return CV label", function () {
    expect(
      getDocumentTypeLabel("resume"),
    ).toBe("CV");
  });

  test("getDocumentTypeLabel - Should return cover letter label", function () {
    expect(
      getDocumentTypeLabel("cover_letter"),
    ).toBe(
      "Lettre de motivation",
    );
  });

  test("getDocumentTypeLabel - Should return portfolio label", function () {
    expect(
      getDocumentTypeLabel("portfolio"),
    ).toBe(
      "Portfolio",
    );
  });

  test("getDocumentTypeLabel - Should return other document label", function () {
    expect(
      getDocumentTypeLabel("other"),
    ).toBe(
      "Autre document",
    );
  });

  test("getDocumentTypeLabel - Should return default label", function () {
    expect(
      getDocumentTypeLabel("unknown"),
    ).toBe(
      "Document",
    );
  });
});

describe("Document extension utilities", function () {
  test("getDocumentExtension - Should return lowercase extension", function () {
    expect(
      getDocumentExtension({
        originalName: "CV.PDF",
      }),
    ).toBe("pdf");
  });

  test("getDocumentExtension - Should return final extension", function () {
    expect(
      getDocumentExtension({
        originalName: "archive.cv.pdf",
      }),
    ).toBe("pdf");
  });

  test("getDocumentExtension - Should return empty extension", function () {
    expect(
      getDocumentExtension({
        originalName: "README",
      }),
    ).toBe("");
  });

  test("getDocumentExtensionLabel - Should return uppercase extension", function () {
    expect(
      getDocumentExtensionLabel({
        originalName: "CV.pdf",
      }),
    ).toBe("PDF");
  });

  test("getDocumentExtensionLabel - Should return fallback", function () {
    expect(
      getDocumentExtensionLabel({
        originalName: "README",
      }),
    ).toBe(
      "FICHIER",
    );
  });
});

describe("Document preview utilities", function () {
  test("isImageDocument - Should identify image MIME type", function () {
    expect(
      isImageDocument({
        originalName: "photo.data",
        mimeType: "image/png",
      }),
    ).toBe(true);
  });

  test("isImageDocument - Should identify PNG extension", function () {
    expect(
      isImageDocument({
        originalName: "photo.png",
      }),
    ).toBe(true);
  });

  test("isImageDocument - Should identify JPG extension", function () {
    expect(
      isImageDocument({
        originalName: "photo.jpg",
      }),
    ).toBe(true);
  });

  test("isImageDocument - Should identify JPEG extension", function () {
    expect(
      isImageDocument({
        originalName: "photo.jpeg",
      }),
    ).toBe(true);
  });

  test("isImageDocument - Should reject PDF", function () {
    expect(
      isImageDocument({
        originalName: "document.pdf",
        mimeType: "application/pdf",
      }),
    ).toBe(false);
  });

  test("isPdfDocument - Should identify PDF MIME type", function () {
    expect(
      isPdfDocument({
        originalName: "document.data",
        mimeType: "application/pdf",
      }),
    ).toBe(true);
  });

  test("isPdfDocument - Should identify PDF extension", function () {
    expect(
      isPdfDocument({
        originalName: "document.pdf",
      }),
    ).toBe(true);
  });

  test("isPdfDocument - Should reject image", function () {
    expect(
      isPdfDocument({
        originalName: "photo.png",
        mimeType: "image/png",
      }),
    ).toBe(false);
  });

  test("canPreviewDocument - Should preview image", function () {
    expect(
      canPreviewDocument({
        originalName: "photo.png",
      }),
    ).toBe(true);
  });

  test("canPreviewDocument - Should preview PDF", function () {
    expect(
      canPreviewDocument({
        originalName: "document.pdf",
      }),
    ).toBe(true);
  });

  test("canPreviewDocument - Should reject Word document", function () {
    expect(
      canPreviewDocument({
        originalName: "document.docx",
      }),
    ).toBe(false);
  });
});

describe("Document formatting utilities", function () {
  test("formatDocumentFileSize - Should format bytes", function () {
    expect(
      formatDocumentFileSize(512),
    ).toBe("512 o");
  });

  test("formatDocumentFileSize - Should format kilobytes", function () {
    expect(
      formatDocumentFileSize(2048),
    ).toBe("2 Ko");
  });

  test("formatDocumentFileSize - Should format megabytes", function () {
    expect(
      formatDocumentFileSize(
        1572864,
      ),
    ).toBe("1.5 Mo");
  });

  test("formatDocumentFileSize - Should return fallback", function () {
    expect(
      formatDocumentFileSize(null),
    ).toBe(
      "Taille inconnue",
    );

    expect(
      formatDocumentFileSize(0),
    ).toBe(
      "Taille inconnue",
    );

    expect(
      formatDocumentFileSize(-1),
    ).toBe(
      "Taille inconnue",
    );

    expect(
      formatDocumentFileSize("invalid"),
    ).toBe(
      "Taille inconnue",
    );
  });

  test("formatDocumentDate - Should format valid date", function () {
    expect(
      formatDocumentDate(
        "2026-07-12T12:00:00.000Z",
      ),
    ).toBe(
      "12/07/2026",
    );
  });

  test("formatDocumentDate - Should return fallback", function () {
    expect(
      formatDocumentDate(null),
    ).toBe(
      "Date inconnue",
    );

    expect(
      formatDocumentDate("invalid-date"),
    ).toBe(
      "Date inconnue",
    );
  });
});

describe("Document filtering utilities", function () {
  const documents = [
    {
      id: "resume",
      originalName: "CV Fabien.pdf",
      type: "resume",
      mimeType: "application/pdf",
    },
    {
      id: "cover-letter",
      originalName: "Lettre Apple.docx",
      type: "cover_letter",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      id: "image",
      originalName: "Portfolio Développeur.png",
      type: "portfolio",
      mimeType: "image/png",
    },
  ];

  test("getFilteredDocuments - Should preserve documents without search", function () {
    expect(
      getFilteredDocuments(
        documents,
        "",
      ),
    ).toBe(documents);
  });

  test("getFilteredDocuments - Should filter by name", function () {
    expect(
      getFilteredDocuments(
        documents,
        "Fabien",
      ),
    ).toEqual([
      documents[0],
    ]);
  });

  test("getFilteredDocuments - Should filter by type", function () {
    expect(
      getFilteredDocuments(
        documents,
        "cover_letter",
      ),
    ).toEqual([
      documents[1],
    ]);
  });

  test("getFilteredDocuments - Should filter by MIME type", function () {
    expect(
      getFilteredDocuments(
        documents,
        "image/png",
      ),
    ).toEqual([
      documents[2],
    ]);
  });

  test("getFilteredDocuments - Should filter by extension", function () {
    expect(
      getFilteredDocuments(
        documents,
        "docx",
      ),
    ).toEqual([
      documents[1],
    ]);
  });

  test("getFilteredDocuments - Should ignore casing and accents", function () {
    expect(
      getFilteredDocuments(
        documents,
        "DEVELOPPEUR",
      ),
    ).toEqual([
      documents[2],
    ]);
  });

  test("getFilteredDocuments - Should return empty array", function () {
    expect(
      getFilteredDocuments(
        documents,
        "inconnu",
      ),
    ).toEqual([]);
  });
});

describe("Document URL cleanup utilities", function () {
  test("revokeUrl - Should revoke blob URL", function () {
    const revokeObjectURL = vi.fn();

    vi.stubGlobal(
      "URL",
      {
        revokeObjectURL,
      },
    );

    revokeUrl(
      "blob:http://localhost/document",
    );

    expect(
      revokeObjectURL,
    ).toHaveBeenCalledWith(
      "blob:http://localhost/document",
    );

    vi.unstubAllGlobals();
  });

  test("revokeUrl - Should ignore regular URL", function () {
    const revokeObjectURL = vi.fn();

    vi.stubGlobal(
      "URL",
      {
        revokeObjectURL,
      },
    );

    revokeUrl(
      "https://example.com/document.pdf",
    );

    expect(
      revokeObjectURL,
    ).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  test("revokeUrl - Should ignore empty URL", function () {
    const revokeObjectURL = vi.fn();

    vi.stubGlobal(
      "URL",
      {
        revokeObjectURL,
      },
    );

    revokeUrl("");

    expect(
      revokeObjectURL,
    ).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  test("revokePreviewUrls - Should revoke blob preview URLs", function () {
    const revokeObjectURL = vi.fn();

    vi.stubGlobal(
      "URL",
      {
        revokeObjectURL,
      },
    );

    revokePreviewUrls({
      first: "blob:http://localhost/first",
      second: "https://example.com/document.pdf",
      third: "blob:http://localhost/third",
    });

    expect(
      revokeObjectURL,
    ).toHaveBeenCalledTimes(2);

    expect(
      revokeObjectURL,
    ).toHaveBeenCalledWith(
      "blob:http://localhost/first",
    );

    expect(
      revokeObjectURL,
    ).toHaveBeenCalledWith(
      "blob:http://localhost/third",
    );

    vi.unstubAllGlobals();
  });
});

describe("Document validation utilities", function () {
  test("validateDocumentFile - Should require file", function () {
    expect(
      validateDocumentFile(null),
    ).toBe(
      "Sélectionnez un fichier.",
    );
  });

  test("validateDocumentFile - Should accept PDF", function () {
    const file = new File(
      ["document"],
      "document.pdf",
      {
        type: "application/pdf",
      },
    );

    expect(
      validateDocumentFile(file),
    ).toBe("");
  });

  test("validateDocumentFile - Should accept DOC", function () {
    const file = new File(
      ["document"],
      "document.doc",
      {
        type: "application/msword",
      },
    );

    expect(
      validateDocumentFile(file),
    ).toBe("");
  });

  test("validateDocumentFile - Should accept DOCX", function () {
    const file = new File(
      ["document"],
      "document.docx",
      {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    );

    expect(
      validateDocumentFile(file),
    ).toBe("");
  });

  test("validateDocumentFile - Should accept PNG", function () {
    const file = new File(
      ["document"],
      "document.png",
      {
        type: "image/png",
      },
    );

    expect(
      validateDocumentFile(file),
    ).toBe("");
  });

  test("validateDocumentFile - Should accept JPEG", function () {
    const file = new File(
      ["document"],
      "document.jpeg",
      {
        type: "image/jpeg",
      },
    );

    expect(
      validateDocumentFile(file),
    ).toBe("");
  });

  test("validateDocumentFile - Should reject extension", function () {
    const file = new File(
      ["document"],
      "document.txt",
      {
        type: "text/plain",
      },
    );

    expect(
      validateDocumentFile(file),
    ).toBe(
      "Format non accepté. Formats autorisés : PDF, DOC, DOCX, PNG, JPG, JPEG.",
    );
  });

  test("validateDocumentFile - Should reject MIME type", function () {
    const file = new File(
      ["document"],
      "document.pdf",
      {
        type: "text/plain",
      },
    );

    expect(
      validateDocumentFile(file),
    ).toBe(
      "Type de fichier non accepté. Vérifiez que le fichier est un PDF, DOC, DOCX, PNG, JPG ou JPEG valide.",
    );
  });

  test("validateDocumentFile - Should reject oversized file", function () {
    const file = {
      name: "document.pdf",
      type: "application/pdf",
      size: 5 * 1024 * 1024 + 1,
    };

    expect(
      validateDocumentFile(file),
    ).toBe(
      "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.",
    );
  });
});

describe("Document upload errors", function () {
  test("getUploadErrorMessage - Should return default error", function () {
    expect(
      getUploadErrorMessage(null),
    ).toBe(
      "Impossible d’ajouter le document.",
    );
  });

  test("getUploadErrorMessage - Should return string error", function () {
    expect(
      getUploadErrorMessage(
        "Erreur personnalisée.",
      ),
    ).toBe(
      "Erreur personnalisée.",
    );
  });

  test("getUploadErrorMessage - Should translate format error", function () {
    expect(
      getUploadErrorMessage({
        message: "Only PDF, DOC, DOCX, PNG, JPG and JPEG files are allowed.",
      }),
    ).toBe(
      "Format non accepté. Formats autorisés : PDF, DOC, DOCX, PNG, JPG, JPEG.",
    );
  });

  test("getUploadErrorMessage - Should translate size error code", function () {
    expect(
      getUploadErrorMessage({
        code: "LIMIT_FILE_SIZE",
      }),
    ).toBe(
      "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.",
    );
  });

  test("getUploadErrorMessage - Should translate file too large error", function () {
    expect(
      getUploadErrorMessage({
        message: "File too large.",
      }),
    ).toBe(
      "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.",
    );
  });

  test("getUploadErrorMessage - Should translate unexpected field error", function () {
    expect(
      getUploadErrorMessage({
        message: "Unexpected field.",
      }),
    ).toBe(
      "Le fichier n’a pas été envoyé correctement. Le champ attendu est “document”.",
    );
  });

  test("getUploadErrorMessage - Should return message property", function () {
    expect(
      getUploadErrorMessage({
        message: "Upload failed.",
      }),
    ).toBe(
      "Upload failed.",
    );
  });

  test("getUploadErrorMessage - Should return error property", function () {
    expect(
      getUploadErrorMessage({
        error: "Upload error.",
      }),
    ).toBe(
      "Upload error.",
    );
  });
});

describe("Document upload fields", function () {
  test("DocumentUploadFields - Should display default document types", function () {
    render(
      <DocumentUploadFields
        documentType="resume"
        fileInputResetKey="file"
        onDocumentTypeChange={vi.fn()}
        onDocumentFileChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "option",
        {
          name: "CV",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "option",
        {
          name: "Lettre de motivation",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole(
        "option",
        {
          name: "Autre document",
        },
      ),
    ).not.toBeInTheDocument();
  });

  test("DocumentUploadFields - Should display other type", function () {
    render(
      <DocumentUploadFields
        documentType="other"
        fileInputResetKey="file"
        includeOtherType={true}
        onDocumentTypeChange={vi.fn()}
        onDocumentFileChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "option",
        {
          name: "Autre document",
        },
      ),
    ).toBeInTheDocument();
  });

  test("DocumentUploadFields - Should display upload help", function () {
    render(
      <DocumentUploadFields
        documentType="resume"
        fileInputResetKey="file"
        showHelp={true}
        onDocumentTypeChange={vi.fn()}
        onDocumentFileChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "Formats acceptés",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "DOC, DOCX, PDF, JPG & JPEG, PNG",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Taille maximale",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("5 Mo"),
    ).toBeInTheDocument();
  });

  test("DocumentUploadFields - Should call type change callback", async function () {
    const user = userEvent.setup();
    const onDocumentTypeChange = vi.fn();

    render(
      <DocumentUploadFields
        documentType="resume"
        fileInputResetKey="file"
        includeOtherType={true}
        onDocumentTypeChange={onDocumentTypeChange}
        onDocumentFileChange={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByRole(
        "combobox",
        {
          name: "Type de document",
        },
      ),
      "cover_letter",
    );

    expect(
      onDocumentTypeChange,
    ).toHaveBeenCalledTimes(1);
  });

  test("DocumentUploadFields - Should call file change callback", function () {
    const onDocumentFileChange = vi.fn();

    render(
      <DocumentUploadFields
        documentType="resume"
        fileInputResetKey="file"
        onDocumentTypeChange={vi.fn()}
        onDocumentFileChange={onDocumentFileChange}
      />,
    );

    const file = new File(
      ["resume"],
      "resume.pdf",
      {
        type: "application/pdf",
      },
    );

    fireEvent.change(
      document.querySelector(
        "input[type=\"file\"]",
      ),
      {
        target: {
          files: [
            file,
          ],
        },
      },
    );

    expect(
      onDocumentFileChange,
    ).toHaveBeenCalledTimes(1);
  });

  test("DocumentUploadFields - Should disable fields", function () {
    render(
      <DocumentUploadFields
        documentType="resume"
        fileInputResetKey="file"
        disabled={true}
        onDocumentTypeChange={vi.fn()}
        onDocumentFileChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "combobox",
        {
          name: "Type de document",
        },
      ),
    ).toBeDisabled();

    expect(
      document.querySelector(
        "input[type=\"file\"]",
      ),
    ).toBeDisabled();
  });
});

describe("Document modal", function () {
  test("DocumentModal - Should display creation form", function () {
    render(
      <DocumentModal
        submitting={false}
        onClose={vi.fn()}
        onSubmitDocument={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Nouveau document",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "button",
        {
          name: "Enregistrer",
        },
      ),
    ).toBeInTheDocument();
  });

  test("DocumentModal - Should submit selected document", async function () {
    const user = userEvent.setup();
    const onSubmitDocument = vi.fn().mockResolvedValue();

    render(
      <DocumentModal
        submitting={false}
        onClose={vi.fn()}
        onSubmitDocument={onSubmitDocument}
      />,
    );

    await user.selectOptions(
      screen.getByRole(
        "combobox",
        {
          name: "Type de document",
        },
      ),
      "cover_letter",
    );

    const file = new File(
      ["cover letter"],
      "cover-letter.pdf",
      {
        type: "application/pdf",
      },
    );

    fireEvent.change(
      document.querySelector(
        "input[type=\"file\"]",
      ),
      {
        target: {
          files: [
            file,
          ],
        },
      },
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Enregistrer",
        },
      ),
    );

    expect(
      onSubmitDocument,
    ).toHaveBeenCalledWith({
      type: "cover_letter",
      file,
    });
  });

  test("DocumentModal - Should submit null file", async function () {
    const user = userEvent.setup();
    const onSubmitDocument = vi.fn().mockResolvedValue();

    render(
      <DocumentModal
        submitting={false}
        onClose={vi.fn()}
        onSubmitDocument={onSubmitDocument}
      />,
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Enregistrer",
        },
      ),
    );

    expect(
      onSubmitDocument,
    ).toHaveBeenCalledWith({
      type: "resume",
      file: null,
    });
  });

  test("DocumentModal - Should call close callback", async function () {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DocumentModal
        submitting={false}
        onClose={onClose}
        onSubmitDocument={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Annuler",
        },
      ),
    );

    expect(
      onClose,
    ).toHaveBeenCalledTimes(1);
  });

  test("DocumentModal - Should prevent closing while submitting", async function () {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DocumentModal
        submitting={true}
        onClose={onClose}
        onSubmitDocument={vi.fn()}
      />,
    );

    const cancelButton = screen.getByRole(
      "button",
      {
        name: "Annuler",
      },
    );

    expect(
      cancelButton,
    ).toBeDisabled();

    await user.click(cancelButton);

    expect(
      onClose,
    ).not.toHaveBeenCalled();
  });

  test("DocumentModal - Should disable submit button", function () {
    render(
      <DocumentModal
        submitting={true}
        onClose={vi.fn()}
        onSubmitDocument={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "button",
        {
          name: "Enregistrer",
        },
      ),
    ).toBeDisabled();
  });
});

describe("Document summary card", function () {
  test("DocumentSummaryCard - Should display document information", function () {
    render(
      <DocumentSummaryCard
        document={{
          ...TEST_DOCUMENT,
          originalName: "CV Frontend.pdf",
          type: "resume",
          mimeType: "application/pdf",
          size: 204800,
          createdAt: "2026-07-12T12:00:00.000Z",
        }}
      />,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "CV Frontend.pdf",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("CV").length,
    ).toBeGreaterThan(0);

    expect(
      screen.getByText("PDF"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("200 Ko"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("12/07/2026"),
    ).toBeInTheDocument();
  });

  test("DocumentSummaryCard - Should support nested document", function () {
    render(
      <DocumentSummaryCard
        document={{
          document: {
            originalName: "Lettre.pdf",
            type: "cover_letter",
            mimeType: "application/pdf",
            size: 1024,
            createdAt: "2026-07-12T12:00:00.000Z",
          },
        }}
      />,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Lettre.pdf",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(
        "Lettre de motivation",
      ).length,
    ).toBeGreaterThan(0);
  });

  test("DocumentSummaryCard - Should display right element", function () {
    render(
      <DocumentSummaryCard
        document={{
          originalName: "CV.pdf",
          type: "resume",
          mimeType: "application/pdf",
        }}
        rightElement={
          <button type="button">
            Détacher
          </button>
        }
      />,
    );

    expect(
      screen.getByRole(
        "button",
        {
          name: "Détacher",
        },
      ),
    ).toBeInTheDocument();
  });

  test("DocumentSummaryCard - Should display metadata fallbacks", function () {
    render(
      <DocumentSummaryCard
        document={{
          originalName: "README",
          type: "other",
        }}
      />,
    );

    expect(
      screen.getByText("FICHIER"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Taille inconnue",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Date inconnue",
      ),
    ).toBeInTheDocument();
  });
});
