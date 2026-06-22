import prisma from "../../src/config/prisma.js";

async function cleanDatabase() {
  await prisma.user.deleteMany();
}

async function disconnectDatabase() {
  await prisma.$disconnect();
}

export {
  cleanDatabase,
  disconnectDatabase
};
