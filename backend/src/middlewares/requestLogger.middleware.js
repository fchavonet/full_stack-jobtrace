import { randomUUID } from "node:crypto";

const HEALTH_PATHS = new Set([
  "/api/health",
  "/api/health/db"
]);

function getLogLevel(statusCode) {
  if (statusCode >= 500) {
    return "error";
  }

  if (statusCode >= 400) {
    return "warn";
  }

  return "info";
}

function writeLog(level, entry) {
  const message = JSON.stringify(entry);

  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "warn") {
    console.warn(message);
    return;
  }

  console.info(message);
}

function requestLoggerMiddleware(
  request,
  response,
  next
) {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();
  const requestPath =
    request.originalUrl.split("?")[0];

  request.requestId = requestId;

  response.setHeader(
    "X-Request-Id",
    requestId
  );

  response.on("finish", function () {
    if (
      response.statusCode < 400 &&
      HEALTH_PATHS.has(requestPath)
    ) {
      return;
    }

    const elapsedNanoseconds =
      process.hrtime.bigint() - startedAt;

    const durationMs =
      Number(elapsedNanoseconds) / 1_000_000;

    const level = getLogLevel(
      response.statusCode
    );

    writeLog(level, {
      timestamp: new Date().toISOString(),
      level,
      type: "http_request",
      requestId,
      method: request.method,
      path: requestPath,
      statusCode: response.statusCode,
      durationMs: Number(
        durationMs.toFixed(2)
      )
    });
  });

  next();
}

export default requestLoggerMiddleware;
