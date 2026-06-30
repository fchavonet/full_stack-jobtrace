import { normalizeValue } from "../common/string.utils";

const maxDocumentFileSize = 5 * 1024 * 1024;

const allowedDocumentExtensions = [
  "pdf",
  "doc",
  "docx",
  "png",
  "jpg",
  "jpeg",
];

const allowedDocumentMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

function fixDocumentNameEncoding(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const hasBrokenEncoding =
    value.includes("Ã") ||
    value.includes("Â") ||
    value.includes("â") ||
    value.includes("Ì") ||
    value.includes("�") ||
    /[\u0080-\u009F]/.test(value);

  if (!hasBrokenEncoding) {
    return value.normalize("NFC");
  }

  try {
    const bytes = Uint8Array.from(value, function (character) {
      return character.charCodeAt(0);
    });

    const decodedValue = new TextDecoder("utf-8").decode(bytes);

    if (!decodedValue.includes("�")) {
      return decodedValue.normalize("NFC");
    }
  } catch {
    return value.normalize("NFC");
  }

  return value.normalize("NFC");
}

function removeControlCharacters(value) {
  let cleanedValue = "";

  for (const character of value) {
    const characterCode = character.charCodeAt(0);
    const isControlCharacter =
      characterCode <= 31 ||
      (characterCode >= 127 && characterCode <= 159);

    if (!isControlCharacter) {
      cleanedValue += character;
    }
  }

  return cleanedValue;
}

export function cleanDocumentName(value) {
  const fixedValue = fixDocumentNameEncoding(value);
  const safeFileName = fixedValue.replace(/[\\/]/g, "-");

  return removeControlCharacters(safeFileName).trim();
}

function getDocumentSource(doc) {
  if (doc && doc.document) {
    return doc.document;
  }

  return doc;
}

export function getDocumentName(doc) {
  const document = getDocumentSource(doc);

  if (!document) {
    return "Document sans nom";
  }

  if (document.originalName) {
    const name = cleanDocumentName(document.originalName);

    if (name) {
      return name;
    }
  }

  if (document.original_name) {
    const name = cleanDocumentName(document.original_name);

    if (name) {
      return name;
    }
  }

  if (document.name) {
    const name = cleanDocumentName(document.name);

    if (name) {
      return name;
    }
  }

  return "Document sans nom";
}

export function getDocumentLabel(doc) {
  return getDocumentName(doc);
}

export function getDocumentMimeType(doc) {
  const document = getDocumentSource(doc);

  if (document && document.mimeType) {
    return document.mimeType;
  }

  if (document && document.mime_type) {
    return document.mime_type;
  }

  return "";
}

export function getDocumentSize(doc) {
  const document = getDocumentSource(doc);

  if (document && typeof document.size === "number") {
    return document.size;
  }

  return 0;
}

export function getDocumentDate(doc) {
  const document = getDocumentSource(doc);

  if (document && document.createdAt) {
    return document.createdAt;
  }

  if (document && document.created_at) {
    return document.created_at;
  }

  return "";
}

export function getDocumentType(doc) {
  const document = getDocumentSource(doc);

  if (typeof document === "string") {
    return document;
  }

  if (document && document.type) {
    return document.type;
  }

  return "document";
}

export function getDocumentTypeLabel(doc) {
  const type = getDocumentType(doc);

  if (type === "resume") {
    return "CV";
  }

  if (type === "cover_letter") {
    return "Lettre de motivation";
  }

  if (type === "portfolio") {
    return "Portfolio";
  }

  if (type === "other") {
    return "Autre document";
  }

  return "Document";
}

export function getDocumentExtension(doc) {
  const name = getDocumentName(doc);
  const parts = name.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
}

export function getDocumentExtensionLabel(doc) {
  const extension = getDocumentExtension(doc);

  if (!extension) {
    return "FICHIER";
  }

  return extension.toUpperCase();
}

export function isImageDocument(doc) {
  const mimeType = getDocumentMimeType(doc);
  const extension = getDocumentExtension(doc);

  if (mimeType.startsWith("image/")) {
    return true;
  }

  if (extension === "png") {
    return true;
  }

  if (extension === "jpg") {
    return true;
  }

  if (extension === "jpeg") {
    return true;
  }

  return false;
}

export function isPdfDocument(doc) {
  const mimeType = getDocumentMimeType(doc);
  const extension = getDocumentExtension(doc);

  if (mimeType === "application/pdf") {
    return true;
  }

  if (extension === "pdf") {
    return true;
  }

  return false;
}

export function canPreviewDocument(doc) {
  if (isImageDocument(doc)) {
    return true;
  }

  if (isPdfDocument(doc)) {
    return true;
  }

  return false;
}

export function formatDocumentFileSize(size) {
  const value = Number(size);

  if (!Number.isFinite(value) || value <= 0) {
    return "Taille inconnue";
  }

  if (value < 1024) {
    return value + " o";
  }

  if (value < 1024 * 1024) {
    return Math.round(value / 1024) + " Ko";
  }

  return (value / 1024 / 1024).toFixed(1) + " Mo";
}

export function formatDocumentDate(value) {
  if (!value) {
    return "Date inconnue";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleDateString("fr-FR");
}

function getDocumentSearchValue(doc) {
  return normalizeValue(
    [
      getDocumentName(doc),
      getDocumentType(doc),
      getDocumentMimeType(doc),
      getDocumentExtension(doc),
    ].join(" "),
  );
}

export function getFilteredDocuments(documents, searchValue) {
  const normalizedSearch = normalizeValue(searchValue);

  if (!normalizedSearch) {
    return documents;
  }

  return documents.filter(function (doc) {
    return getDocumentSearchValue(doc).includes(normalizedSearch);
  });
}

export function revokeUrl(url) {
  if (!url) {
    return;
  }

  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function revokePreviewUrls(previewUrls) {
  Object.values(previewUrls).forEach(function (previewUrl) {
    revokeUrl(previewUrl);
  });
}

function getSelectedFileExtension(file) {
  const parts = file.name.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
}

export function validateDocumentFile(file) {
  if (!file) {
    return "Sélectionnez un fichier.";
  }

  const extension = getSelectedFileExtension(file);

  if (!allowedDocumentExtensions.includes(extension)) {
    return "Format non accepté. Formats autorisés : PDF, DOC, DOCX, PNG, JPG, JPEG.";
  }

  if (!allowedDocumentMimeTypes.includes(file.type)) {
    return "Type de fichier non accepté. Vérifiez que le fichier est un PDF, DOC, DOCX, PNG, JPG ou JPEG valide.";
  }

  if (file.size > maxDocumentFileSize) {
    return "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.";
  }

  return "";
}

export function getUploadErrorMessage(error) {
  if (!error) {
    return "Impossible d’ajouter le document.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.message === "Only PDF, DOC, DOCX, PNG, JPG and JPEG files are allowed.") {
    return "Format non accepté. Formats autorisés : PDF, DOC, DOCX, PNG, JPG, JPEG.";
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.";
  }

  if (error.message && error.message.includes("File too large")) {
    return "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.";
  }

  if (error.message && error.message.includes("Unexpected field")) {
    return "Le fichier n’a pas été envoyé correctement. Le champ attendu est “document”.";
  }

  if (error.message) {
    return error.message;
  }

  if (error.error) {
    return error.error;
  }

  return "Impossible d’ajouter le document.";
}
