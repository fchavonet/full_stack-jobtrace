import { getUserAchievements } from "../services/achievement.service.js";

async function getAchievements(request, response, next) {
  try {
    const achievements = await getUserAchievements(request.user.id);

    response.status(200).json({
      success: true,
      message: "Achievements retrieved successfully.",
      data: {
        achievements
      }
    });
  } catch (error) {
    next(error);
  }
}

export {
  getAchievements
};
