import prisma from "../../src/config/prisma.js";

const TEST_EMAIL_DOMAIN = "@jobtrace.test";

async function cleanDatabase() {
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: TEST_EMAIL_DOMAIN
      }
    }
  });
}

async function disconnectDatabase() {
  await prisma.$disconnect();
}

export {
  cleanDatabase,
  disconnectDatabase
};
