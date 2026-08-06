import {
  describe,
  expect,
  test
} from "vitest";

import {
  getPasswordByteLength,
  isPasswordValid,
  isPasswordWithinByteLimit
} from "../src/utils/password.utils";

describe("Password utilities", function () {
  test("Should accept exactly 72 ASCII bytes", function () {
    const password =
      "A1a" + "x".repeat(69);

    expect(
      getPasswordByteLength(password)
    ).toBe(72);

    expect(
      isPasswordWithinByteLimit(password)
    ).toBe(true);
  });

  test("Should reject more than 72 ASCII bytes", function () {
    const password =
      "A1a" + "x".repeat(70);

    expect(
      getPasswordByteLength(password)
    ).toBe(73);

    expect(
      isPasswordWithinByteLimit(password)
    ).toBe(false);

    expect(
      isPasswordValid(password)
    ).toBe(false);
  });

  test("Should count UTF-8 bytes instead of characters", function () {
    const password =
      "é".repeat(36);

    expect(password.length).toBe(36);

    expect(
      getPasswordByteLength(password)
    ).toBe(72);

    expect(
      isPasswordWithinByteLimit(password)
    ).toBe(true);

    expect(
      isPasswordWithinByteLimit(
        password + "a"
      )
    ).toBe(false);
  });

  test("Should validate a compliant password", function () {
    expect(
      isPasswordValid("Password42")
    ).toBe(true);
  });
});
