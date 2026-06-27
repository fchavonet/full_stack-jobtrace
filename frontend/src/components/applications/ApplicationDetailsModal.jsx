import { BriefcaseBusiness, FileText, History, LinkIcon, Users, X } from "lucide-react";
import { useState } from "react";

import {
  linkContactToApplication,
  linkDocumentToApplication,
  linkTagToApplication,
  unlinkContactFromApplication,
  unlinkDocumentFromApplication,
  unlinkTagFromApplication,
} from "../../api/applicationRelations.api";
import { listContacts } from "../../api/contacts.api";
import { listDocuments } from "../../api/documents.api";
import { createTag, listTags } from "../../api/tags.api";
import {
  APPLICATION_CONTRACT_TYPE_OPTIONS,
  APPLICATION_STATUS_OPTIONS,
} from "../../constants/application.constants";
import { useToast } from "../../hooks/useToast";
import ApplicationModalTags from "./ApplicationModalTags";

const maxTagsPerApplication = 3;
const applicationNotesMaxLength = 500;
const defaultFollowUpDelayDays = 15;

const allowedTagOptions = [
  "Prioritaire",
  "À relancer",
  "Entretien",
  "Candidature spontanée",
  "Réseau",
  "Entreprise cible",
  "Remote",
  "À préparer",
  "À suivre",
  "Urgent",
];

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

function getOptionLabel(options, value, fallback) {
  const option = options.find(function (item) {
    return item.value === value;
  });

  if (option) {
    return option.label;
  }

  return fallback;
}

function getStatusBadgeClassName(status) {
  let className = "badge badge-outline";

  if (status === "sent") {
    className = "badge badge-info";
  }

  if (status === "follow_up") {
    className = "badge badge-warning";
  }

  if (status === "interview") {
    className = "badge badge-primary text-white";
  }

  if (status === "rejected") {
    className = "badge badge-error";
  }

  if (status === "accepted") {
    className = "badge badge-success";
  }

  return className;
}

function getDocumentTypeLabel(type) {
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

function getHistoryActionLabel(action) {
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

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function getFollowUpDelayDays(value) {
  const parsedDelay = Number(value);

  if (Number.isFinite(parsedDelay) && parsedDelay > 0) {
    return parsedDelay;
  }

  return defaultFollowUpDelayDays;
}

function getFollowUpInputValue(sentAt, followUpDelayDays) {
  const date = new Date(sentAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + followUpDelayDays);

  return date.toISOString().slice(0, 10);
}

function formatSalary(value) {
  if (value === null || value === undefined || value === "") {
    return "Non renseigné";
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "Non renseigné";
  }

  return new Intl.NumberFormat("fr-FR").format(numberValue) + " €";
}

function formatFileSize(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return "Taille inconnue";
  }

  if (numberValue < 1024 * 1024) {
    return Math.round(numberValue / 1024) + " Ko";
  }

  return (numberValue / 1024 / 1024).toFixed(1) + " Mo";
}

function getApplicationTags(application) {
  if (application && Array.isArray(application.tags)) {
    return application.tags;
  }

  return [];
}

function getApplicationContacts(application) {
  if (application && Array.isArray(application.contacts)) {
    return application.contacts;
  }

  return [];
}

function getApplicationDocuments(application) {
  if (application && Array.isArray(application.documents)) {
    return application.documents;
  }

  return [];
}

function getContactLabel(contact) {
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

  return label;
}

function getDocumentLabel(applicationDocument) {
  if (applicationDocument.originalName) {
    return applicationDocument.originalName;
  }

  if (applicationDocument.name) {
    return applicationDocument.name;
  }

  if (applicationDocument.storedName) {
    return applicationDocument.storedName;
  }

  return "Document sans nom";
}

function normalizeValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getAllowedTagName(value) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return "";
  }

  const allowedTag = allowedTagOptions.find(function (tagOption) {
    return normalizeValue(tagOption) === normalizedValue;
  });

  if (allowedTag) {
    return allowedTag;
  }

  return "";
}

