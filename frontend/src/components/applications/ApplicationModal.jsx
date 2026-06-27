import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  linkContactToApplication,
  linkDocumentToApplication,
  linkTagToApplication,
} from "../../api/applicationRelations.api";
import { createApplication } from "../../api/applications.api";
import { createContact } from "../../api/contacts.api";
import { listDocuments, uploadDocument } from "../../api/documents.api";
import { createTag, listTags } from "../../api/tags.api";
import {
  APPLICATION_ALLOWED_TAG_OPTIONS,
  APPLICATION_CONTACT_NOTES_MAX_LENGTH,
  APPLICATION_MAX_TAGS,
  APPLICATION_NOTES_MAX_LENGTH,
} from "../../constants/application.constants";
import { useToast } from "../../hooks/useToast";
import {
  getEntityId,
  getErrorMessage,
  getListFromResponse,
  getResponseEntity,
} from "../../utils/apiResponse.utils";
import {
  getFollowUpDelayDays,
  getFollowUpInputValue,
  getFormUsesAutomaticFollowUpDate,
  getTodayInputValue,
} from "../../utils/applicationDate.utils";
import {
  getExistingTagId,
  getTagIsAlreadySelected,
  getTagsFromApiResponse,
} from "../../utils/applicationRelation.utils";
import { normalizeValue } from "../../utils/string.utils";
import ApplicationModalContact from "./ApplicationModalContact";
import ApplicationModalDates from "./ApplicationModalDates";
import ApplicationModalDocument from "./ApplicationModalDocument";
import ApplicationModalInformation from "./ApplicationModalInformation";
import ApplicationModalNotes from "./ApplicationModalNotes";
import ApplicationModalTags from "./ApplicationModalTags";

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

  if (Number.isInteger(salary) && salary >= 0) {
    payload.salary = salary;
  }
}

function getSafeFollowUpAt(form) {
  if (form.interviewAt) {
    return "";
  }

  return form.followUpAt;
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
  addDateField(payload, "followUpAt", getSafeFollowUpAt(form));
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

function isTagAlreadyExistsError(error) {
  const message = getErrorMessage(error, "");

  return message.toLowerCase().includes("tag already exists");
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
    || contactForm.company.trim().length > 0
    || contactForm.notes.trim().length > 0
  );
}

