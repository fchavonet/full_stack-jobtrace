import {
  createUserDocument,
  deleteUserDocument,
  getUserDocumentById,
  getUserDocumentFile,
  getUserDocuments,
  updateUserDocument
} from "../services/document.service.js";

async function getDocuments(request, response, next) {
  try {
    const documents = await getUserDocuments(request.user.id);

    response.status(200).json({
      success: true,
      message: "Documents retrieved successfully.",
      data: {
        documents
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getDocument(request, response, next) {
  try {
    const document = await getUserDocumentById(
      request.user.id,
      request.params.id
    );

    if (!document) {
      return response.status(404).json({
        success: false,
        message: "Document not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Document retrieved successfully.",
      data: {
        document
      }
    });
  } catch (error) {
    next(error);
  }
}

async function uploadDocument(request, response, next) {
  try {
    const document = await createUserDocument(
      request.user.id,
      request.body.documentData,
      request.file
    );

    response.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: {
        document
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateDocument(request, response, next) {
  try {
    const document = await updateUserDocument(
      request.user.id,
      request.params.id,
      request.body.documentData
    );

    if (!document) {
      return response.status(404).json({
        success: false,
        message: "Document not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Document updated successfully.",
      data: {
        document
      }
    });
  } catch (error) {
    next(error);
  }
}

async function downloadDocument(request, response, next) {
  try {
    const document = await getUserDocumentFile(
      request.user.id,
      request.params.id
    );

    if (!document) {
      return response.status(404).json({
        success: false,
        message: "Document not found.",
        errors: []
      });
    }

    return response.download(document.path, document.originalName);
  } catch (error) {
    next(error);
  }
}

async function deleteDocument(request, response, next) {
  try {
    const document = await deleteUserDocument(
      request.user.id,
      request.params.id
    );

    if (!document) {
      return response.status(404).json({
        success: false,
        message: "Document not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Document deleted successfully.",
      data: {
        document
      }
    });
  } catch (error) {
    next(error);
  }
}

export {
  deleteDocument,
  downloadDocument,
  getDocument,
  getDocuments,
  updateDocument,
  uploadDocument
};
