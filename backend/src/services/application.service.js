import prisma from "../config/prisma.js";

import {
  unlockApplicationOrganizedAchievement,
  unlockFirstApplicationAchievement,
  unlockFiveApplicationsAchievement,
  unlockFollowUpPlannedAchievement
} from "./achievement.service.js";

function sanitizeApplicationTag(applicationTag) {
  return {
    id: applicationTag.tag.id,
    name: applicationTag.tag.name,
    slug: applicationTag.tag.slug,
    color: applicationTag.tag.color,
    linkedAt: applicationTag.createdAt
  };
}

function sanitizeApplicationContact(applicationContact) {
  return {
    id: applicationContact.contact.id,
    firstName: applicationContact.contact.firstName,
    lastName: applicationContact.contact.lastName,
    position: applicationContact.contact.position,
    email: applicationContact.contact.email,
    phoneNumber: applicationContact.contact.phoneNumber,
    company: applicationContact.contact.company,
    linkedinUrl: applicationContact.contact.linkedinUrl,
    notes: applicationContact.contact.notes,
    role: applicationContact.role,
    linkedAt: applicationContact.createdAt
  };
}

function sanitizeApplicationDocument(applicationDocument) {
  return {
    id: applicationDocument.document.id,
    type: applicationDocument.document.type,
    originalName: applicationDocument.document.originalName,
    storedName: applicationDocument.document.storedName,
    mimeType: applicationDocument.document.mimeType,
    size: applicationDocument.document.size,
    linkedAt: applicationDocument.createdAt
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
    locationCode:
      application.locationCode,
    locationLatitude:
      application.locationLatitude,
    locationLongitude:
      application.locationLongitude,
    salary: application.salary,
    link: application.link,
    notes: application.notes,
    sentAt: application.sentAt,
    followUpAt: application.followUpAt,
    interviewAt: application.interviewAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt
  };

  if (application.tags) {
    sanitizedApplication.tags = application.tags.map(sanitizeApplicationTag);
  }

  if (application.contacts) {
    sanitizedApplication.contacts = application.contacts.map(
      sanitizeApplicationContact
    );
  }

  if (application.documents) {
    sanitizedApplication.documents = application.documents.map(
      sanitizeApplicationDocument
    );
  }

  return sanitizedApplication;
}

function sanitizeApplicationHistory(history) {
  return {
    id: history.id,
    action: history.action,
    metadata: history.metadata,
    createdAt: history.createdAt
  };
}

function getApplicationInclude() {
  return {
    tags: {
      include: {
        tag: true
      },
      orderBy: {
        createdAt: "desc"
      }
    },
    contacts: {
      include: {
        contact: true
      },
      orderBy: {
        createdAt: "desc"
      }
    },
    documents: {
      include: {
        document: true
      },
      orderBy: {
        createdAt: "desc"
      }
    }
  };
}

async function createApplicationHistory(applicationId, action, metadata = null) {
  await prisma.applicationHistory.create({
    data: {
      applicationId,
      action,
      metadata
    }
  });
}

async function findUserApplication(userId, applicationId) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    }
  });
}

async function findUserApplicationWithRelations(userId, applicationId) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      userId
    },
    include: getApplicationInclude()
  });
}

async function findUserTag(userId, tagId) {
  return prisma.tag.findFirst({
    where: {
      id: tagId,
      userId
    }
  });
}

async function findUserContact(userId, contactId) {
  return prisma.contact.findFirst({
    where: {
      id: contactId,
      userId
    }
  });
}

async function findUserDocument(userId, documentId) {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      userId
    }
  });
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
  const application = await findUserApplicationWithRelations(
    userId,
    applicationId
  );

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
      locationCode:
        applicationData.locationCode,
      locationLatitude:
        applicationData.locationLatitude,
      locationLongitude:
        applicationData.locationLongitude,
      salary: applicationData.salary,
      link: applicationData.link,
      notes: applicationData.notes,
      sentAt: applicationData.sentAt,
      followUpAt: applicationData.followUpAt,
      interviewAt: applicationData.interviewAt
    },
    include: getApplicationInclude()
  });

  await createApplicationHistory(application.id, "application_created", {
    company: application.company,
    position: application.position,
    status: application.status
  });

  await unlockFirstApplicationAchievement(userId);
  await unlockFiveApplicationsAchievement(userId);

  if (applicationData.followUpAt) {
    await unlockFollowUpPlannedAchievement(userId);
  }

  return sanitizeApplication(application);
}

async function updateUserApplication(userId, applicationId, applicationData) {
  const existingApplication = await findUserApplication(userId, applicationId);

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

  if (
    applicationData.status
    && applicationData.status !== existingApplication.status
  ) {
    await createApplicationHistory(application.id, "application_status_updated", {
      previousStatus: existingApplication.status,
      newStatus: application.status
    });
  } else {
    await createApplicationHistory(application.id, "application_updated", {
      updatedFields: Object.keys(applicationData)
    });
  }

  return sanitizeApplication(application);
}

