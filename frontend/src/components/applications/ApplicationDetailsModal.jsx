import { useState } from "react";
import { BriefcaseBusiness, FileText, History, LinkIcon, Users, X } from "lucide-react";

import { listContacts } from "../../api/contacts.api";
import { listDocuments } from "../../api/documents.api";
import { linkContactToApplication, linkDocumentToApplication, linkTagToApplication, unlinkContactFromApplication, unlinkDocumentFromApplication, unlinkTagFromApplication } from "../../api/relations.api";
import { createTag, listTags } from "../../api/tags.api";
import { APPLICATION_ALLOWED_TAG_OPTIONS, APPLICATION_MAX_TAGS, APPLICATION_NOTES_MAX_LENGTH } from "../../constants/application.constants";
import ContactSummaryCard from "../contacts/ContactSummaryCard";
import DocumentSummaryCard from "../documents/DocumentSummaryCard";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";
import { ItemCard, SectionCard } from "../ui/Cards";
import { useToast } from "../../hooks/useToast";
import { getFollowUpDelayDays } from "../../utils/applications/dates.utils";
import { buildAnnouncementUpdatePayload, getApplicationFollowUpDateLabel, getEditFormFromApplication, getEmptyApplicationEditForm, getNextApplicationEditForm } from "../../utils/applications/detailsForm.utils";
import { getApplicationContractTypeLabel, getApplicationStatusIsFinal, getApplicationStatusLabel } from "../../utils/applications/display.utils";
import { getHistoryActionLabel } from "../../utils/applications/history.utils";
import { getApplicationInterviewAt } from "../../utils/applications/table.utils";
import { getAllowedTagName, getApplicationContacts, getApplicationDocuments, getApplicationTags, getAvailableContactOptions, getAvailableDocumentOptions, getContactId, getDocumentId, getExistingTagId, getTagId, getTagIsAlreadySelected, getTagsFromApiResponse } from "../../utils/applications/relations.utils";
import { getErrorMessage, getListFromResponse, getResponseEntity } from "../../utils/common/apiResponse.utils";
import { formatDate, formatDateTime, formatSalary } from "../../utils/common/format.utils";
import { getContactLabel } from "../../utils/contacts/contact.utils";
import { getDocumentLabel } from "../../utils/documents/document.utils";
import ApplicationFormDates from "./form-sections/ApplicationFormDates";
import ApplicationFormInformation from "./form-sections/ApplicationFormInformation";
import ApplicationFormNotes from "./form-sections/ApplicationFormNotes";
import ApplicationFormTags from "./form-sections/ApplicationFormTags";

function getTabClassName(activeTab, tabName) {
  let className = "tab min-w-0 flex-1 px-0 flex flex-row justify-center items-center font-medium text-base-content/60 border-base-300 hover:text-base-content md:min-w-32 md:px-6 cursor-pointer";

  if (activeTab === tabName) {
    className = "tab tab-active min-w-0 flex-1 px-0 flex flex-row justify-center items-center font-semibold text-base-content border-base-300 !bg-base-200 md:min-w-32 md:px-6 cursor-pointer";
  }

  return className;
}

function getApplicationStatusBadgeColor(status) {
  if (status === "sent") {
    return "info";
  }

  if (status === "follow_up") {
    return "warning";
  }

  if (status === "interview") {
    return "primary";
  }

  if (status === "rejected") {
    return "error";
  }

  if (status === "accepted") {
    return "success";
  }

  return "base";
}

function getApplicationInterviewDateLabel(application) {
  if (getApplicationStatusIsFinal(application.status)) {
    return "-";
  }

  return formatDate(getApplicationInterviewAt(application));
}

function getHistoryItemTimestamp(historyItem) {
  if (!historyItem || !historyItem.createdAt) {
    return 0;
  }

  const date = new Date(historyItem.createdAt);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}

