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
  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      userId
    }
  });

  if (!contact) {
    return null;
  }

  return sanitizeContact(contact);
}

async function createUserContact(userId, payload) {
  const contact = await prisma.contact.create({
    data: {
      userId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      company: payload.company,
      notes: payload.notes
    }
  });

  await unlockFirstContactAchievement(userId);

  return sanitizeContact(contact);
}

async function updateUserContact(userId, contactId, payload) {
  const existingContact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      userId
    }
  });

  if (!existingContact) {
    return null;
  }

  const contact = await prisma.contact.update({
    where: {
      id: contactId
    },
    data: payload.contactData
  });

  return sanitizeContact(contact);
}

async function deleteUserContact(userId, contactId) {
  const existingContact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      userId
    }
  });

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
