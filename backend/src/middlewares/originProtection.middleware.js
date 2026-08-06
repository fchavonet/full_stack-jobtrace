import env from "../config/env.js";

const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS"
]);

function getExpectedOrigin() {
  return new URL(env.frontendUrl).origin;
}

function getRequestOrigin(request) {
  const originHeader =
    request.get("origin");

  if (originHeader) {
    return originHeader;
  }

  const refererHeader =
    request.get("referer");

  if (!refererHeader) {
    return null;
  }

  try {
    return new URL(
      refererHeader
    ).origin;
  } catch {
    return "invalid-origin";
  }
}

function originProtectionMiddleware(
  request,
  response,
  next
) {
  if (SAFE_METHODS.has(request.method)) {
    next();
    return;
  }

  const requestOrigin =
    getRequestOrigin(request);

  /*
   * Les clients non-navigateurs comme curl,
   * Supertest ou les services internes peuvent
   * ne pas envoyer Origin ni Referer.
   */
  if (!requestOrigin) {
    next();
    return;
  }

  if (
    requestOrigin
    !== getExpectedOrigin()
  ) {
    response.status(403).json({
      success: false,
      message:
        "Cross-origin state-changing request is not allowed.",
      errors: []
    });

    return;
  }

  next();
}

export default originProtectionMiddleware;
