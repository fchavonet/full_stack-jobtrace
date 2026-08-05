import fs from "fs/promises";

import prisma from "../config/prisma.js";

import { unlockFirstDocumentAchievement } from "./achievement.service.js";

function sanitizeDocument(document) {
  return {
    id: document.id,
    type: document.type,
    originalName: document.originalName,
    storedName: document.storedName,
    mimeType: document.mimeType,
    size: document.size,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  };
}

async function removeStoredFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function removeUserStoredFiles(userId) {
  const documents = await prisma.document.findMany({
    where: {
      userId
    },
    select: {
      path: true
    }
  });

  await Promise.all(
    documents.map(function (document) {
      return removeStoredFile(document.path);
    })
  );
}

async function findUserDocument(userId, documentId) {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      userId
    }
  });
}

async function getUserDocuments(userId) {
  const documents = await prisma.document.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return documents.map(sanitizeDocument);
}

async function getUserDocumentById(userId, documentId) {
  const document = await findUserDocument(userId, documentId);

  if (!document) {
    return null;
  }

  return sanitizeDocument(document);
}

async function getUserDocumentFile(userId, documentId) {
  return findUserDocument(userId, documentId);
}

async function createUserDocument(userId, documentData, file) {
  let document;

  try {
    document = await prisma.document.create({
      data: {
        userId,
        type: documentData.type,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path
      }
    });
  } catch (error) {
    await removeStoredFile(file.path);
    throw error;
  }

  try {
    await unlockFirstDocumentAchievement(userId);
  } catch (error) {
    console.error(
      "Unable to unlock document achievement.",
      error
    );
  }

  return sanitizeDocument(document);
}

async function updateUserDocument(userId, documentId, documentData) {
  const existingDocument = await findUserDocument(userId, documentId);

  if (!existingDocument) {
    return null;
  }

  const document = await prisma.document.update({
    where: {
      id: documentId
    },
    data: {
      type: documentData.type
    }
  });

  return sanitizeDocument(document);
}

async function deleteUserDocument(userId, documentId) {
  const existingDocument = await findUserDocument(userId, documentId);

  if (!existingDocument) {
    return null;
  }

  const document = await prisma.document.delete({
    where: {
      id: documentId
    }
  });

  await removeStoredFile(document.path);

  return sanitizeDocument(document);
}

export {
  createUserDocument,
  deleteUserDocument,
  getUserDocumentById,
  getUserDocumentFile,
  getUserDocuments,
  removeUserStoredFiles,
  updateUserDocument
};
