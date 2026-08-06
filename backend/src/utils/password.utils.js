import { Buffer } from "node:buffer";

const MAX_PASSWORD_BYTES = 72;

function getPasswordByteLength(password) {
  if (typeof password !== "string") {
    return 0;
  }

  return Buffer.byteLength(
    password,
    "utf8"
  );
}

function isPasswordWithinByteLimit(password) {
  return (
    getPasswordByteLength(password)
    <= MAX_PASSWORD_BYTES
  );
}

export {
  MAX_PASSWORD_BYTES,
  getPasswordByteLength,
  isPasswordWithinByteLimit
};
