import { rateLimit } from "express-rate-limit";

import env from "../config/env.js";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

function shouldSkipRateLimitingInTests() {
  return env.nodeEnv === "test";
}

function sendRateLimitResponse(
  _request,
  response,
  _next,
  options
) {
  response.status(options.statusCode).json({
    success: false,
    message: "Too many requests. Please try again later.",
    errors: []
  });
}

export function createRateLimiter(options) {
  const configuration = {
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: shouldSkipRateLimitingInTests,
    handler: sendRateLimitResponse
  };

  if (options.skipInTest === false) {
    delete configuration.skip;
  }

  if (options.skipSuccessfulRequests === true) {
    configuration.skipSuccessfulRequests = true;
  }

  return rateLimit(configuration);
}

export const loginRateLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 10,
  skipSuccessfulRequests: true
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: ONE_HOUR_MS,
  limit: 5
});

export const passwordRecoveryRateLimiter = createRateLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: 5
});
