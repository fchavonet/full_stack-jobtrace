import { X } from "lucide-react";
import { useState } from "react";

import { linkContactToApplication, linkDocumentToApplication, linkTagToApplication } from "../../api/applicationRelations.api";
import { createApplication } from "../../api/applications.api";
import { createContact } from "../../api/contacts.api";
import { listDocuments, uploadDocument } from "../../api/documents.api";
import { createTag } from "../../api/tags.api";
import { useToast } from "../../hooks/useToast";

const defaultFollowUpDelayDays = 15;
const applicationNotesMaxLength = 500;
const contactNotesMaxLength = 300;
const maxTagsPerApplication = 3;

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

const defaultForm = {
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
};

const defaultContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  company: "",
  notes: "",
};

const defaultDocumentForm = {
  type: "resume",
  file: null,
};

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
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

function getInitialForm(normalizedFollowUpDelayDays) {
  const today = getTodayInputValue();

  return {
    ...defaultForm,
    sentAt: today,
    followUpAt: getFollowUpInputValue(today, normalizedFollowUpDelayDays),
  };
}

function getModalClassName(isOpen) {
  let className = "modal";

  if (isOpen) {
    className = "modal modal-open";
  }

  return className;
}

function addTextField(payload, fieldName, value) {
  const trimmedValue = String(value || "").trim();

  if (trimmedValue) {
    payload[fieldName] = trimmedValue;
  }
}

function addDateField(payload, fieldName, value) {
  if (value) {
    payload[fieldName] = value;
  }
}

function addSalaryField(payload, value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return;
  }

  const salary = Number(trimmedValue);

  if (Number.isFinite(salary)) {
    payload.salary = salary;
  }
}

function buildApplicationPayload(form) {
  const payload = {
    company: form.company.trim(),
    position: form.position.trim(),
    status: form.status,
    sentAt: form.sentAt,
  };

  addTextField(payload, "contractType", form.contractType);
  addTextField(payload, "location", form.location);
  addTextField(payload, "link", form.link);
  addTextField(payload, "notes", form.notes);
  addSalaryField(payload, form.salary);
  addDateField(payload, "followUpAt", form.followUpAt);
  addDateField(payload, "interviewAt", form.interviewAt);

  return payload;
}

function buildContactPayload(contactForm, applicationCompany) {
  const payload = {};

  addTextField(payload, "firstName", contactForm.firstName);
  addTextField(payload, "lastName", contactForm.lastName);
  addTextField(payload, "email", contactForm.email);
  addTextField(payload, "phoneNumber", contactForm.phoneNumber);
  addTextField(payload, "company", contactForm.company);
  addTextField(payload, "notes", contactForm.notes);

  if (!payload.company) {
    addTextField(payload, "company", applicationCompany);
  }

  return payload;
}

