import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import env from "../../src/config/env.js";
import prisma from "../../src/config/prisma.js";

const TEST_AUTH_EMAIL = "dick.grayson@example.com";
const TEST_AUTH_PASSWORD = "Password42";

async function createVerifiedTestUser() {
  const passwordHash = await bcrypt.hash(TEST_AUTH_PASSWORD, 12);

  const user = await prisma.user.create({
    data: {
      email: TEST_AUTH_EMAIL,
      passwordHash,
      emailVerified: true
    }
  });

  return user;
}

function createAuthToken(user) {
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  );

  return token;
}

async function createAuthenticatedTestUser() {
  const user = await createVerifiedTestUser();
  const token = createAuthToken(user);

  return {
    user,
    token
  };
}

export {
  TEST_AUTH_EMAIL,
  TEST_AUTH_PASSWORD,
  createAuthenticatedTestUser,
  createAuthToken,
  createVerifiedTestUser
};
