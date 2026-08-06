const MAX_PASSWORD_BYTES = 72;

function getPasswordByteLength(password) {
  if (typeof password !== "string") {
    return 0;
  }

  const encoder =
    new globalThis.TextEncoder();

  return encoder.encode(password).length;
}

function isPasswordWithinByteLimit(password) {
  return (
    getPasswordByteLength(password)
    <= MAX_PASSWORD_BYTES
  );
}

function isPasswordValid(password) {
  const hasLength = password.length >= 6;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  return (
    hasLength
    && hasLowercase
    && hasUppercase
    && hasDigit
    && isPasswordWithinByteLimit(password)
  );
}

export {
  MAX_PASSWORD_BYTES,
  getPasswordByteLength,
  isPasswordValid,
  isPasswordWithinByteLimit
};