function getSortedHistory(history) {
  const sortedHistory = [...history];

  sortedHistory.sort(function (firstHistoryItem, secondHistoryItem) {
    return getHistoryItemTimestamp(secondHistoryItem) - getHistoryItemTimestamp(firstHistoryItem);
  });

  return sortedHistory;
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

function InfoItem({ label, value, children }) {
  return (
    <ItemCard className="border border-base-300 bg-base-200/50">
      <p className="text-xs font-medium tracking-wide uppercase text-base-content/50">
        {label}
      </p>

      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}

      {!children && (
        <p className="mt-2 text-sm font-medium text-base-content">
          {value}
        </p>
      )}
    </ItemCard>
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

  function handleLocationValueChange(value) {
    setEditForm(function (currentForm) {
      return getNextApplicationEditForm({
        currentForm,
        fieldName: "location",
        value,
        followUpDelayDays:
          normalizedFollowUpDelayDays,
      });
    });
  }

  function handleLocationSelect(city) {
    setEditForm(function (currentForm) {
      return {
        ...currentForm,
        location: city.name,
        locationCode: city.code,
        locationLatitude:
          city.latitude,
        locationLongitude:
          city.longitude,
      };
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
      showToast("Vous pouvez associer jusqu’à " + APPLICATION_MAX_TAGS + " tags par candidature.", "warning");
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
      <div className="w-full overflow-x-auto">
        <div className="tabs tabs-lift w-full min-w-full" role="tablist">
          <button className={getTabClassName(activeTab, "announcement")} type="button" role="tab" aria-selected={activeTab === "announcement"} onClick={showAnnouncementTab} aria-label="Annonce">
            <BriefcaseBusiness className="w-6 h-6 md:hidden" />

            <span className="hidden md:inline">
              Annonce
            </span>
          </button>

          <button className={getTabClassName(activeTab, "contacts")} type="button" role="tab" aria-selected={activeTab === "contacts"} onClick={showContactsTab} disabled={isEditingAnnouncement} aria-label="Contacts">
            <Users className="w-6 h-6 md:hidden" />

            <span className="hidden md:inline">
              Contacts
            </span>
          </button>

          <button className={getTabClassName(activeTab, "documents")} type="button" role="tab" aria-selected={activeTab === "documents"} onClick={showDocumentsTab} disabled={isEditingAnnouncement} aria-label="Documents">
            <FileText className="w-6 h-6 md:hidden" />

            <span className="hidden md:inline">
              Documents
            </span>
          </button>

          <button className={getTabClassName(activeTab, "history")} type="button" role="tab" aria-selected={activeTab === "history"} onClick={showHistoryTab} disabled={isEditingAnnouncement} aria-label="Historique">
            <History className="w-6 h-6 md:hidden" />

            <span className="hidden md:inline">
              Historique
            </span>
          </button>
        </div>
      </div>
    );
  }

  function renderCustomHeader() {
    return (
      <div className="bg-base-100 border-b border-base-300">
        <div className="p-4 lg:p-6 pb-4 flex flex-row justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2
              className="text-xl font-semibold text-base-content truncate"
              title={application.position}
            >
              {application.position}
            </h2>

            <p className="mt-1 text-sm text-base-content/60 truncate">
              {application.company}
            </p>
          </div>

          <button
            className="btn btn-ghost btn-sm btn-circle shrink-0 cursor-pointer"
            type="button"
            onClick={handleClose}
            disabled={updating || tagsUpdating || relationsUpdating}
            aria-label="Fermer le détail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 lg:px-6 -mb-px">
          {renderTabs()}
        </div>
      </div>
    );
  }

  function renderStatusInfoItem() {
    return (
      <InfoItem label="Statut">
        <Badge
          label={getApplicationStatusLabel(application.status)}
          color={getApplicationStatusBadgeColor(application.status)}
        />
      </InfoItem>
    );
  }

  function renderAnnouncementReadOnly() {
    return (
      <div className="grid gap-4">
        <SectionCard title="Informations de l’annonce">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem label="Entreprise" value={application.company} />
            <InfoItem label="Poste" value={application.position} />
            <InfoItem label="Contrat" value={getApplicationContractTypeLabel(application.contractType)} />
            {renderStatusInfoItem()}
            <InfoItem label="Ville" value={application.location || "Non renseignée"} />
            <InfoItem label="Salaire" value={formatSalary(application.salary)} />
          </div>

          <div className="mt-4">
            {application.link && (
              <InfoItem label="Lien">
                <div className="flex flex-row justify-start items-center gap-2 text-sm font-medium">
                  <LinkIcon className="w-4 h-4 text-primary" />

                  <a className="link link-primary truncate" href={application.link} target="_blank" rel="noreferrer">
                    Ouvrir l’annonce...
                  </a>
                </div>
              </InfoItem>
            )}

            {!application.link && (
              <InfoItem label="Lien" value="Non renseigné" />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Dates">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoItem label="Envoi" value={formatDate(application.sentAt)} />
            <InfoItem label="Relance" value={getApplicationFollowUpDateLabel(application)} />
            <InfoItem label="Entretien" value={getApplicationInterviewDateLabel(application)} />
          </div>
        </SectionCard>

        <SectionCard>
          <ApplicationFormTags selectedTags={getApplicationTags(application)} allowedTagOptions={APPLICATION_ALLOWED_TAG_OPTIONS} maxTagsPerApplication={APPLICATION_MAX_TAGS} tagSelectValue={tagSelectValue} disabled={tagsUpdating} onTagSelectChange={handleTagSelectChange} onRemoveTag={handleRemoveTag} />
        </SectionCard>

        <SectionCard title="Notes">
          <p className="min-h-32 p-4 text-sm whitespace-pre-wrap text-base-content/70 rounded-xl border border-base-300 bg-base-200/50">
            {application.notes || "Aucune note renseignée."}
          </p>
        </SectionCard>
      </div>
    );
  }

  function renderAnnouncementEditForm() {
    return (
      <div className="grid gap-4">
        <ApplicationFormInformation
                    form={editForm}
                    onFieldChange={
                      handleFieldChange
                    }
                    onLocationValueChange={
                      handleLocationValueChange
                    }
                    onLocationSelect={
                      handleLocationSelect
                    }
                  />

        <ApplicationFormDates form={editForm} onFieldChange={handleFieldChange} />

        <SectionCard>
          <ApplicationFormTags selectedTags={getApplicationTags(application)} allowedTagOptions={APPLICATION_ALLOWED_TAG_OPTIONS} maxTagsPerApplication={APPLICATION_MAX_TAGS} tagSelectValue={tagSelectValue} disabled={tagsUpdating} onTagSelectChange={handleTagSelectChange} onRemoveTag={handleRemoveTag} />
        </SectionCard>

        <ApplicationFormNotes form={editForm} applicationNotesMaxLength={APPLICATION_NOTES_MAX_LENGTH} onFieldChange={handleFieldChange} />
      </div>
    );
  }

  function renderContactsTab() {
    const contacts = getApplicationContacts(application);
    const contactOptions = getAvailableContactOptions(availableContacts, application);

    return (
      <SectionCard title="Contacts associés">
        <div className="flex flex-col md:flex-row gap-4">
          <select className="select select-bordered w-full" aria-label="Sélectionner un contact à associer" value={selectedContactId} onChange={handleSelectedContactChange} disabled={contactsLoading || relationsUpdating || contactOptions.length === 0}>
            <option value="">
              Ajouter un contact existant
            </option>

            {contactOptions.map(function (contact) {
              return (
                <option key={contact.id} value={contact.id}>
                  {getContactLabel(contact, true)}
                </option>
              );
            })}
          </select>

          <button className="btn btn-primary w-full md:w-auto text-primary-content cursor-pointer" type="button" onClick={handleAddContact} disabled={contactsLoading || relationsUpdating || !selectedContactId}>
            {relationsUpdating && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Ajouter
          </button>
        </div>

        {contactsLoading && (
          <p className="mt-4 text-sm text-base-content/60">
            Chargement des contacts...
          </p>
        )}

        {contacts.length === 0 && (
          <p className="mt-4 p-4 text-sm text-base-content/60 rounded-xl border border-dashed border-base-300">
            Aucun contact associé.
          </p>
        )}

        {contacts.length > 0 && (
          <div className="mt-4 grid gap-4">
            {contacts.map(function (contact) {
              const contactId = getContactId(contact);

              return (
                <ContactSummaryCard
                  contact={contact}
                  key={contactId}
                  rightElement={
                    <button className="btn btn-ghost btn-sm text-error cursor-pointer" type="button" onClick={function () { handleRemoveContact(contact); }} disabled={relationsUpdating}>
                      Retirer
                    </button>
                  }
                />
              );
            })}
          </div>
        )}
      </SectionCard>
    );
  }

  function renderDocumentsTab() {
    const documents = getApplicationDocuments(application);
    const documentOptions = getAvailableDocumentOptions(availableDocuments, application);

    return (
      <SectionCard title="Documents associés">
        <div className="flex flex-col md:flex-row gap-4">
          <select className="select select-bordered w-full" aria-label="Sélectionner un document à associer" value={selectedDocumentId} onChange={handleSelectedDocumentChange} disabled={documentsLoading || relationsUpdating || documentOptions.length === 0}>
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

          <button className="btn btn-primary w-full md:w-auto text-primary-content cursor-pointer" type="button" onClick={handleAddDocument} disabled={documentsLoading || relationsUpdating || !selectedDocumentId}>
            {relationsUpdating && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Ajouter
          </button>
        </div>

        {documentsLoading && (
          <p className="mt-4 text-sm text-base-content/60">
            Chargement des documents...
          </p>
        )}

        {documents.length === 0 && (
          <p className="mt-4 p-4 text-sm text-base-content/60 rounded-xl border border-dashed border-base-300">
            Aucun document associé.
          </p>
        )}

        {documents.length > 0 && (
          <div className="mt-4 grid gap-4">
            {documents.map(function (applicationDocument) {
              const documentId = getDocumentId(applicationDocument);

              return (
                <DocumentSummaryCard
                  document={applicationDocument}
                  key={documentId}
                  rightElement={
                    <button className="btn btn-ghost btn-sm text-error cursor-pointer" type="button" onClick={function () { handleRemoveDocument(applicationDocument); }} disabled={relationsUpdating}>
                      Retirer
                    </button>
                  }
                />
              );
            })}
          </div>
        )}
      </SectionCard>
    );
  }

  function renderHistoryTab() {
    const sortedHistory = getSortedHistory(history);

    return (
      <SectionCard title="Historique">
        {sortedHistory.length === 0 && (
          <p className="p-4 text-sm text-base-content/60 rounded-xl border border-dashed border-base-300">
            Aucun historique disponible.
          </p>
        )}

        {sortedHistory.length > 0 && (
          <div className="grid gap-2">
            {sortedHistory.map(function (historyItem) {
              return (
                <ItemCard className="border border-base-300 bg-base-200/50" key={historyItem.id}>
                  <p className="font-medium text-base-content">
                    {getHistoryActionLabel(historyItem.action)}
                  </p>

                  <p className="mt-1 text-xs text-base-content/60">
                    {formatDateTime(historyItem.createdAt)}
                  </p>
                </ItemCard>
              );
            })}
          </div>
        )}
      </SectionCard>
    );
  }

  function renderFooter() {
    if (isEditingAnnouncement) {
      return (
        <>
          <button className="btn btn-ghost w-full lg:w-auto cursor-pointer" type="button" onClick={cancelEditingAnnouncement} disabled={updating}>
            Annuler
          </button>

          <button className="btn btn-primary w-full lg:w-auto text-primary-content cursor-pointer" type="button" onClick={handleAnnouncementSave} disabled={updating}>
            {updating && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Enregistrer les modifications
          </button>
        </>
      );
    }

    if (activeTab === "announcement") {
      return (
        <>
          <button className="btn btn-ghost w-full lg:w-auto cursor-pointer" type="button" onClick={handleClose} disabled={updating || tagsUpdating}>
            Fermer
          </button>

          <button className="btn btn-primary w-full lg:w-auto text-primary-content cursor-pointer" type="button" onClick={startEditingAnnouncement} disabled={loading || updating || tagsUpdating}>
            Modifier la candidature
          </button>
        </>
      );
    }

    return (
      <button className="btn btn-ghost w-full lg:w-auto cursor-pointer" type="button" onClick={handleClose} disabled={updating || tagsUpdating}>
        Fermer
      </button>
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
      <Modal isOpen={isOpen} title="Détail de la candidature" onClose={handleClose} closeDisabled={updating || tagsUpdating || relationsUpdating} closeAriaLabel="Fermer le détail">
        <p className="text-sm text-base-content/70">
          Aucune candidature sélectionnée.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      customHeader={renderCustomHeader()}
      onClose={handleClose}
      closeDisabled={updating || tagsUpdating || relationsUpdating}
      closeAriaLabel="Fermer le détail"
      maxWidthClassName="max-w-5xl"
      className="lg:!h-[92vh]"
      footer={renderFooter()}
    >
      {loading && (
        <div className="mb-4 p-4 flex flex-row justify-start items-center gap-2 text-sm text-base-content/60 rounded-2xl bg-base-100 shadow-sm">
          <span className="loading loading-sm loading-spinner" />
          Chargement des détails...
        </div>
      )}

      {renderActiveTabContent()}
    </Modal>
  );
}

export default ApplicationDetailsModal;
