import {
  getAuthModuleStatus,
  loginUser,
  registerUser,
  verifyUserEmail
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
    const result = await registerUser(request.body);

    response.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: result.user,
        verificationToken: result.verificationToken
      }
    });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(request, response, next) {
  try {
    const user = await verifyUserEmail(request.query.token);

    response.status(200).json({
      success: true,
      message: "Email verified successfully.",
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(request, response, next) {
  try {
    const result = await loginUser(request.body);

    response.status(200).json({
      success: true,
      message: "User logged in successfully.",
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
}

export {
  getAuthStatus,
  register,
  verifyEmail,
  login
};
