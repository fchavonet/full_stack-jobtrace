import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { listDocuments } from "../../api/documents.api";
import {
  APPLICATION_ALLOWED_TAG_OPTIONS,
  APPLICATION_CONTACT_NOTES_MAX_LENGTH,
  APPLICATION_MAX_TAGS,
  APPLICATION_NOTES_MAX_LENGTH,
} from "../../constants/application.constants";
import { useToast } from "../../hooks/useToast";
import {
  getErrorMessage,
  getListFromResponse,
} from "../../utils/common/apiResponse.utils";
import { createApplicationWithRelations } from "../../utils/applications/creation.utils";
import {
  getFollowUpDelayDays,
  getFollowUpInputValue,
  getFormUsesAutomaticFollowUpDate,
  getTodayInputValue,
} from "../../utils/applications/dates.utils";
import { getContactLabel } from "../../utils/contacts/contact.utils";
import { getDocumentLabel } from "../../utils/documents/document.utils";
import { getTagIsAlreadySelected } from "../../utils/applications/relations.utils";
import { normalizeValue } from "../../utils/common/string.utils";
import ApplicationFormContact from "./form-sections/ApplicationFormContact";
import ApplicationFormDates from "./form-sections/ApplicationFormDates";
import ApplicationFormDocument from "./form-sections/ApplicationFormDocument";
import ApplicationFormInformation from "./form-sections/ApplicationFormInformation";
import ApplicationFormNotes from "./form-sections/ApplicationFormNotes";
import ApplicationFormTags from "./form-sections/ApplicationFormTags";

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
      label: getContactLabel(contact, true),
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
      await createApplicationWithRelations({
        form,
        selectedTagNames,
        contactMode,
        selectedContactId,
        contactForm,
        documentMode,
        selectedDocumentId,
        documentForm,
      });

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
                Ajoutez les informations utiles que vous avez.
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
              <ApplicationFormInformation
                form={form}
                onFieldChange={handleChange}
              />

              <ApplicationFormDates
                form={form}
                onFieldChange={handleChange}
              />

              <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
                <ApplicationFormTags
                  selectedTags={selectedTagNames}
                  allowedTagOptions={APPLICATION_ALLOWED_TAG_OPTIONS}
                  maxTagsPerApplication={APPLICATION_MAX_TAGS}
                  tagSelectValue={tagSelectValue}
                  onTagSelectChange={handleTagSelectChange}
                  onRemoveTag={removeSelectedTag}
                />
              </section>

              <ApplicationFormContact
                contactOptions={contactOptions}
                contactMode={contactMode}
                selectedContactId={selectedContactId}
                contactForm={contactForm}
                contactNotesMaxLength={APPLICATION_CONTACT_NOTES_MAX_LENGTH}
                onContactModeChange={handleContactModeChange}
                onSelectedContactChange={handleSelectedContactChange}
                onContactFormChange={handleContactFormChange}
              />

              <ApplicationFormDocument
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

              <ApplicationFormNotes
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
