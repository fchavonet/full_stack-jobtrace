import {
  deleteUserAccount,
  exportUserData,
  getAuthModuleStatus,
  getCurrentUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetUserPassword,
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

async function getMe(request, response, next) {
  try {
    const user = await getCurrentUser(request.user.id);

    response.status(200).json({
      success: true,
      message: "Current user retrieved successfully.",
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(request, response, next) {
  try {
    const result = await requestPasswordReset(request.body);

    response.status(200).json({
      success: true,
      message: "Password reset request processed successfully.",
      data: {
        resetToken: result.resetToken
      }
    });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(request, response, next) {
  try {
    await resetUserPassword(request.body);

    response.status(200).json({
      success: true,
      message: "Password reset successfully.",
      data: {}
    });
  } catch (error) {
    next(error);
  }
}

async function exportAccount(request, response, next) {
  try {
    const exportData = await exportUserData(request.user.id);

    response.status(200).json({
      success: true,
      message: "User data exported successfully.",
      data: exportData
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAccount(request, response, next) {
  try {
    await deleteUserAccount(request.user.id);

    response.status(200).json({
      success: true,
      message: "Account deleted successfully.",
      data: {}
    });
  } catch (error) {
    next(error);
  }
}

export {
  deleteAccount,
  exportAccount,
  forgotPassword,
  getAuthStatus,
  getMe,
  login,
  register,
  resetPassword,
  verifyEmail
};
