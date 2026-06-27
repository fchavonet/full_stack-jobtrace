import {
  linkContactToApplication,
  linkDocumentToApplication,
  linkTagToApplication,
} from "../../api/relations.api";
import { createApplication } from "../../api/applications.api";
import { createContact } from "../../api/contacts.api";
import { uploadDocument } from "../../api/documents.api";
import { createTag, listTags } from "../../api/tags.api";
import {
  getEntityId,
  getErrorMessage,
  getResponseEntity,
} from "../common/apiResponse.utils";
import {
  buildApplicationPayload,
  buildContactPayload,
  buildContactRelationPayload,
  hasNewContactValue,
} from "./payload.utils";
import {
  getExistingTagId,
  getTagsFromApiResponse,
} from "./relations.utils";

function isTagAlreadyExistsError(error) {
  const message = getErrorMessage(error, "");

  return message.toLowerCase().includes("tag already exists");
}

async function createOrGetTagIds(selectedTagNames) {
  const tagIds = [];

  if (selectedTagNames.length === 0) {
    return tagIds;
  }

  const initialResponse = await listTags();
  let availableTags = getTagsFromApiResponse(initialResponse);

  for (const selectedTagName of selectedTagNames) {
    let tagId = getExistingTagId(availableTags, selectedTagName);

    if (!tagId) {
      try {
        const createResponse = await createTag({
          name: selectedTagName,
        });

        const createdTag = getResponseEntity(createResponse, "tag");

        if (createdTag && createdTag.id) {
          availableTags.push(createdTag);
          tagId = createdTag.id;
        }
      } catch (error) {
        if (isTagAlreadyExistsError(error)) {
          const refreshedResponse = await listTags();

          availableTags = getTagsFromApiResponse(refreshedResponse);
          tagId = getExistingTagId(availableTags, selectedTagName);
        } else {
          throw error;
        }
      }
    }

    if (!tagId) {
      throw new Error("Le tag " + selectedTagName + " existe peut-être déjà, mais son identifiant est introuvable.");
    }

    tagIds.push(tagId);
  }

  return tagIds;
}

async function createOrGetContactId({
  contactMode,
  selectedContactId,
  contactForm,
  applicationCompany,
}) {
  if (contactMode === "existing") {
    return selectedContactId;
  }

  if (contactMode !== "new") {
    return "";
  }

  if (!hasNewContactValue(contactForm)) {
    return "";
  }

  const payload = buildContactPayload(contactForm, applicationCompany);
  const response = await createContact(payload);
  const contactId = getEntityId(response, "contact");

  if (contactId) {
    return contactId;
  }

  throw new Error("Le contact a été créé, mais son identifiant est introuvable.");
}

async function uploadOrGetDocumentId({
  documentMode,
  selectedDocumentId,
  documentForm,
}) {
  if (documentMode === "existing") {
    return selectedDocumentId;
  }

  if (documentMode !== "upload") {
    return "";
  }

  if (!documentForm.file) {
    return "";
  }

  const formData = new FormData();

  formData.append("type", documentForm.type);
  formData.append("document", documentForm.file);

  const response = await uploadDocument(formData);
  const documentId = getEntityId(response, "document");

  if (documentId) {
    return documentId;
  }

  throw new Error("Le document a été ajouté, mais son identifiant est introuvable.");
}

async function linkSelectedTags(applicationId, selectedTagNames) {
  const tagIds = await createOrGetTagIds(selectedTagNames);

  for (const tagId of tagIds) {
    await linkTagToApplication(applicationId, {
      tagId,
    });
  }
}

async function linkSelectedContact(applicationId, contactData) {
  const contactId = await createOrGetContactId(contactData);

  if (!contactId) {
    return;
  }

  const payload = buildContactRelationPayload(contactId);

  await linkContactToApplication(applicationId, payload);
}

async function linkSelectedDocument(applicationId, documentData) {
  const documentId = await uploadOrGetDocumentId(documentData);

  if (!documentId) {
    return;
  }

  await linkDocumentToApplication(applicationId, {
    documentId,
  });
}

export async function createApplicationWithRelations({
  form,
  selectedTagNames,
  contactMode,
  selectedContactId,
  contactForm,
  documentMode,
  selectedDocumentId,
  documentForm,
}) {
  const applicationPayload = buildApplicationPayload(form);
  const applicationResponse = await createApplication(applicationPayload);
  const applicationId = getEntityId(applicationResponse, "application");

  if (!applicationId) {
    throw new Error("La candidature a été créée, mais son identifiant est introuvable.");
  }

  await linkSelectedTags(applicationId, selectedTagNames);

  await linkSelectedContact(applicationId, {
    contactMode,
    selectedContactId,
    contactForm,
    applicationCompany: form.company,
  });

  await linkSelectedDocument(applicationId, {
    documentMode,
    selectedDocumentId,
    documentForm,
  });

  return applicationId;
}
