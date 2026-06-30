import { BriefcaseBusiness, FileText, History, LinkIcon, Users, X } from "lucide-react";
import { useState } from "react";

import {
  linkContactToApplication,
  linkDocumentToApplication,
  linkTagToApplication,
  unlinkContactFromApplication,
  unlinkDocumentFromApplication,
  unlinkTagFromApplication,
} from "../../api/relations.api";
import { listContacts } from "../../api/contacts.api";
import { listDocuments } from "../../api/documents.api";
import { createTag, listTags } from "../../api/tags.api";
import {
  APPLICATION_ALLOWED_TAG_OPTIONS,
  APPLICATION_MAX_TAGS,
  APPLICATION_NOTES_MAX_LENGTH,
} from "../../constants/application.constants";
import { useToast } from "../../hooks/useToast";
import {
  getApplicationContractTypeLabel,
  getApplicationStatusBadgeClassName,
  getApplicationStatusLabel,
} from "../../utils/applications/display.utils";
import {
  getErrorMessage,
  getListFromResponse,
  getResponseEntity,
} from "../../utils/common/apiResponse.utils";
import { getFollowUpDelayDays } from "../../utils/applications/dates.utils";
import { getHistoryActionLabel } from "../../utils/applications/history.utils";
import { getContactLabel } from "../../utils/contacts/contact.utils";
import {
  getDocumentLabel,
  getDocumentTypeLabel,
} from "../../utils/documents/document.utils";
import {
  getAllowedTagName,
  getApplicationContacts,
  getApplicationDocuments,
  getApplicationTags,
  getAvailableContactOptions,
  getAvailableDocumentOptions,
  getContactId,
  getDocumentId,
  getExistingTagId,
  getTagId,
  getTagIsAlreadySelected,
  getTagsFromApiResponse,
} from "../../utils/applications/relations.utils";
import {
  formatDate,
  formatDateTime,
  formatFileSize,
  formatSalary,
} from "../../utils/common/format.utils";
import {
  buildAnnouncementUpdatePayload,
  getApplicationFollowUpDateLabel,
  getEditFormFromApplication,
  getEmptyApplicationEditForm,
  getNextApplicationEditForm,
} from "../../utils/applications/detailsForm.utils";
import ApplicationFormDates from "./form-sections/ApplicationFormDates";
import ApplicationFormInformation from "./form-sections/ApplicationFormInformation";
import ApplicationFormNotes from "./form-sections/ApplicationFormNotes";
import ApplicationFormTags from "./form-sections/ApplicationFormTags";

function getModalClassName(isOpen) {
  let className = "modal";

  if (isOpen) {
    className = "modal modal-open";
  }

  return className;
}

function getTabClassName(activeTab, tabName) {
  let className = "tab min-w-0 flex-1 justify-center border-base-300 px-0 font-medium text-base-content/60 hover:text-base-content sm:min-w-32 sm:px-6";

  if (activeTab === tabName) {
    className = "tab tab-active min-w-0 flex-1 justify-center border-base-300 !bg-base-200 px-0 font-semibold text-base-content sm:min-w-32 sm:px-6";
  }

  return className;
}

function isTagAlreadyExistsError(error) {
  const message = getErrorMessage(error, "");

  return message.toLowerCase().includes("tag already exists");
}

