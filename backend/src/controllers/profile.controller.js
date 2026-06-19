import {
  getUserProfile,
  updateUserProfile
} from "../services/profile.service.js";

async function getProfile(request, response, next) {
  try {
    const profile = await getUserProfile(request.user.id);

    response.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(request, response, next) {
  try {
    const profile = await updateUserProfile(request.user.id, request.body);

    response.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

export {
  getProfile,
  updateProfile
};
