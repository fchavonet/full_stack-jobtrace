import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";

let uploadDirectoryName = "documents";

if (process.env.NODE_ENV === "test") {
  uploadDirectoryName = "test-documents";
}

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  uploadDirectoryName
);

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg"
]);

const allowedExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg"
]);

const maxFileSize = 5 * 1024 * 1024;

function ensureUploadDirectory() {
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
      recursive: true
    });
  }
}

async function removeUploadedDocumentFile(file) {
  if (!file || !file.path) {
    return;
  }

  try {
    await fs.promises.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

function isAllowedDocument(file) {
  const extension = getFileExtension(file.originalname);

  if (!allowedExtensions.has(extension)) {
    return false;
  }

  if (!allowedMimeTypes.has(file.mimetype)) {
    return false;
  }

  return true;
}

const documentStorage = multer.diskStorage({
  destination(request, file, callback) {
    ensureUploadDirectory();

    callback(null, uploadDirectory);
  },

  filename(request, file, callback) {
    const extension = getFileExtension(file.originalname);
    const storedName = crypto.randomUUID() + extension;

    callback(null, storedName);
  }
});

function documentFileFilter(request, file, callback) {
  if (!isAllowedDocument(file)) {
    const error = new Error(
      "Only PDF, DOC, DOCX, PNG, JPG and JPEG files are allowed."
    );

    error.statusCode = 415;

    return callback(error);
  }

  return callback(null, true);
}

const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: documentFileFilter
});

export {
  allowedExtensions,
  allowedMimeTypes,
  maxFileSize,
  removeUploadedDocumentFile,
  uploadDirectory,
  uploadDocument
};