async function createOrGetTagId(tagName) {
  const initialResponse = await listTags();
  let availableTags = getTagsFromApiResponse(initialResponse);
  let tagId = getExistingTagId(availableTags, tagName);

  if (tagId) {
    return tagId;
  }

  try {
    const createResponse = await createTag({
      name: tagName,
    });

    const createdTag = getResponseEntity(createResponse, "tag");

    if (createdTag && createdTag.id) {
      return createdTag.id;
    }
  } catch (error) {
    if (!isTagAlreadyExistsError(error)) {
      throw error;
    }

    const refreshedResponse = await listTags();
    availableTags = getTagsFromApiResponse(refreshedResponse);
    tagId = getExistingTagId(availableTags, tagName);

    if (tagId) {
      return tagId;
    }
  }

  throw new Error("Le tag existe peut-être déjà, mais son identifiant est introuvable.");
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-200/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

function ApplicationDetailsModal({
  application,
  history,
  loading,
  updating,
  followUpDelayDays,
  isOpen,
  onClose,
  onUpdateApplication,
  onApplicationChanged,
}) {
  const { showToast } = useToast();
  const normalizedFollowUpDelayDays = getFollowUpDelayDays(followUpDelayDays);

  const [activeTab, setActiveTab] = useState("announcement");
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [editForm, setEditForm] = useState(getEmptyApplicationEditForm);
  const [tagSelectValue, setTagSelectValue] = useState("");
  const [tagsUpdating, setTagsUpdating] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [relationsUpdating, setRelationsUpdating] = useState(false);

  function showAnnouncementTab() {
    setActiveTab("announcement");
  }

  async function showContactsTab() {
    if (isEditingAnnouncement) {
      return;
    }

    setActiveTab("contacts");
    await loadContactOptions();
  }

  async function showDocumentsTab() {
    if (isEditingAnnouncement) {
      return;
    }

    setActiveTab("documents");
    await loadDocumentOptions();
  }

  function showHistoryTab() {
    if (isEditingAnnouncement) {
      return;
    }

    setActiveTab("history");
  }

  function startEditingAnnouncement() {
    setEditForm(getEditFormFromApplication(application));
    setActiveTab("announcement");
    setIsEditingAnnouncement(true);
  }

  function cancelEditingAnnouncement() {
    setEditForm(getEditFormFromApplication(application));
    setIsEditingAnnouncement(false);
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setEditForm(function (currentForm) {
      return getNextApplicationEditForm({
        currentForm,
        fieldName: name,
        value,
        followUpDelayDays: normalizedFollowUpDelayDays,
      });
    });
  }

  async function refreshApplicationData() {
    if (onApplicationChanged) {
      await onApplicationChanged(application.id);
    }
  }

  async function loadContactOptions() {
    if (contactsLoaded || contactsLoading) {
      return;
    }

    setContactsLoading(true);

    try {
      const response = await listContacts();
      const contacts = getListFromResponse(response, "contacts");

      setAvailableContacts(contacts);
      setContactsLoaded(true);
    } catch {
      showToast("Impossible de charger les contacts.", "error");
    } finally {
      setContactsLoading(false);
    }
  }

  async function loadDocumentOptions() {
    if (documentsLoaded || documentsLoading) {
      return;
    }

    setDocumentsLoading(true);

    try {
      const response = await listDocuments();
      const documents = getListFromResponse(response, "documents");

      setAvailableDocuments(documents);
      setDocumentsLoaded(true);
    } catch {
      showToast("Impossible de charger les documents.", "error");
    } finally {
      setDocumentsLoading(false);
    }
  }

  function handleSelectedContactChange(event) {
    setSelectedContactId(event.target.value);
  }

  function handleSelectedDocumentChange(event) {
    setSelectedDocumentId(event.target.value);
  }

  async function handleAnnouncementSave() {
    const company = editForm.company.trim();
    const position = editForm.position.trim();

    if (!company) {
      showToast("L’entreprise est obligatoire.", "error");
      return;
    }

    if (!position) {
      showToast("Le poste est obligatoire.", "error");
      return;
    }

    if (!editForm.sentAt) {
      showToast("La date d’envoi est obligatoire.", "error");
      return;
    }

    if (!onUpdateApplication) {
      return;
    }

    await onUpdateApplication(application.id, buildAnnouncementUpdatePayload(editForm));
    setIsEditingAnnouncement(false);
  }

  async function handleTagSelectChange(event) {
    const selectedTagName = event.target.value;
    const allowedTagName = getAllowedTagName(selectedTagName);
    const tags = getApplicationTags(application);

    setTagSelectValue("");

    if (!allowedTagName) {
      return;
    }

    if (tags.length >= APPLICATION_MAX_TAGS) {
      showToast(
        "Vous pouvez associer jusqu’à " + APPLICATION_MAX_TAGS + " tags par candidature.",
        "warning",
      );
      return;
    }

    if (getTagIsAlreadySelected(tags, allowedTagName)) {
      showToast("Ce tag est déjà associé à la candidature.", "warning");
      return;
    }

    setTagsUpdating(true);

    try {
      const tagId = await createOrGetTagId(allowedTagName);

      await linkTagToApplication(application.id, {
        tagId,
      });

      showToast("Tag ajouté.", "success");
      await refreshApplicationData();
    } catch (error) {
      showToast(getErrorMessage(error, "Impossible d’ajouter le tag."), "error");
    } finally {
      setTagsUpdating(false);
    }
  }

  async function handleAddContact() {
    if (!selectedContactId) {
      showToast("Sélectionnez un contact à associer.", "warning");
      return;
    }

    setRelationsUpdating(true);

    try {
      await linkContactToApplication(application.id, {
        contactId: selectedContactId,
      });

      setSelectedContactId("");
      showToast("Contact associé.", "success");
      await refreshApplicationData();
    } catch (error) {
      showToast(getErrorMessage(error, "Impossible d’associer le contact."), "error");
    } finally {
      setRelationsUpdating(false);
    }
  }

  async function handleRemoveContact(contact) {
    const contactId = getContactId(contact);

    if (!contactId) {
      showToast("Impossible d’identifier ce contact.", "error");
      return;
    }

    setRelationsUpdating(true);

    try {
      await unlinkContactFromApplication(application.id, contactId);

      showToast("Contact retiré.", "success");
      await refreshApplicationData();
    } catch (error) {
      showToast(getErrorMessage(error, "Impossible de retirer le contact."), "error");
    } finally {
      setRelationsUpdating(false);
    }
  }

  async function handleAddDocument() {
    if (!selectedDocumentId) {
      showToast("Sélectionnez un document à associer.", "warning");
      return;
    }

    setRelationsUpdating(true);

    try {
      await linkDocumentToApplication(application.id, {
        documentId: selectedDocumentId,
      });

      setSelectedDocumentId("");
      showToast("Document associé.", "success");
      await refreshApplicationData();
    } catch (error) {
      showToast(getErrorMessage(error, "Impossible d’associer le document."), "error");
    } finally {
      setRelationsUpdating(false);
    }
  }

  async function handleRemoveDocument(applicationDocument) {
    const documentId = getDocumentId(applicationDocument);

    if (!documentId) {
      showToast("Impossible d’identifier ce document.", "error");
      return;
    }

    setRelationsUpdating(true);

    try {
      await unlinkDocumentFromApplication(application.id, documentId);

      showToast("Document retiré.", "success");
      await refreshApplicationData();
    } catch (error) {
      showToast(getErrorMessage(error, "Impossible de retirer le document."), "error");
    } finally {
      setRelationsUpdating(false);
    }
  }

  async function handleRemoveTag(tag) {
    const tagId = getTagId(tag);

    if (!tagId) {
      showToast("Impossible d’identifier ce tag.", "error");
      return;
    }

    setTagsUpdating(true);

    try {
      await unlinkTagFromApplication(application.id, tagId);

      showToast("Tag retiré.", "success");
      await refreshApplicationData();
    } catch (error) {
      showToast(getErrorMessage(error, "Impossible de retirer le tag."), "error");
    } finally {
      setTagsUpdating(false);
    }
  }

  function handleClose() {
    if (updating || tagsUpdating || relationsUpdating) {
      return;
    }

    setIsEditingAnnouncement(false);
    onClose();
  }

  function renderTabs() {
    return (
      <div className="mt-5 -mb-px">
        <div className="tabs tabs-lift w-full" role="tablist">
          <button className={getTabClassName(activeTab, "announcement")} type="button" role="tab" onClick={showAnnouncementTab} aria-label="Annonce">
            <BriefcaseBusiness className="h-6 w-6 sm:hidden" />

            <span className="hidden sm:inline">
              Annonce
            </span>
          </button>

          <button className={getTabClassName(activeTab, "contacts")} type="button" role="tab" onClick={showContactsTab} disabled={isEditingAnnouncement} aria-label="Contacts">
            <Users className="h-6 w-6 sm:hidden" />

            <span className="hidden sm:inline">
              Contacts
            </span>
          </button>

          <button className={getTabClassName(activeTab, "documents")} type="button" role="tab" onClick={showDocumentsTab} disabled={isEditingAnnouncement} aria-label="Documents">
            <FileText className="w-6 h-6 sm:hidden" />

            <span className="hidden sm:inline">
              Documents
            </span>
          </button>

          <button className={getTabClassName(activeTab, "history")} type="button" role="tab" onClick={showHistoryTab} disabled={isEditingAnnouncement} aria-label="Historique">
            <History className="w-6 h-6 sm:hidden" />
            <span className="hidden sm:inline">
              Historique
            </span>
          </button>
        </div>
      </div>
    );
  }

  function renderStatusInfoItem() {
    return (
      <div className="p-4 rounded-xl border border-base-300 bg-base-200/50">
        <p className="text-xs font-medium tracking-wide uppercase text-base-content/50">
          Statut
        </p>

        <span className={getApplicationStatusBadgeClassName(application.status)}>
          {getApplicationStatusLabel(application.status)}
        </span>
      </div>
    );
  }

  function renderAnnouncementReadOnly() {
    return (
      <div className="grid gap-4">
        <section className="p-4 sm:p-6 rounded-2xl bg-base-100 shadow-sm ">
          <h3 className="font-semibold">
            Informations de l’annonce
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoItem label="Entreprise" value={application.company} />
            <InfoItem label="Poste" value={application.position} />
            <InfoItem label="Contrat" value={getApplicationContractTypeLabel(application.contractType)} />
            {renderStatusInfoItem()}
            <InfoItem label="Ville" value={application.location || "Non renseignée"} />
            <InfoItem label="Salaire" value={formatSalary(application.salary)} />
          </div>

          <div className="mt-3">
            {application.link && (
              <div className="p-4 rounded-xl border border-base-300 bg-base-200/50">
                <p className="text-xs font-medium tracking-wide uppercase text-base-content/50">
                  Lien
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <LinkIcon className="w-4 h-4 text-primary" />

                  <a className="link link-primary truncate" href={application.link} target="_blank" rel="noreferrer">
                    Ouvrir l’annonce...
                  </a>
                </div>
              </div>
            )}

            {!application.link && (
              <InfoItem label="Lien" value="Non renseigné" />
            )}
          </div>
        </section>

        <section className="p-4 sm:p-6 rounded-2xl bg-base-100 shadow-sm">
          <h3 className="font-semibold">
            Dates
          </h3>

          <div className="mt-5 grid md:grid-cols-3 gap-4">
            <InfoItem label="Envoi" value={formatDate(application.sentAt)} />
            <InfoItem label="Relance" value={getApplicationFollowUpDateLabel(application)} />
            <InfoItem label="Entretien" value={formatDate(application.interviewAt)} />
          </div>
        </section>

        <section className="p-4 sm:p-6 rounded-2xl bg-base-100 shadow-sm ">
          <ApplicationFormTags selectedTags={getApplicationTags(application)} allowedTagOptions={APPLICATION_ALLOWED_TAG_OPTIONS} maxTagsPerApplication={APPLICATION_MAX_TAGS} tagSelectValue={tagSelectValue} disabled={tagsUpdating} onTagSelectChange={handleTagSelectChange} onRemoveTag={handleRemoveTag} />
        </section>

        <section className="p-4 sm:p-6 rounded-2xl bg-base-100 shadow-sm ">
          <h3 className="font-semibold">
            Notes
          </h3>

          <p className="min-h-32 mt-4 p-4 text-sm whitespace-pre-wrap text-base-content/70 rounded-xl border border-base-300 bg-base-200/50">
            {application.notes || "Aucune note renseignée."}
          </p>
        </section>
      </div>
    );
  }

  function renderAnnouncementEditForm() {
    return (
      <div className="grid gap-4">
        <ApplicationFormInformation form={editForm} onFieldChange={handleFieldChange} />

        <ApplicationFormDates form={editForm} onFieldChange={handleFieldChange} />

        <section className="p-4 sm:p-6 rounded-2xl bg-base-100 shadow-sm">
          <ApplicationFormTags selectedTags={getApplicationTags(application)} allowedTagOptions={APPLICATION_ALLOWED_TAG_OPTIONS} maxTagsPerApplication={APPLICATION_MAX_TAGS} tagSelectValue={tagSelectValue} disabled={tagsUpdating} onTagSelectChange={handleTagSelectChange} onRemoveTag={handleRemoveTag} />
        </section>

        <ApplicationFormNotes form={editForm} applicationNotesMaxLength={APPLICATION_NOTES_MAX_LENGTH} onFieldChange={handleFieldChange} />
      </div>
    );
  }

  function renderContactsTab() {
    const contacts = getApplicationContacts(application);
    const contactOptions = getAvailableContactOptions(availableContacts, application);

    return (
      <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
        <h3 className="font-semibold">
          Contacts associés
        </h3>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <select
            className="select select-bordered w-full"
            value={selectedContactId}
            onChange={handleSelectedContactChange}
            disabled={contactsLoading || relationsUpdating || contactOptions.length === 0}
          >
            <option value="">
              Ajouter un contact existant
            </option>

            {contactOptions.map(function (contact) {
              return (
                <option key={contact.id} value={contact.id}>
                  {getContactLabel(contact)}
                </option>
              );
            })}
          </select>

          <button
            className="btn btn-primary text-white"
            type="button"
            onClick={handleAddContact}
            disabled={contactsLoading || relationsUpdating || !selectedContactId}
          >
            {relationsUpdating && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Ajouter
          </button>
        </div>

        {contactsLoading && (
          <p className="mt-3 text-sm text-base-content/60">
            Chargement des contacts...
          </p>
        )}

        {contacts.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/60">
            Aucun contact associé.
          </p>
        )}

        {contacts.length > 0 && (
          <div className="mt-4 grid gap-4">
            {contacts.map(function (contact) {
              const contactId = getContactId(contact);

              return (
                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4" key={contactId}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {getContactLabel(contact)}
                      </p>

                      <div className="mt-2 grid gap-1 text-sm text-base-content/60">
                        <p>
                          Email : {contact.email || "Non renseigné"}
                        </p>

                        <p>
                          Téléphone : {contact.phoneNumber || "Non renseigné"}
                        </p>

                        <p>
                          Entreprise : {contact.company || "Non renseignée"}
                        </p>

                        <p>
                          Rôle : {contact.role || "Non renseigné"}
                        </p>
                      </div>

                      {contact.notes && (
                        <p className="mt-2 text-sm text-base-content/70">
                          {contact.notes}
                        </p>
                      )}
                    </div>

                    <button
                      className="btn btn-ghost btn-sm text-error"
                      type="button"
                      onClick={function () { handleRemoveContact(contact); }}
                      disabled={relationsUpdating}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderDocumentsTab() {
    const documents = getApplicationDocuments(application);
    const documentOptions = getAvailableDocumentOptions(availableDocuments, application);

    return (
      <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
        <h3 className="font-semibold">
          Documents associés
        </h3>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <select
            className="select select-bordered w-full"
            value={selectedDocumentId}
            onChange={handleSelectedDocumentChange}
            disabled={documentsLoading || relationsUpdating || documentOptions.length === 0}
          >
            <option value="">
              Ajouter un document existant
            </option>

            {documentOptions.map(function (document) {
              return (
                <option key={document.id} value={document.id}>
                  {getDocumentLabel(document)}
                </option>
              );
            })}
          </select>

          <button
            className="btn btn-primary text-white"
            type="button"
            onClick={handleAddDocument}
            disabled={documentsLoading || relationsUpdating || !selectedDocumentId}
          >
            {relationsUpdating && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Ajouter
          </button>
        </div>

        {documentsLoading && (
          <p className="mt-3 text-sm text-base-content/60">
            Chargement des documents...
          </p>
        )}

        {documents.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/60">
            Aucun document associé.
          </p>
        )}

        {documents.length > 0 && (
          <div className="mt-4 grid gap-4">
            {documents.map(function (applicationDocument) {
              const documentId = getDocumentId(applicationDocument);

              return (
                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4" key={documentId}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">
                        {getDocumentLabel(applicationDocument)}
                      </p>

                      <div className="mt-2 grid gap-1 text-sm text-base-content/60">
                        <p>
                          Type : {getDocumentTypeLabel(applicationDocument.type)}
                        </p>

                        <p>
                          Format : {applicationDocument.mimeType || "Non renseigné"}
                        </p>

                        <p>
                          Taille : {formatFileSize(applicationDocument.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn btn-ghost btn-sm text-error"
                      type="button"
                      onClick={function () { handleRemoveDocument(applicationDocument); }}
                      disabled={relationsUpdating}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderHistoryTab() {
    return (
      <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
        <h3 className="font-semibold">
          Historique
        </h3>

        {history.length === 0 && (
          <p className="mt-3 rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/60">
            Aucun historique disponible.
          </p>
        )}

        {history.length > 0 && (
          <div className="mt-4 grid gap-2">
            {history.map(function (historyItem) {
              return (
                <div className="rounded-xl border border-base-300 bg-base-200/50 p-3 text-sm" key={historyItem.id}>
                  <p className="font-medium">
                    {getHistoryActionLabel(historyItem.action)}
                  </p>

                  <p className="text-xs text-base-content/60">
                    {formatDateTime(historyItem.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderFooter() {
    if (isEditingAnnouncement) {
      return (
        <div className="flex flex-col-reverse gap-4 border-t border-base-300 bg-base-100 p-4 sm:flex-row sm:justify-end sm:p-6">
          <button className="btn btn-ghost" type="button" onClick={cancelEditingAnnouncement} disabled={updating}>
            Annuler
          </button>

          <button className="btn btn-primary text-white" type="button" onClick={handleAnnouncementSave} disabled={updating}>
            {updating && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Enregistrer les modifications
          </button>
        </div>
      );
    }

    if (activeTab === "announcement") {
      return (
        <div className="flex flex-col-reverse gap-4 border-t border-base-300 bg-base-100 p-4 sm:flex-row sm:justify-end sm:p-6">
          <button className="btn btn-ghost" type="button" onClick={handleClose} disabled={updating || tagsUpdating}>
            Fermer
          </button>

          <button className="btn btn-primary text-white" type="button" onClick={startEditingAnnouncement} disabled={loading || updating || tagsUpdating}>
            Modifier la candidature
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6 flex sm:flex-row flex-col-reverse sm:justify-end gap-4 border-t border-base-300 bg-base-100">
        <button className="btn btn-ghost" type="button" onClick={handleClose} disabled={updating || tagsUpdating}>
          Fermer
        </button>
      </div>
    );
  }

  function renderActiveTabContent() {
    if (activeTab === "announcement" && isEditingAnnouncement) {
      return renderAnnouncementEditForm();
    }

    if (activeTab === "announcement") {
      return renderAnnouncementReadOnly();
    }

    if (activeTab === "contacts") {
      return renderContactsTab();
    }

    if (activeTab === "documents") {
      return renderDocumentsTab();
    }

    if (activeTab === "history") {
      return renderHistoryTab();
    }

    return null;
  }

  if (!application) {
    return (
      <div className={getModalClassName(isOpen)}>
        <div className="modal-box rounded-2xl">
          <button className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4" type="button" onClick={handleClose} aria-label="Fermer le détail">
            <X className="h-6 w-6" />
          </button>

          <p>
            Aucune candidature sélectionnée.
          </p>
        </div>

        <div className="modal-backdrop" onClick={handleClose} />
      </div>
    );
  }

  return (
    <div className={getModalClassName(isOpen)}>
      <div className="modal-box w -full max-w-5xl max-h-none sm:max-h-[92vh] h-full sm:h-[92vh] p-0 flex  flex-col rounded-none sm:rounded-2xl bg-base-100 shadow-sm  overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 shrink-0 bg-base-100 ">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold">
                  {application.position}
                </h2>

                <p className="truncate text-sm text-base-content/60">
                  {application.company}
                </p>
              </div>

              <button className="btn btn-ghost btn-sm btn-circle" type="button" onClick={handleClose} aria-label="Fermer le détail">
                <X className="w-6 h-6" />
              </button>
            </div>

            {renderTabs()}
          </div>

          <div className="min-h-0 p-4 sm:p-6 flex-1 overflow-y-auto border-t border-base-300 bg-base-200">
            {loading && (
              <div className="mb-4 p-4  flex items-center gap-2 text-sm text-base-content/60 rounded-2xl bg-base-100 shadow-sm">
                <span className="loading loading-sm loading-spinner" />
                Chargement des détails...
              </div>
            )}

            {renderActiveTabContent()}
          </div>

          {renderFooter()}
        </div>
      </div>

      <div className="modal-backdrop" onClick={handleClose} aria-label="Fermer le détail" />
    </div>
  );
}

export default ApplicationDetailsModal;
