import { APPLICATION_ALLOWED_TAG_OPTIONS } from "../../constants/application.constants";
import { getListFromResponse } from "../common/apiResponse.utils";
import { normalizeValue } from "../common/string.utils";

export function getApplicationTags(application) {
  if (application && Array.isArray(application.tags)) {
    return application.tags;
  }

  return [];
}

export function getApplicationContacts(application) {
  if (application && Array.isArray(application.contacts)) {
    return application.contacts;
  }

  return [];
}

export function getApplicationDocuments(application) {
  if (application && Array.isArray(application.documents)) {
    return application.documents;
  }

  return [];
}

export function getAllowedTagName(value) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return "";
  }

  const allowedTag = APPLICATION_ALLOWED_TAG_OPTIONS.find(function (tagOption) {
    return normalizeValue(tagOption) === normalizedValue;
  });

  if (allowedTag) {
    return allowedTag;
  }

  return "";
}

export function getTagName(tag) {
  if (typeof tag === "string") {
    return tag;
  }

  if (tag && tag.tag && tag.tag.name) {
    return tag.tag.name;
  }

  if (tag && tag.name) {
    return tag.name;
  }

  return "Tag";
}

export function getTagId(tag) {
  if (tag && tag.tag && tag.tag.id) {
    return tag.tag.id;
  }

  if (tag && tag.tagId) {
    return tag.tagId;
  }

  if (tag && tag.id) {
    return tag.id;
  }

  return "";
}

export function getTagIsAlreadySelected(tags, tagName) {
  return tags.some(function (tag) {
    return normalizeValue(getTagName(tag)) === normalizeValue(tagName);
  });
}

export function getExistingTagId(tags, tagName) {
  const normalizedTagName = normalizeValue(tagName);

  const existingTag = tags.find(function (tag) {
    return normalizeValue(tag.name) === normalizedTagName;
  });

  if (existingTag && existingTag.id) {
    return existingTag.id;
  }

  return "";
}

export function getTagsFromApiResponse(response) {
  return getListFromResponse(response, "tags");
}

export function getContactId(contact) {
  if (contact && contact.contact && contact.contact.id) {
    return contact.contact.id;
  }

  if (contact && contact.contactId) {
    return contact.contactId;
  }

  if (contact && contact.id) {
    return contact.id;
  }

  return "";
}

export function getDocumentId(applicationDocument) {
  if (applicationDocument && applicationDocument.document && applicationDocument.document.id) {
    return applicationDocument.document.id;
  }

  if (applicationDocument && applicationDocument.documentId) {
    return applicationDocument.documentId;
  }

  if (applicationDocument && applicationDocument.id) {
    return applicationDocument.id;
  }

  return "";
}

export function getContactIsLinked(application, contactId) {
  const contacts = getApplicationContacts(application);

  return contacts.some(function (contact) {
    return getContactId(contact) === contactId;
  });
}

export function getDocumentIsLinked(application, documentId) {
  const documents = getApplicationDocuments(application);

  return documents.some(function (applicationDocument) {
    return getDocumentId(applicationDocument) === documentId;
  });
}

export function getAvailableContactOptions(availableContacts, application) {
  return availableContacts.filter(function (contact) {
    return !getContactIsLinked(application, contact.id);
  });
}

export function getAvailableDocumentOptions(availableDocuments, application) {
  return availableDocuments.filter(function (document) {
    return !getDocumentIsLinked(application, document.id);
  });
}
