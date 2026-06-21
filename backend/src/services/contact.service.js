import prisma from "../config/prisma.js";

import { unlockFirstContactAchievement } from "./achievement.service.js";

function sanitizeContact(contact) {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phoneNumber: contact.phoneNumber,
    company: contact.company,
    notes: contact.notes,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
  };
}

async function findUserContact(userId, contactId) {
  return prisma.contact.findFirst({
    where: {
      id: contactId,
      userId
    }
  });
}

async function getUserContacts(userId) {
  const contacts = await prisma.contact.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return contacts.map(sanitizeContact);
}

async function getUserContactById(userId, contactId) {
  const contact = await findUserContact(userId, contactId);

  if (!contact) {
    return null;
  }

  return sanitizeContact(contact);
}

async function createUserContact(userId, contactData) {
  const contact = await prisma.contact.create({
    data: {
      userId,
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phoneNumber: contactData.phoneNumber,
      company: contactData.company,
      notes: contactData.notes
    }
  });

  await unlockFirstContactAchievement(userId);

  return sanitizeContact(contact);
}

async function updateUserContact(userId, contactId, contactData) {
  const existingContact = await findUserContact(userId, contactId);

  if (!existingContact) {
    return null;
  }

  const contact = await prisma.contact.update({
    where: {
      id: contactId
    },
    data: contactData
  });

  return sanitizeContact(contact);
}

async function deleteUserContact(userId, contactId) {
  const existingContact = await findUserContact(userId, contactId);

  if (!existingContact) {
    return null;
  }

  const contact = await prisma.contact.delete({
    where: {
      id: contactId
    }
  });

  return sanitizeContact(contact);
}

export {
  createUserContact,
  deleteUserContact,
  getUserContactById,
  getUserContacts,
  updateUserContact
};
