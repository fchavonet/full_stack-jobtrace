import {
  createUserApplication,
  deleteUserApplication,
  getUserApplicationById,
  getUserApplications,
  linkContactToUserApplication,
  linkTagToUserApplication,
  unlinkContactFromUserApplication,
  unlinkTagFromUserApplication,
  updateUserApplication
} from "../services/application.service.js";

async function getApplications(request, response, next) {
  try {
    const applications = await getUserApplications(request.user.id);

    response.status(200).json({
      success: true,
      message: "Applications retrieved successfully.",
      data: {
        applications
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getApplication(request, response, next) {
  try {
    const application = await getUserApplicationById(
      request.user.id,
      request.params.id
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Application retrieved successfully.",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

async function createApplication(request, response, next) {
  try {
    const application = await createUserApplication(
      request.user.id,
      request.body.applicationData
    );

    response.status(201).json({
      success: true,
      message: "Application created successfully.",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateApplication(request, response, next) {
  try {
    const application = await updateUserApplication(
      request.user.id,
      request.params.id,
      request.body.applicationData
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Application updated successfully.",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteApplication(request, response, next) {
  try {
    const application = await deleteUserApplication(
      request.user.id,
      request.params.id
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Application deleted successfully.",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

async function linkContactToApplication(request, response, next) {
  try {
    const application = await linkContactToUserApplication(
      request.user.id,
      request.params.id,
      request.body.contactData
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application or contact not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Contact linked to application successfully.",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

async function unlinkContactFromApplication(request, response, next) {
  try {
    const application = await unlinkContactFromUserApplication(
      request.user.id,
      request.params.id,
      request.params.contactId
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application contact link not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Contact unlinked from application successfully.",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

async function linkTagToApplication(request, response, next) {
  try {
    const application = await linkTagToUserApplication(
      request.user.id,
      request.params.id,
      request.body.tagData
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application or tag not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Tag linked to application successfully.",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

async function unlinkTagFromApplication(request, response, next) {
  try {
    const application = await unlinkTagFromUserApplication(
      request.user.id,
      request.params.id,
      request.params.tagId
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application tag link not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Tag unlinked from application successfully.",
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
}

export {
  createApplication,
  deleteApplication,
  getApplication,
  getApplications,
  linkContactToApplication,
  unlinkContactFromApplication,
  updateApplication,
  linkTagToApplication,
  unlinkTagFromApplication
};
