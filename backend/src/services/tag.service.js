import prisma from "../config/prisma.js";

import { unlockFirstTagAchievement } from "./achievement.service.js";

function sanitizeTag(tag) {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    color: tag.color,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt
  };
}

async function getUserTags(userId) {
  const tags = await prisma.tag.findMany({
    where: {
      userId
    },
    orderBy: {
      name: "asc"
    }
  });

  return tags.map(sanitizeTag);
}

async function getUserTagById(userId, tagId) {
  const tag = await prisma.tag.findFirst({
    where: {
      id: tagId,
      userId
    }
  });

  if (!tag) {
    return null;
  }

  return sanitizeTag(tag);
}

async function findUserTagBySlug(userId, slug) {
  const tag = await prisma.tag.findFirst({
    where: {
      userId,
      slug
    }
  });

  if (!tag) {
    return null;
  }

  return sanitizeTag(tag);
}

async function createUserTag(userId, tagData) {
  const existingTag = await prisma.tag.findFirst({
    where: {
      userId,
      slug: tagData.slug
    }
  });

  if (existingTag) {
    return {
      conflict: true,
      tag: sanitizeTag(existingTag)
    };
  }

  const tag = await prisma.tag.create({
    data: {
      userId,
      name: tagData.name,
      slug: tagData.slug,
      color: tagData.color
    }
  });

  await unlockFirstTagAchievement(userId);

  return {
    conflict: false,
    tag: sanitizeTag(tag)
  };
}

async function updateUserTag(userId, tagId, tagData) {
  const existingTag = await prisma.tag.findFirst({
    where: {
      id: tagId,
      userId
    }
  });

  if (!existingTag) {
    return null;
  }

  if (tagData.slug) {
    const tagWithSameSlug = await prisma.tag.findFirst({
      where: {
        userId,
        slug: tagData.slug
      }
    });

    if (tagWithSameSlug && tagWithSameSlug.id !== tagId) {
      return {
        conflict: true,
        tag: sanitizeTag(tagWithSameSlug)
      };
    }
  }

  const tag = await prisma.tag.update({
    where: {
      id: tagId
    },
    data: tagData
  });

  return {
    conflict: false,
    tag: sanitizeTag(tag)
  };
}

async function deleteUserTag(userId, tagId) {
  const existingTag = await prisma.tag.findFirst({
    where: {
      id: tagId,
      userId
    }
  });

  if (!existingTag) {
    return null;
  }

  const tag = await prisma.tag.delete({
    where: {
      id: tagId
    }
  });

  return sanitizeTag(tag);
}

export {
  createUserTag,
  deleteUserTag,
  findUserTagBySlug,
  getUserTagById,
  getUserTags,
  updateUserTag
};
