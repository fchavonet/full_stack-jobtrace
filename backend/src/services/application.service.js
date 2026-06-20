import prisma from "../config/prisma.js";

function sanitizeApplicationContact(applicationContact) {
  return {
    id: applicationContact.contact.id,
    firstName: applicationContact.contact.firstName,
    lastName: applicationContact.contact.lastName,
    email: applicationContact.contact.email,
    phoneNumber: applicationContact.contact.phoneNumber,
    company: applicationContact.contact.company,
    notes: applicationContact.contact.notes,
    role: applicationContact.role,
    linkedAt: applicationContact.createdAt
  };
}

function sanitizeApplication(application) {
  const sanitizedApplication = {
    id: application.id,
    company: application.company,
    position: application.position,
    status: application.status,
    contractType: application.contractType,
    location: application.location,
    salary: application.salary,
    link: application.link,
    notes: application.notes,
    sentAt: application.sentAt,
    followUpAt: application.followUpAt,
    interviewAt: application.interviewAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt
  };

  if (application.contacts) {
    sanitizedApplication.contacts = application.contacts.map(sanitizeApplicationContact);
  }

  return sanitizedApplication;
}

function getApplicationInclude() {
  return {
    contacts: {
      include: {
        contact: true
      },
      orderBy: {
        createdAt: "desc"
      }
    }
  };
}

async function getUserApplications(userId) {
  const applications = await prisma.application.findMany({
    where: {
      userId
    },
    include: getApplicationInclude(),
    orderBy: {
      sentAt: "desc"
    }
  });

  return applications.map(sanitizeApplication);
}

async function getUserApplicationById(userId, applicationId) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    },
    include: getApplicationInclude()
  });

  if (!application) {
    return null;
  }

  return sanitizeApplication(application);
}

async function createUserApplication(userId, applicationData) {
  const application = await prisma.application.create({
    data: {
      userId,
      company: applicationData.company,
      position: applicationData.position,
      status: applicationData.status,
      contractType: applicationData.contractType,
      location: applicationData.location,
      salary: applicationData.salary,
      link: applicationData.link,
      notes: applicationData.notes,
      sentAt: applicationData.sentAt,
      followUpAt: applicationData.followUpAt,
      interviewAt: applicationData.interviewAt
    },
    include: getApplicationInclude()
  });

  return sanitizeApplication(application);
}

async function updateUserApplication(userId, applicationId, applicationData) {
  const existingApplication = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    }
  });

  if (!existingApplication) {
    return null;
  }

  const application = await prisma.application.update({
    where: {
      id: applicationId
    },
    data: applicationData,
    include: getApplicationInclude()
  });

  return sanitizeApplication(application);
}

async function deleteUserApplication(userId, applicationId) {
  const existingApplication = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    }
  });

  if (!existingApplication) {
    return null;
  }

  const application = await prisma.application.delete({
    where: {
      id: applicationId
    },
    include: getApplicationInclude()
  });

  return sanitizeApplication(application);
}

async function linkContactToUserApplication(userId, applicationId, contactData) {
  const existingApplication = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    }
  });

  if (!existingApplication) {
    return null;
  }

  const existingContact = await prisma.contact.findFirst({
    where: {
      id: contactData.contactId,
      userId
    }
  });

  if (!existingContact) {
    return null;
  }

  const existingLink = await prisma.applicationContact.findUnique({
    where: {
      applicationId_contactId: {
        applicationId,
        contactId: contactData.contactId
      }
    }
  });

  if (existingLink) {
    await prisma.applicationContact.update({
      where: {
        id: existingLink.id
      },
      data: {
        role: contactData.role
      }
    });
  } else {
    await prisma.applicationContact.create({
      data: {
        applicationId,
        contactId: contactData.contactId,
        role: contactData.role
      }
    });
  }

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    },
    include: getApplicationInclude()
  });

  return sanitizeApplication(application);
}

async function unlinkContactFromUserApplication(userId, applicationId, contactId) {
  const existingApplication = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    }
  });

  if (!existingApplication) {
    return null;
  }

  const existingContact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      userId
    }
  });

  if (!existingContact) {
    return null;
  }

  const existingLink = await prisma.applicationContact.findUnique({
    where: {
      applicationId_contactId: {
        applicationId,
        contactId
      }
    }
  });

  if (!existingLink) {
    return null;
  }

  await prisma.applicationContact.delete({
    where: {
      id: existingLink.id
    }
  });

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    },
    include: getApplicationInclude()
  });

  return sanitizeApplication(application);
}

export {
  createUserApplication,
  deleteUserApplication,
  getUserApplicationById,
  getUserApplications,
  linkContactToUserApplication,
  unlinkContactFromUserApplication,
  updateUserApplication
};
