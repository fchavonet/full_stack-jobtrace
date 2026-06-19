import { getAuthModuleStatus } from "../services/auth.service.js";

function getAuthStatus(request, response) {
  const status = getAuthModuleStatus();

  response.status(200).json({
    success: true,
    message: "Authentication module is ready.",
    data: status
  });
}

export { getAuthStatus };
