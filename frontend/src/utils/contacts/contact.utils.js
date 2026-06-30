import { getResponseEntity } from "../common/apiResponse.utils";
import { normalizeValue } from "../common/string.utils";

function getContactValue(contact, fieldName) {
  if (contact && contact[fieldName]) {
    return contact[fieldName];
  }

  if (contact && contact.contact && contact.contact[fieldName]) {
    return contact.contact[fieldName];
  }

  return "";
}

export function getContactFromResponse(response) {
  return getResponseEntity(response, "contact");
}

export function getContactModalKey(contact) {
  if (contact) {
    return contact.id;
  }

  return "new-contact";
}

export function getContactName(contact) {
  const parts = [];
  const firstName = getContactValue(contact, "firstName");
  const lastName = getContactValue(contact, "lastName");

  if (firstName) {
    parts.push(firstName);
  }

  if (lastName) {
    parts.push(lastName);
  }

  const name = parts.join(" ").trim();

  if (name) {
    return name;
  }

  return "Contact sans nom";
}

export function getContactLabel(contact, includeCompany = false) {
  let label = getContactName(contact);
  const email = getContactValue(contact, "email");
  const company = getContactValue(contact, "company");

  if (label === "Contact sans nom" && email) {
    label = email;
  }

  if (includeCompany && company) {
    label = label + " - " + company;
  }

  return label;
}

function getContactSearchValue(contact) {
  return normalizeValue(
    [
      getContactValue(contact, "firstName"),
      getContactValue(contact, "lastName"),
      getContactValue(contact, "email"),
      getContactValue(contact, "phoneNumber"),
      getContactValue(contact, "company"),
      getContactValue(contact, "notes"),
    ].join(" "),
  );
}

export function getFilteredContacts(contacts, searchValue) {
  const normalizedSearch = normalizeValue(searchValue);

  if (!normalizedSearch) {
    return contacts;
  }

  return contacts.filter(function (contact) {
    return getContactSearchValue(contact).includes(normalizedSearch);
  });
}
