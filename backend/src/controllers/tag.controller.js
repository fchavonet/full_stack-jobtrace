import {
  createUserTag,
  deleteUserTag,
  getUserTagById,
  getUserTags,
  updateUserTag
} from "../services/tag.service.js";

async function getTags(request, response, next) {
  try {
    const tags = await getUserTags(request.user.id);

    response.status(200).json({
      success: true,
      message: "Tags retrieved successfully.",
      data: {
        tags
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getTag(request, response, next) {
  try {
    const tag = await getUserTagById(request.user.id, request.params.id);

    if (!tag) {
      return response.status(404).json({
        success: false,
        message: "Tag not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Tag retrieved successfully.",
      data: {
        tag
      }
    });
  } catch (error) {
    next(error);
  }
}

async function createTag(request, response, next) {
  try {
    const result = await createUserTag(request.user.id, request.body.tagData);

    if (result.conflict) {
      return response.status(409).json({
        success: false,
        message: "Tag already exists.",
        errors: []
      });
    }

    response.status(201).json({
      success: true,
      message: "Tag created successfully.",
      data: {
        tag: result.tag
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateTag(request, response, next) {
  try {
    const result = await updateUserTag(
      request.user.id,
      request.params.id,
      request.body.tagData
    );

    if (!result) {
      return response.status(404).json({
        success: false,
        message: "Tag not found.",
        errors: []
      });
    }

    if (result.conflict) {
      return response.status(409).json({
        success: false,
        message: "Tag already exists.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Tag updated successfully.",
      data: {
        tag: result.tag
      }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTag(request, response, next) {
  try {
    const tag = await deleteUserTag(request.user.id, request.params.id);

    if (!tag) {
      return response.status(404).json({
        success: false,
        message: "Tag not found.",
        errors: []
      });
    }

    response.status(200).json({
      success: true,
      message: "Tag deleted successfully.",
      data: {
        tag
      }
    });
  } catch (error) {
    next(error);
  }
}

export {
  createTag,
  deleteTag,
  getTag,
  getTags,
  updateTag
};