function buildContactRelationPayload(contactId) {
  return {
    contactId,
  };
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

function getEntityId(response, entityName) {
  const entity = getResponseEntity(response, entityName);

  if (entity && entity.id) {
    return entity.id;
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

function getErrorMessage(error, fallback) {
  if (error && error.message) {
    return error.message;
  }

  if (error && error.error) {
    return error.error;
  }

  return fallback;
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

  if (contact.company) {
    label = label + " - " + contact.company;
  }

  return label;
}

function getDocumentLabel(document) {
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

function hasNewContactValue(contactForm) {
  return (
    contactForm.firstName.trim().length > 0
    || contactForm.lastName.trim().length > 0
    || contactForm.email.trim().length > 0
    || contactForm.phoneNumber.trim().length > 0
  );
}

function getTagIsAlreadySelected(selectedTagNames, tagName) {
  return selectedTagNames.some(function (selectedTagName) {
    return normalizeValue(selectedTagName) === normalizeValue(tagName);
  });
}

function ApplicationModal({ contacts, tags, followUpDelayDays, isOpen, onClose, onApplicationCreated }) {
  const { showToast } = useToast();

  const normalizedFollowUpDelayDays = getFollowUpDelayDays(followUpDelayDays);

  const [form, setForm] = useState(function () {
    return getInitialForm(normalizedFollowUpDelayDays);
  });

  const [tagQuery, setTagQuery] = useState("");
  const [selectedTagNames, setSelectedTagNames] = useState([]);

  const [contactMode, setContactMode] = useState("none");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [contactForm, setContactForm] = useState(defaultContactForm);

  const [documentMode, setDocumentMode] = useState("none");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [documentForm, setDocumentForm] = useState(defaultDocumentForm);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [documentsError, setDocumentsError] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  function resetModal() {
    setForm(getInitialForm(normalizedFollowUpDelayDays));

    setTagQuery("");
    setSelectedTagNames([]);

    setContactMode("none");
    setSelectedContactId("");
    setContactForm(defaultContactForm);

    setDocumentMode("none");
    setSelectedDocumentId("");
    setDocumentForm(defaultDocumentForm);
    setDocumentsError(false);
  }

  async function loadDocuments() {
    if (documentsLoaded || documentsLoading) {
      return;
    }

    setDocumentsLoading(true);
    setDocumentsError(false);

    try {
      const response = await listDocuments();
      const documentsData = getListFromResponse(response, "documents");

      setDocuments(documentsData);
      setDocumentsLoaded(true);
    } catch {
      setDocuments([]);
      setDocumentsError(true);
      showToast("Impossible de charger les documents existants.", "warning");
    } finally {
      setDocumentsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(function (currentForm) {
      const nextForm = {
        ...currentForm,
        [name]: value,
      };

      if (name === "sentAt") {
        nextForm.followUpAt = getFollowUpInputValue(value, normalizedFollowUpDelayDays);
      }

      return nextForm;
    });
  }

  function handleTagQueryChange(event) {
    setTagQuery(event.target.value);
  }

  function addTagFromQuery() {
    const allowedTagName = getAllowedTagName(tagQuery);

    if (!tagQuery.trim()) {
      return;
    }

    if (!allowedTagName) {
      showToast("Sélectionne un tag proposé dans la liste.", "warning");
      return;
    }

    if (selectedTagNames.length >= maxTagsPerApplication) {
      showToast("Vous pouvez associer jusqu’à 3 tags par candidature.", "warning");
      setTagQuery("");
      return;
    }

    if (getTagIsAlreadySelected(selectedTagNames, allowedTagName)) {
      showToast("Ce tag est déjà sélectionné.", "warning");
      setTagQuery("");
      return;
    }

    setSelectedTagNames(function (currentTagNames) {
      return [...currentTagNames, allowedTagName];
    });

    setTagQuery("");
  }

  function handleTagKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTagFromQuery();
    }
  }

  function removeSelectedTag(tagName) {
    setSelectedTagNames(function (currentTagNames) {
      return currentTagNames.filter(function (currentTagName) {
        return normalizeValue(currentTagName) !== normalizeValue(tagName);
      });
    });
  }

  function handleContactModeChange(event) {
    setContactMode(event.target.value);
  }

  function handleContactFormChange(event) {
    const { name, value } = event.target;

    setContactForm(function (currentContactForm) {
      return {
        ...currentContactForm,
        [name]: value,
      };
    });
  }

  function handleSelectedContactChange(event) {
    setSelectedContactId(event.target.value);
  }

  function handleDocumentModeChange(event) {
    const nextDocumentMode = event.target.value;

    setDocumentMode(nextDocumentMode);

    if (nextDocumentMode === "existing") {
      loadDocuments();
    }
  }

  function handleDocumentTypeChange(event) {
    const { value } = event.target;

    setDocumentForm(function (currentDocumentForm) {
      return {
        ...currentDocumentForm,
        type: value,
      };
    });
  }

  function handleDocumentFileChange(event) {
    const file = event.target.files[0];

    setDocumentForm(function (currentDocumentForm) {
      return {
        ...currentDocumentForm,
        file,
      };
    });
  }

  function handleSelectedDocumentChange(event) {
    setSelectedDocumentId(event.target.value);
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    resetModal();
    onClose();
  }

  async function createOrGetTagIds() {
    const tagIds = [];

    for (const selectedTagName of selectedTagNames) {
      const existingTagId = getExistingTagId(tags, selectedTagName);

      if (existingTagId) {
        tagIds.push(existingTagId);
      } else {
        const response = await createTag({
          name: selectedTagName,
        });

        const tagId = getEntityId(response, "tag");

        if (tagId) {
          tagIds.push(tagId);
        } else {
          throw new Error("Le tag a été créé, mais son identifiant est introuvable.");
        }
      }
    }

    return tagIds;
  }

  async function createOrGetContactId() {
    if (contactMode === "existing") {
      return selectedContactId;
    }

    if (contactMode !== "new") {
      return "";
    }

    if (!hasNewContactValue(contactForm)) {
      return "";
    }

    const payload = buildContactPayload(contactForm, form.company);
    const response = await createContact(payload);
    const contactId = getEntityId(response, "contact");

    if (contactId) {
      return contactId;
    }

    throw new Error("Le contact a été créé, mais son identifiant est introuvable.");
  }

  async function uploadOrGetDocumentId() {
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

  async function linkSelectedTags(applicationId) {
    const tagIds = await createOrGetTagIds();

    for (const tagId of tagIds) {
      await linkTagToApplication(applicationId, {
        tagId,
      });
    }
  }

  async function linkSelectedContact(applicationId) {
    const contactId = await createOrGetContactId();

    if (!contactId) {
      return;
    }

    const payload = buildContactRelationPayload(contactId);

    await linkContactToApplication(applicationId, payload);
  }

  async function linkSelectedDocument(applicationId) {
    const documentId = await uploadOrGetDocumentId();

    if (!documentId) {
      return;
    }

    await linkDocumentToApplication(applicationId, {
      documentId,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const company = form.company.trim();
    const position = form.position.trim();

    if (!company) {
      showToast("L’entreprise est obligatoire.", "error");
      return;
    }

    if (!position) {
      showToast("Le poste est obligatoire.", "error");
      return;
    }

    if (!form.sentAt) {
      showToast("La date d’envoi est obligatoire.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const applicationPayload = buildApplicationPayload(form);
      const applicationResponse = await createApplication(applicationPayload);
      const applicationId = getEntityId(applicationResponse, "application");

      if (!applicationId) {
        throw new Error("La candidature a été créée, mais son identifiant est introuvable.");
      }

      await linkSelectedTags(applicationId);
      await linkSelectedContact(applicationId);
      await linkSelectedDocument(applicationId);

      showToast("Candidature créée.", "success");
      resetModal();
      await onApplicationCreated();
      onClose();
    } catch (error) {
      console.error("Application creation error:", error);
      showToast(getErrorMessage(error, "Impossible de créer la candidature."), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={getModalClassName(isOpen)}>
      <div className="modal-box flex h-full max-h-none w-full max-w-5xl flex-col rounded-none bg-base-100 p-0 shadow-sm sm:h-auto sm:max-h-[92vh] sm:rounded-2xl">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4 border-b border-base-300 p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold">
                Nouvelle candidature
              </h2>

              <p className="text-sm text-base-content/60">
                Enregistrez l’offre et ajoutez les informations utiles si vous les avez déjà.
              </p>
            </div>

            <button
              className="btn btn-ghost btn-sm btn-circle"
              type="button"
              onClick={handleClose}
              aria-label="Fermer le formulaire"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-base-200 p-4 sm:p-6">
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
                      value={form.company}
                      onChange={handleChange}
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
                      value={form.position}
                      onChange={handleChange}
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
                      value={form.contractType}
                      onChange={handleChange}
                    >
                      <option value="">
                        Non renseigné
                      </option>

                      <option value="permanent">
                        CDI
                      </option>

                      <option value="fixed_term">
                        CDD
                      </option>

                      <option value="apprenticeship">
                        Alternance
                      </option>

                      <option value="internship">
                        Stage
                      </option>

                      <option value="freelance">
                        Freelance
                      </option>

                      <option value="temporary">
                        Intérim
                      </option>

                      <option value="other">
                        Autre
                      </option>
                    </select>
                  </label>

                  <label className="form-control w-full">
                    <span className="label mb-1">
                      Statut
                    </span>

                    <select
                      className="select select-bordered w-full"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="sent">
                        Envoyée
                      </option>

                      <option value="follow_up">
                        À relancer
                      </option>

                      <option value="interview">
                        Entretien
                      </option>

                      <option value="rejected">
                        Refusée
                      </option>

                      <option value="accepted">
                        Acceptée
                      </option>
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
                      value={form.location}
                      onChange={handleChange}
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
                      value={form.salary}
                      onChange={handleChange}
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
                      value={form.link}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </label>

                  <div className="form-control w-full md:col-span-2">
                    <span className="label mb-1">
                      Tags
                    </span>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        className="input input-bordered w-full"
                        list="application-tag-options"
                        value={tagQuery}
                        onChange={handleTagQueryChange}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Ex : Prioritaire"
                      />

                      <button
                        className="btn btn-outline btn-primary"
                        type="button"
                        onClick={addTagFromQuery}
                        disabled={selectedTagNames.length >= maxTagsPerApplication}
                      >
                        Ajouter
                      </button>
                    </div>

                    <datalist id="application-tag-options">
                      {allowedTagOptions.map(function (tagOption) {
                        return (
                          <option key={tagOption} value={tagOption} />
                        );
                      })}
                    </datalist>

                    <p className="mt-1 text-xs text-base-content/50">
                      Jusqu’à 3 tags par candidature.
                    </p>

                    {selectedTagNames.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedTagNames.map(function (tagName) {
                          return (
                            <span className="badge badge-primary gap-2 px-3 py-3 text-white" key={tagName}>
                              {tagName}

                              <button
                                className="btn btn-ghost btn-xs btn-circle text-white hover:bg-primary-content/20"
                                type="button"
                                onClick={function () { removeSelectedTag(tagName); }}
                                aria-label={"Retirer le tag " + tagName}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {tagQuery.trim().length > 0 && !getAllowedTagName(tagQuery) && (
                      <p className="mt-1 text-xs text-warning">
                        Sélectionne un tag proposé dans la liste.
                      </p>
                    )}
                  </div>
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
                      value={form.sentAt}
                      onChange={handleChange}
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
                      value={form.followUpAt}
                      onChange={handleChange}
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
                      value={form.interviewAt}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    Contact associé
                  </h3>
                </div>

                <div className="mt-4 grid gap-4">
                  <label className="form-control w-full">
                    <span className="label mb-1">
                      Action contact
                    </span>

                    <select
                      className="select select-bordered w-full"
                      value={contactMode}
                      onChange={handleContactModeChange}
                    >
                      <option value="none">
                        Aucun contact
                      </option>

                      <option value="existing">
                        Sélectionner un contact existant
                      </option>

                      <option value="new">
                        Créer un nouveau contact
                      </option>
                    </select>
                  </label>

                  {contactMode === "existing" && (
                    <label className="form-control w-full">
                      <span className="label mb-1">
                        Contact existant
                      </span>

                      <select
                        className="select select-bordered w-full"
                        value={selectedContactId}
                        onChange={handleSelectedContactChange}
                      >
                        <option value="">
                          Aucun contact sélectionné
                        </option>

                        {contacts.map(function (contact) {
                          return (
                            <option key={contact.id} value={contact.id}>
                              {getContactLabel(contact)}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  )}

                  {contactMode === "new" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="form-control w-full">
                        <span className="label mb-1">
                          Prénom
                        </span>

                        <input
                          className="input input-bordered w-full"
                          name="firstName"
                          type="text"
                          autoComplete="off"
                          value={contactForm.firstName}
                          onChange={handleContactFormChange}
                        />
                      </label>

                      <label className="form-control w-full">
                        <span className="label mb-1">
                          Nom
                        </span>

                        <input
                          className="input input-bordered w-full"
                          name="lastName"
                          type="text"
                          autoComplete="off"
                          value={contactForm.lastName}
                          onChange={handleContactFormChange}
                        />
                      </label>

                      <label className="form-control w-full">
                        <span className="label mb-1">
                          Email
                        </span>

                        <input
                          className="input input-bordered w-full"
                          name="email"
                          type="email"
                          autoComplete="off"
                          value={contactForm.email}
                          onChange={handleContactFormChange}
                        />
                      </label>

                      <label className="form-control w-full">
                        <span className="label mb-1">
                          Téléphone
                        </span>

                        <input
                          className="input input-bordered w-full"
                          name="phoneNumber"
                          type="text"
                          autoComplete="off"
                          value={contactForm.phoneNumber}
                          onChange={handleContactFormChange}
                        />
                      </label>

                      <label className="form-control w-full">
                        <span className="label mb-1">
                          Entreprise
                        </span>

                        <input
                          className="input input-bordered w-full"
                          name="company"
                          type="text"
                          autoComplete="off"
                          value={contactForm.company}
                          onChange={handleContactFormChange}
                          placeholder="Reprend l’entreprise si vide"
                        />
                      </label>

                      <label className="form-control w-full md:col-span-2">
                        <span className="label mb-1">
                          Notes contact
                        </span>

                        <textarea
                          className="textarea textarea-bordered min-h-24 w-full resize-none"
                          name="notes"
                          maxLength={contactNotesMaxLength}
                          value={contactForm.notes}
                          onChange={handleContactFormChange}
                        />

                        <span className="mt-1 text-right text-xs text-base-content/50">
                          {contactForm.notes.length} / {contactNotesMaxLength}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    Document associé
                  </h3>

                  <p className="text-sm text-base-content/60">
                    Liez un document existant ou ajoutez un fichier pendant la création.
                  </p>
                </div>

                <div className="mt-4 grid gap-4">
                  <label className="form-control w-full">
                    <span className="label mb-1">
                      Action document
                    </span>

                    <select
                      className="select select-bordered w-full"
                      value={documentMode}
                      onChange={handleDocumentModeChange}
                    >
                      <option value="none">
                        Aucun document
                      </option>

                      <option value="existing">
                        Sélectionner un document existant
                      </option>

                      <option value="upload">
                        Ajouter un nouveau document
                      </option>
                    </select>
                  </label>

                  {documentMode === "existing" && (
                    <div className="grid gap-2">
                      {documentsLoading && (
                        <div className="flex items-center gap-2 text-sm text-base-content/60">
                          <span className="loading loading-spinner loading-sm" />
                          Chargement des documents...
                        </div>
                      )}

                      {documentsError && (
                        <div className="alert alert-warning">
                          <span>
                            Les documents existants ne peuvent pas être chargés pour le moment.
                          </span>
                        </div>
                      )}

                      {!documentsLoading && !documentsError && documents.length === 0 && (
                        <div className="alert">
                          <span>
                            Aucun document existant disponible.
                          </span>
                        </div>
                      )}

                      {!documentsLoading && !documentsError && documents.length > 0 && (
                        <label className="form-control w-full">
                          <span className="label mb-1">
                            Document existant
                          </span>

                          <select
                            className="select select-bordered w-full"
                            value={selectedDocumentId}
                            onChange={handleSelectedDocumentChange}
                          >
                            <option value="">
                              Aucun document sélectionné
                            </option>

                            {documents.map(function (document) {
                              return (
                                <option key={document.id} value={document.id}>
                                  {getDocumentLabel(document)}
                                </option>
                              );
                            })}
                          </select>
                        </label>
                      )}
                    </div>
                  )}

                  {documentMode === "upload" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="form-control w-full">
                        <span className="label mb-1">
                          Type de document
                        </span>

                        <select
                          className="select select-bordered w-full"
                          value={documentForm.type}
                          onChange={handleDocumentTypeChange}
                        >
                          <option value="resume">
                            CV
                          </option>

                          <option value="cover_letter">
                            Lettre de motivation
                          </option>
                        </select>
                      </label>

                      <label className="form-control w-full">
                        <span className="label mb-1">
                          Fichier
                        </span>

                        <input
                          className="file-input file-input-bordered w-full"
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={handleDocumentFileChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
                <label className="form-control w-full">
                  <span className="label mb-1">
                    Notes candidature
                  </span>

                  <textarea
                    className="textarea textarea-bordered min-h-28 w-full resize-none"
                    name="notes"
                    maxLength={applicationNotesMaxLength}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Informations utiles sur la candidature..."
                  />

                  <span className="mt-1 text-right text-xs text-base-content/50">
                    {form.notes.length} / {applicationNotesMaxLength}
                  </span>
                </label>
              </section>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-base-300 bg-base-100 p-4 sm:flex-row sm:justify-end sm:p-6">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleClose}
              disabled={submitting}
            >
              Annuler
            </button>

            <button
              className="btn btn-primary text-white"
              type="submit"
              disabled={submitting}
            >
              {submitting && (
                <span className="loading loading-spinner loading-sm" />
              )}

              Enregistrer la candidature
            </button>
          </div>
        </form>
      </div>

      <div
        className="modal-backdrop"
        onClick={handleClose}
        aria-label="Fermer le formulaire"
      />
    </div>
  );
}

export default ApplicationModal;
