export function getContactLabel(contact, includeCompany = false) {
  const parts = [];

  if (contact.firstName) {
    parts.push(contact.firstName);
  }

  if (contact.lastName) {
    parts.push(contact.lastName);
  }

  let label = parts.join(" ").trim();

  if (!label && contact.email) {
    label = contact.email;
  }

  if (!label) {
    label = "Contact sans nom";
  }

  if (includeCompany && contact.company) {
    label = label + " - " + contact.company;
  }

  return label;
}

export function getDocumentLabel(document) {
  if (document.originalName) {
    return document.originalName;
  }

  if (document.name) {
    return document.name;
  }

  if (document.storedName) {
    return document.storedName;
  }

  return "Document sans nom";
}

export function getDocumentTypeLabel(type) {
  if (type === "resume") {
    return "CV";
  }

  if (type === "cover_letter") {
    return "Lettre de motivation";
  }

  if (type === "portfolio") {
    return "Portfolio";
  }

  if (type === "other") {
    return "Autre";
  }

  return "Document";
}

export function getHistoryActionLabel(action) {
  if (action === "application_created") {
    return "Candidature créée";
  }

  if (action === "application_updated") {
    return "Candidature modifiée";
  }

  if (action === "application_status_updated") {
    return "Statut modifié";
  }

  if (action === "tag_linked") {
    return "Tag ajouté";
  }

  if (action === "tag_unlinked") {
    return "Tag retiré";
  }

  if (action === "contact_linked") {
    return "Contact ajouté";
  }

  if (action === "contact_unlinked") {
    return "Contact retiré";
  }

  if (action === "document_linked") {
    return "Document ajouté";
  }

  if (action === "document_unlinked") {
    return "Document retiré";
  }

  return "Action enregistrée";
}