function ApplicationModal({
  contacts = [],
  followUpDelayDays,
  isOpen,
  onClose,
  onApplicationCreated,
}) {
  const { showToast } = useToast();

  const normalizedFollowUpDelayDays = getFollowUpDelayDays(followUpDelayDays);
  const previousFollowUpDelayDaysRef = useRef(normalizedFollowUpDelayDays);

  const [form, setForm] = useState(function () {
    return getInitialForm(normalizedFollowUpDelayDays);
  });

  useEffect(function () {
    setForm(function (currentForm) {
      const previousFollowUpDelayDays = previousFollowUpDelayDaysRef.current;
      const formUsesAutomaticFollowUpDate = getFormUsesAutomaticFollowUpDate(
        currentForm,
        previousFollowUpDelayDays,
      );

      if (!formUsesAutomaticFollowUpDate) {
        return currentForm;
      }

      return {
        ...currentForm,
        followUpAt: getFollowUpInputValue(
          currentForm.sentAt,
          normalizedFollowUpDelayDays,
        ),
      };
    });

    previousFollowUpDelayDaysRef.current = normalizedFollowUpDelayDays;
  }, [normalizedFollowUpDelayDays]);

  const [tagSelectValue, setTagSelectValue] = useState("");
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
  const [fileInputResetKey, setFileInputResetKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const contactOptions = contacts.map(function (contact) {
    return {
      id: contact.id,
      label: getContactLabel(contact),
    };
  });

  const documentOptions = documents.map(function (document) {
    return {
      id: document.id,
      label: getDocumentLabel(document),
    };
  });

  function resetModal() {
    setForm(getInitialForm(normalizedFollowUpDelayDays));

    setTagSelectValue("");
    setSelectedTagNames([]);

    setContactMode("none");
    setSelectedContactId("");
    setContactForm(defaultContactForm);

    setDocumentMode("none");
    setSelectedDocumentId("");
    setDocumentForm(defaultDocumentForm);
    setDocuments([]);
    setDocumentsLoading(false);
    setDocumentsLoaded(false);
    setDocumentsError(false);
    setFileInputResetKey(function (currentKey) {
      return currentKey + 1;
    });
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

      if (name === "interviewAt" && value) {
        nextForm.followUpAt = "";
      }

      if (name === "interviewAt" && !value) {
        nextForm.followUpAt = getFollowUpInputValue(
          nextForm.sentAt,
          normalizedFollowUpDelayDays,
        );
      }

      if (name === "sentAt" && !nextForm.interviewAt) {
        nextForm.followUpAt = getFollowUpInputValue(
          value,
          normalizedFollowUpDelayDays,
        );
      }

      return nextForm;
    });
  }

  function addSelectedTag(tagName) {
    if (selectedTagNames.length >= APPLICATION_MAX_TAGS) {
      showToast(
        "Vous pouvez associer jusqu’à " + APPLICATION_MAX_TAGS + " tags par candidature.",
        "warning",
      );
      return;
    }

    if (getTagIsAlreadySelected(selectedTagNames, tagName)) {
      showToast("Ce tag est déjà sélectionné.", "warning");
      return;
    }

    setSelectedTagNames(function (currentTagNames) {
      return [...currentTagNames, tagName];
    });
  }

  function handleTagSelectChange(event) {
    const selectedTagName = event.target.value;

    if (!selectedTagName) {
      setTagSelectValue("");
      return;
    }

    addSelectedTag(selectedTagName);
    setTagSelectValue("");
  }

  function removeSelectedTag(tagName) {
    setSelectedTagNames(function (currentTagNames) {
      return currentTagNames.filter(function (currentTagName) {
        return normalizeValue(currentTagName) !== normalizeValue(tagName);
      });
    });
  }

  function handleContactModeChange(event) {
    const nextContactMode = event.target.value;

    setContactMode(nextContactMode);
    setSelectedContactId("");
    setContactForm(defaultContactForm);
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
    setSelectedDocumentId("");
    setDocumentForm(defaultDocumentForm);
    setFileInputResetKey(function (currentKey) {
      return currentKey + 1;
    });

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

      if (onApplicationCreated) {
        await onApplicationCreated();
      }

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
              <ApplicationModalInformation
                form={form}
                onFieldChange={handleChange}
              />

              <ApplicationModalDates
                form={form}
                onFieldChange={handleChange}
              />

              <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
                <ApplicationModalTags
                  selectedTags={selectedTagNames}
                  allowedTagOptions={APPLICATION_ALLOWED_TAG_OPTIONS}
                  maxTagsPerApplication={APPLICATION_MAX_TAGS}
                  tagSelectValue={tagSelectValue}
                  onTagSelectChange={handleTagSelectChange}
                  onRemoveTag={removeSelectedTag}
                />
              </section>

              <ApplicationModalContact
                contactOptions={contactOptions}
                contactMode={contactMode}
                selectedContactId={selectedContactId}
                contactForm={contactForm}
                contactNotesMaxLength={APPLICATION_CONTACT_NOTES_MAX_LENGTH}
                onContactModeChange={handleContactModeChange}
                onSelectedContactChange={handleSelectedContactChange}
                onContactFormChange={handleContactFormChange}
              />

              <ApplicationModalDocument
                documentOptions={documentOptions}
                documentMode={documentMode}
                selectedDocumentId={selectedDocumentId}
                documentForm={documentForm}
                documentsLoading={documentsLoading}
                documentsError={documentsError}
                fileInputResetKey={fileInputResetKey}
                onDocumentModeChange={handleDocumentModeChange}
                onSelectedDocumentChange={handleSelectedDocumentChange}
                onDocumentTypeChange={handleDocumentTypeChange}
                onDocumentFileChange={handleDocumentFileChange}
              />

              <ApplicationModalNotes
                form={form}
                applicationNotesMaxLength={APPLICATION_NOTES_MAX_LENGTH}
                onFieldChange={handleChange}
              />
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