function getTagName(tag) {
  if (tag && tag.tag && tag.tag.name) {
    return tag.tag.name;
  }

  if (tag && tag.name) {
    return tag.name;
  }

  return "Tag";
}

function getTagId(tag) {
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

function getTagIsAlreadySelected(tags, tagName) {
  return tags.some(function (tag) {
    return normalizeValue(getTagName(tag)) === normalizeValue(tagName);
  });
}

function getExistingTagId(tags, tagName) {
  const normalizedTagName = normalizeValue(tagName);

  const existingTag = tags.find(function (tag) {
    return normalizeValue(tag.name) === normalizedTagName;
  });

  if (existingTag && existingTag.id) {
    return existingTag.id;
  }

  return "";
}

function getResponseEntity(response, entityName) {
  if (!response) {
    return null;
  }

  if (response.id) {
    return response;
  }

  if (response.data && response.data.id) {
    return response.data;
  }

  if (response.data && response.data[entityName]) {
    return response.data[entityName];
  }

  if (response[entityName]) {
    return response[entityName];
  }

  return null;
}

function getListFromResponse(response, listName) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response[listName])) {
    return response[listName];
  }

  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && response.data && Array.isArray(response.data[listName])) {
    return response.data[listName];
  }

  return [];
}

function getTagsFromApiResponse(response) {
  return getListFromResponse(response, "tags");
}

