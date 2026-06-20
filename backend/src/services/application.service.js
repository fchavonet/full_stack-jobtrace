import prisma from "../config/prisma.js";

function sanitizeApplication(application) {
  return {
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
}

async function getUserApplications(userId) {
  const applications = await prisma.application.findMany({
    where: {
      userId
    },
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
    }
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
    }
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
    data: applicationData
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
    }
  });

  return sanitizeApplication(application);
}

export {
  createUserApplication,
  deleteUserApplication,
  getUserApplicationById,
  getUserApplications,
  updateUserApplication
};
