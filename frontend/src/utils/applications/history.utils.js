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