function getErrorMessage(error, fallback) {
  if (error && error.message) {
    return error.message;
  }

  if (error && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors.join(" ");
  }

  if (error && error.error) {
    return error.error;
  }

  return fallback;
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

function getEditFormFromApplication(application) {
  let salary = "";

  if (application.salary !== null && application.salary !== undefined) {
    salary = String(application.salary);
  }

  const interviewAt = getDateInputValue(application.interviewAt);
  let followUpAt = getDateInputValue(application.followUpAt);

  if (interviewAt) {
    followUpAt = "";
  }

  return {
    company: application.company || "",
    position: application.position || "",
    status: application.status || "sent",
    contractType: application.contractType || "",
    location: application.location || "",
    salary,
    link: application.link || "",
    sentAt: getDateInputValue(application.sentAt),
    followUpAt,
    interviewAt,
    notes: application.notes || "",
  };
}

function getNullableDatePayloadValue(value) {
  if (value) {
    return value;
  }

  return null;
}

function getStatusIsFinal(status) {
  if (status === "accepted") {
    return true;
  }

  if (status === "rejected") {
    return true;
  }

  return false;
}

function buildAnnouncementUpdatePayload(form) {
  let followUpAt = form.followUpAt;

  if (form.interviewAt) {
    followUpAt = "";
  }

  if (getStatusIsFinal(form.status)) {
    followUpAt = "";
  }

  return {
    company: form.company,
    position: form.position,
    status: form.status,
    contractType: form.contractType,
    location: form.location,
    salary: form.salary,
    link: form.link,
    sentAt: form.sentAt,
    followUpAt: getNullableDatePayloadValue(followUpAt),
    interviewAt: getNullableDatePayloadValue(form.interviewAt),
    notes: form.notes,
  };
}

function getApplicationFollowUpDateLabel(application) {
  if (application && application.interviewAt) {
    return "—";
  }

  return formatDate(application.followUpAt);
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
  const [editForm, setEditForm] = useState({
    company: "",
    position: "",
    status: "sent",
    contractType: "",
    location: "",
    salary: "",
    link: "",
    sentAt: "",
    followUpAt: "",
    interviewAt: "",
    notes: "",
  });
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
      const nextForm = {
        ...currentForm,
        [name]: value,
      };

      if (name === "interviewAt" && value) {
        nextForm.followUpAt = "";
        nextForm.status = "interview";
      }

      if (name === "interviewAt" && !value) {
        nextForm.followUpAt = getFollowUpInputValue(
          nextForm.sentAt,
          normalizedFollowUpDelayDays,
        );

        if (currentForm.status === "interview") {
          nextForm.status = "follow_up";
        }
      }

      if (name === "sentAt" && !nextForm.interviewAt && !getStatusIsFinal(nextForm.status)) {
        nextForm.followUpAt = getFollowUpInputValue(
          value,
          normalizedFollowUpDelayDays,
        );
      }

      if (name === "status" && value === "interview") {
        nextForm.followUpAt = "";
      }

      if (name === "status" && getStatusIsFinal(value)) {
        nextForm.followUpAt = "";
      }

      if (name === "status" && !getStatusIsFinal(value) && value !== "interview" && !nextForm.interviewAt) {
        nextForm.followUpAt = getFollowUpInputValue(
          nextForm.sentAt,
          normalizedFollowUpDelayDays,
        );
      }

      return nextForm;
    });
  }

  async function refreshApplicationData() {
    if (onApplicationChanged) {
      await onApplicationChanged(application.id);
    }
  }

  function getContactId(contact) {
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

  function getDocumentId(applicationDocument) {
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

  function getContactIsLinked(contactId) {
    const contacts = getApplicationContacts(application);

    return contacts.some(function (contact) {
      return getContactId(contact) === contactId;
    });
  }

  function getDocumentIsLinked(documentId) {
    const documents = getApplicationDocuments(application);

    return documents.some(function (applicationDocument) {
      return getDocumentId(applicationDocument) === documentId;
    });
  }

  function getAvailableContactOptions() {
    return availableContacts.filter(function (contact) {
      return !getContactIsLinked(contact.id);
    });
  }

  function getAvailableDocumentOptions() {
    return availableDocuments.filter(function (document) {
      return !getDocumentIsLinked(document.id);
    });
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

    if (tags.length >= maxTagsPerApplication) {
      showToast("Vous pouvez associer jusqu’à 3 tags par candidature.", "warning");
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
          <button
            className={getTabClassName(activeTab, "announcement")}
            type="button"
            role="tab"
            onClick={showAnnouncementTab}
            aria-label="Annonce"
          >
            <BriefcaseBusiness className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:inline">
              Annonce
            </span>
          </button>

          <button
            className={getTabClassName(activeTab, "contacts")}
            type="button"
            role="tab"
            onClick={showContactsTab}
            disabled={isEditingAnnouncement}
            aria-label="Contacts"
          >
            <Users className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:inline">
              Contacts
            </span>
          </button>

          <button
            className={getTabClassName(activeTab, "documents")}
            type="button"
            role="tab"
            onClick={showDocumentsTab}
            disabled={isEditingAnnouncement}
            aria-label="Documents"
          >
            <FileText className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:inline">
              Documents
            </span>
          </button>

          <button
            className={getTabClassName(activeTab, "history")}
            type="button"
            role="tab"
            onClick={showHistoryTab}
            disabled={isEditingAnnouncement}
            aria-label="Historique"
          >
            <History className="h-5 w-5 sm:hidden" />
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
      <div className="rounded-xl border border-base-300 bg-base-200/50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
          Statut
        </p>

        <span className={getStatusBadgeClassName(application.status)}>
          {getOptionLabel(APPLICATION_STATUS_OPTIONS, application.status, "Inconnu")}
        </span>
      </div>
    );
  }

  function renderAnnouncementReadOnly() {
    return (
      <div className="grid gap-4">
        <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
          <h3 className="font-semibold">
            Informations de l’annonce
          </h3>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <InfoItem label="Entreprise" value={application.company} />
            <InfoItem label="Poste" value={application.position} />
            <InfoItem
              label="Contrat"
              value={getOptionLabel(
                APPLICATION_CONTRACT_TYPE_OPTIONS,
                application.contractType,
                "Non renseigné",
              )}
            />
            {renderStatusInfoItem()}
            <InfoItem label="Ville" value={application.location || "Non renseignée"} />
            <InfoItem label="Salaire" value={formatSalary(application.salary)} />
          </div>

          <div className="mt-3">
            {application.link && (
              <div className="rounded-xl border border-base-300 bg-base-200/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                  Lien
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                  <LinkIcon className="h-4 w-4 text-primary" />

                  <a
                    className="link link-primary truncate"
                    href={application.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir l’annonce
                  </a>
                </div>
              </div>
            )}

            {!application.link && (
              <InfoItem label="Lien" value="Non renseigné" />
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
          <h3 className="font-semibold">
            Dates
          </h3>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <InfoItem label="Envoi" value={formatDate(application.sentAt)} />
            <InfoItem label="Relance" value={getApplicationFollowUpDateLabel(application)} />
            <InfoItem label="Entretien" value={formatDate(application.interviewAt)} />
          </div>
        </section>

        <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
          <ApplicationModalTags
            selectedTags={getApplicationTags(application)}
            allowedTagOptions={allowedTagOptions}
            maxTagsPerApplication={maxTagsPerApplication}
            tagSelectValue={tagSelectValue}
            disabled={tagsUpdating}
            onTagSelectChange={handleTagSelectChange}
            onRemoveTag={handleRemoveTag}
          />
        </section>

        <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
          <h3 className="font-semibold">
            Notes
          </h3>

          <p className="mt-3 min-h-32 whitespace-pre-wrap rounded-xl border border-base-300 bg-base-200/50 p-4 text-sm text-base-content/70">
            {application.notes || "Aucune note renseignée."}
          </p>
        </section>
      </div>
    );
  }

  function renderAnnouncementEditForm() {
    return (
      <div className="grid gap-4">
        <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
          <div>
            <h3 className="text-lg font-semibold">
              Informations principales
            </h3>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="form-control w-full">
              <span className="label mb-1">
                Entreprise *
              </span>

              <input
                className="input input-bordered w-full"
                name="company"
                type="text"
                autoComplete="off"
                value={editForm.company}
                onChange={handleFieldChange}
                placeholder="Ex : Wayne Enterprises"
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Poste *
              </span>

              <input
                className="input input-bordered w-full"
                name="position"
                type="text"
                autoComplete="off"
                value={editForm.position}
                onChange={handleFieldChange}
                placeholder="Ex : Développeur front-end"
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Type de contrat
              </span>

              <select
                className="select select-bordered w-full"
                name="contractType"
                value={editForm.contractType}
                onChange={handleFieldChange}
              >
                {APPLICATION_CONTRACT_TYPE_OPTIONS.map(function (option) {
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Statut
              </span>

              <select
                className="select select-bordered w-full"
                name="status"
                value={editForm.status}
                onChange={handleFieldChange}
              >
                {APPLICATION_STATUS_OPTIONS.map(function (option) {
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Ville
              </span>

              <input
                className="input input-bordered w-full"
                name="location"
                type="text"
                autoComplete="off"
                value={editForm.location}
                onChange={handleFieldChange}
                placeholder="Ex : Toulouse"
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Salaire annuel brut
              </span>

              <input
                className="input input-bordered w-full"
                name="salary"
                type="number"
                min="0"
                step="1"
                value={editForm.salary}
                onChange={handleFieldChange}
                placeholder="Ex : 38000"
              />
            </label>

            <label className="form-control w-full md:col-span-2">
              <span className="label mb-1">
                Lien de l’offre
              </span>

              <input
                className="input input-bordered w-full"
                name="link"
                type="url"
                autoComplete="off"
                value={editForm.link}
                onChange={handleFieldChange}
                placeholder="https://..."
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
          <div>
            <h3 className="text-lg font-semibold">
              Dates
            </h3>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="form-control w-full">
              <span className="label mb-1">
                Date d’envoi *
              </span>

              <input
                className="input input-bordered w-full"
                name="sentAt"
                type="date"
                value={editForm.sentAt}
                onChange={handleFieldChange}
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Date de relance
              </span>

              <input
                className="input input-bordered w-full"
                name="followUpAt"
                type="date"
                value={editForm.followUpAt}
                onChange={handleFieldChange}
                disabled={Boolean(editForm.interviewAt)}
                max={editForm.interviewAt}
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Date d’entretien
              </span>

              <input
                className="input input-bordered w-full"
                name="interviewAt"
                type="date"
                value={editForm.interviewAt}
                onChange={handleFieldChange}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
          <ApplicationModalTags
            selectedTags={getApplicationTags(application)}
            allowedTagOptions={allowedTagOptions}
            maxTagsPerApplication={maxTagsPerApplication}
            tagSelectValue={tagSelectValue}
            disabled={tagsUpdating}
            onTagSelectChange={handleTagSelectChange}
            onRemoveTag={handleRemoveTag}
          />
        </section>

        <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Notes
            </h3>
          </div>

          <label className="form-control w-full">
            <textarea
              className="textarea textarea-bordered min-h-28 w-full resize-none"
              name="notes"
              maxLength={applicationNotesMaxLength}
              value={editForm.notes}
              onChange={handleFieldChange}
              placeholder="Informations utiles sur la candidature..."
            />

            <span className="mt-1 text-right text-xs text-base-content/50">
              {editForm.notes.length} / {applicationNotesMaxLength}
            </span>
          </label>
        </section>
      </div>
    );
  }

  function renderContactsTab() {
    const contacts = getApplicationContacts(application);
    const contactOptions = getAvailableContactOptions();

    return (
      <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
        <h3 className="font-semibold">
          Contacts associés
        </h3>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
          <div className="mt-4 grid gap-3">
            {contacts.map(function (contact) {
              const contactId = getContactId(contact);

              return (
                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4" key={contactId}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
    const documentOptions = getAvailableDocumentOptions();

    return (
      <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
        <h3 className="font-semibold">
          Documents associés
        </h3>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
          <div className="mt-4 grid gap-3">
            {documents.map(function (applicationDocument) {
              const documentId = getDocumentId(applicationDocument);

              return (
                <div className="rounded-xl border border-base-300 bg-base-200/50 p-4" key={documentId}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
        <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-100 p-4 sm:flex-row sm:justify-end sm:p-6">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={cancelEditingAnnouncement}
            disabled={updating}
          >
            Annuler
          </button>

          <button
            className="btn btn-primary text-white"
            type="button"
            onClick={handleAnnouncementSave}
            disabled={updating}
          >
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
        <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-100 p-4 sm:flex-row sm:justify-end sm:p-6">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={handleClose}
            disabled={updating || tagsUpdating}
          >
            Fermer
          </button>

          <button
            className="btn btn-primary text-white"
            type="button"
            onClick={startEditingAnnouncement}
            disabled={loading || updating || tagsUpdating}
          >
            Modifier la candidature
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-100 p-4 sm:flex-row sm:justify-end sm:p-6">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={handleClose}
          disabled={updating || tagsUpdating}
        >
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
          <button
            className="btn btn-ghost btn-sm btn-circle absolute right-4 top-4"
            type="button"
            onClick={handleClose}
            aria-label="Fermer le détail"
          >
            <X className="h-5 w-5" />
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
      <div className="modal-box flex h-full max-h-none w-full max-w-5xl flex-col overflow-hidden rounded-none bg-base-100 p-0 shadow-sm sm:h-[92vh] sm:max-h-[92vh] sm:rounded-2xl">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 bg-base-100 px-4 pt-4 sm:px-6 sm:pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold">
                  {application.position}
                </h2>

                <p className="truncate text-sm text-base-content/60">
                  {application.company}
                </p>
              </div>

              <button
                className="btn btn-ghost btn-sm btn-circle"
                type="button"
                onClick={handleClose}
                aria-label="Fermer le détail"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderTabs()}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto border-t border-base-300 bg-base-200 p-4 sm:p-6">
            {loading && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-base-100 p-4 text-sm text-base-content/60 shadow-sm">
                <span className="loading loading-spinner loading-sm" />
                Chargement des détails...
              </div>
            )}

            {renderActiveTabContent()}
          </div>

          {renderFooter()}
        </div>
      </div>

      <div
        className="modal-backdrop"
        onClick={handleClose}
        aria-label="Fermer le détail"
      />
    </div>
  );
}

export default ApplicationDetailsModal;
