import env from "./env.js";

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: env.authCookieMaxAge,
    path: "/"
  };
}

function getAuthCookieClearOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/"
  };
}

export {
  getAuthCookieClearOptions,
  getAuthCookieOptions
};
