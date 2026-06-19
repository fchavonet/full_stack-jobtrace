import {
  getAuthModuleStatus,
  registerUser
} from "../services/auth.service.js";

function getAuthStatus(request, response) {
  const status = getAuthModuleStatus();

  response.status(200).json({
    success: true,
    message: "Authentication module is ready.",
    data: status
  });
}

async function register(request, response, next) {
  try {
    const user = await registerUser(request.body);

    response.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

export {
  getAuthStatus,
  register
};