async function deleteUserApplication(userId, applicationId) {
  const existingApplication = await findUserApplication(userId, applicationId);

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

async function linkTagToUserApplication(userId, applicationId, tagData) {
  const existingApplication = await findUserApplication(userId, applicationId);

  if (!existingApplication) {
    return null;
  }

  const existingTag = await findUserTag(userId, tagData.tagId);

  if (!existingTag) {
    return null;
  }

  const existingLink = await prisma.applicationTag.findUnique({
    where: {
      applicationId_tagId: {
        applicationId,
        tagId: tagData.tagId
      }
    }
  });

  if (!existingLink) {
    await prisma.applicationTag.create({
      data: {
        applicationId,
        tagId: tagData.tagId
      }
    });
  }

  await createApplicationHistory(applicationId, "tag_linked", {
    tagId: tagData.tagId
  });

  await unlockApplicationOrganizedAchievement(userId);

  const application = await findUserApplicationWithRelations(
    userId,
    applicationId
  );

  return sanitizeApplication(application);
}

async function unlinkTagFromUserApplication(userId, applicationId, tagId) {
  const existingApplication = await findUserApplication(userId, applicationId);

  if (!existingApplication) {
    return null;
  }

  const existingTag = await findUserTag(userId, tagId);

  if (!existingTag) {
    return null;
  }

  const existingLink = await prisma.applicationTag.findUnique({
    where: {
      applicationId_tagId: {
        applicationId,
        tagId
      }
    }
  });

  if (!existingLink) {
    return null;
  }

  await prisma.applicationTag.delete({
    where: {
      id: existingLink.id
    }
  });

  await createApplicationHistory(applicationId, "tag_unlinked", {
    tagId
  });

  const application = await findUserApplicationWithRelations(
    userId,
    applicationId
  );

  return sanitizeApplication(application);
}

async function linkContactToUserApplication(userId, applicationId, contactData) {
  const existingApplication = await findUserApplication(userId, applicationId);

  if (!existingApplication) {
    return null;
  }

  const existingContact = await findUserContact(userId, contactData.contactId);

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

  await createApplicationHistory(applicationId, "contact_linked", {
    contactId: contactData.contactId,
    role: contactData.role
  });

  await unlockApplicationOrganizedAchievement(userId);

  const application = await findUserApplicationWithRelations(
    userId,
    applicationId
  );

  return sanitizeApplication(application);
}

async function unlinkContactFromUserApplication(userId, applicationId, contactId) {
  const existingApplication = await findUserApplication(userId, applicationId);

  if (!existingApplication) {
    return null;
  }

  const existingContact = await findUserContact(userId, contactId);

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

  await createApplicationHistory(applicationId, "contact_unlinked", {
    contactId
  });

  const application = await findUserApplicationWithRelations(
    userId,
    applicationId
  );

  return sanitizeApplication(application);
}

async function linkDocumentToUserApplication(userId, applicationId, documentData) {
  const existingApplication = await findUserApplication(userId, applicationId);

  if (!existingApplication) {
    return null;
  }

  const existingDocument = await findUserDocument(
    userId,
    documentData.documentId
  );

  if (!existingDocument) {
    return null;
  }

  const existingLink = await prisma.applicationDocument.findUnique({
    where: {
      applicationId_documentId: {
        applicationId,
        documentId: documentData.documentId
      }
    }
  });

  if (!existingLink) {
    await prisma.applicationDocument.create({
      data: {
        applicationId,
        documentId: documentData.documentId
      }
    });
  }

  await createApplicationHistory(applicationId, "document_linked", {
    documentId: documentData.documentId
  });

  await unlockApplicationOrganizedAchievement(userId);

  const application = await findUserApplicationWithRelations(
    userId,
    applicationId
  );

  return sanitizeApplication(application);
}

async function unlinkDocumentFromUserApplication(
  userId,
  applicationId,
  documentId
) {
  const existingApplication = await findUserApplication(userId, applicationId);

  if (!existingApplication) {
    return null;
  }

  const existingDocument = await findUserDocument(userId, documentId);

  if (!existingDocument) {
    return null;
  }

  const existingLink = await prisma.applicationDocument.findUnique({
    where: {
      applicationId_documentId: {
        applicationId,
        documentId
      }
    }
  });

  if (!existingLink) {
    return null;
  }

  await prisma.applicationDocument.delete({
    where: {
      id: existingLink.id
    }
  });

  await createApplicationHistory(applicationId, "document_unlinked", {
    documentId
  });

  const application = await findUserApplicationWithRelations(
    userId,
    applicationId
  );

  return sanitizeApplication(application);
}

async function getUserApplicationHistory(userId, applicationId) {
  const existingApplication = await findUserApplication(userId, applicationId);

  if (!existingApplication) {
    return null;
  }

  const history = await prisma.applicationHistory.findMany({
    where: {
      applicationId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return history.map(sanitizeApplicationHistory);
}

export {
  createUserApplication,
  deleteUserApplication,
  getUserApplicationById,
  getUserApplicationHistory,
  getUserApplications,
  linkContactToUserApplication,
  linkDocumentToUserApplication,
  linkTagToUserApplication,
  unlinkContactFromUserApplication,
  unlinkDocumentFromUserApplication,
  unlinkTagFromUserApplication,
  updateUserApplication
};
