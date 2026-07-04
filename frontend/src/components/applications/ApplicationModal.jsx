import { useEffect, useRef, useState } from "react";

import { listDocuments } from "../../api/documents.api";
import { APPLICATION_ALLOWED_TAG_OPTIONS, APPLICATION_CONTACT_NOTES_MAX_LENGTH, APPLICATION_MAX_TAGS, APPLICATION_NOTES_MAX_LENGTH } from "../../constants/application.constants";
import { SectionCard } from "../ui/Cards";
import Modal from "../ui/Modal";
import { useToast } from "../../hooks/useToast";
import { createApplicationWithRelations } from "../../utils/applications/creation.utils";
import { getFollowUpDelayDays, getFollowUpInputValue, getFormUsesAutomaticFollowUpDate, getTodayInputValue } from "../../utils/applications/dates.utils";
import { getApplicationStatusIsFinal } from "../../utils/applications/display.utils";
import { getTagIsAlreadySelected } from "../../utils/applications/relations.utils";
import { getErrorMessage, getListFromResponse } from "../../utils/common/apiResponse.utils";
import { normalizeValue } from "../../utils/common/string.utils";
import { getContactLabel } from "../../utils/contacts/contact.utils";
import { getDocumentLabel } from "../../utils/documents/document.utils";
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
  position: "",
  email: "",
  phoneNumber: "",
  company: "",
  linkedinUrl: "",
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

function getDateIsBefore(referenceDate, dateToCheck) {
  if (!referenceDate || !dateToCheck) {
    return false;
  }

  return String(dateToCheck).slice(0, 10) < String(referenceDate).slice(0, 10);
}

function getStatusDisablesFollowUp(status) {
  if (status === "interview") {
    return true;
  }

  if (getApplicationStatusIsFinal(status)) {
    return true;
  }

  return false;
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
      if (getApplicationStatusIsFinal(currentForm.status)) {
        return {
          ...currentForm,
          followUpAt: "",
          interviewAt: "",
        };
      }

      const previousFollowUpDelayDays = previousFollowUpDelayDaysRef.current;
      const formUsesAutomaticFollowUpDate = getFormUsesAutomaticFollowUpDate(currentForm, previousFollowUpDelayDays);

      if (!formUsesAutomaticFollowUpDate) {
        return currentForm;
      }

      return {
        ...currentForm,
        followUpAt: getFollowUpInputValue(currentForm.sentAt, normalizedFollowUpDelayDays),
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

      if (name === "followUpAt" && getDateIsBefore(nextForm.sentAt, value)) {
        nextForm.followUpAt = "";
      }

      if (name === "followUpAt" && value && !getDateIsBefore(nextForm.sentAt, value)) {
        nextForm.status = "follow_up";
      }

      if (name === "interviewAt" && value && getDateIsBefore(nextForm.sentAt, value)) {
        nextForm.interviewAt = "";
        return nextForm;
      }

      if (name === "interviewAt" && value) {
        nextForm.followUpAt = "";
        nextForm.status = "interview";
      }

      if (name === "interviewAt" && !value) {
        nextForm.followUpAt = getFollowUpInputValue(nextForm.sentAt, normalizedFollowUpDelayDays);

        if (currentForm.status === "interview") {
          nextForm.status = "follow_up";
        }
      }

      if (name === "sentAt" && nextForm.interviewAt && getDateIsBefore(value, nextForm.interviewAt)) {
        nextForm.interviewAt = "";

        if (currentForm.status === "interview") {
          nextForm.status = "follow_up";
        }
      }

      if (name === "sentAt" && !nextForm.interviewAt && !getStatusDisablesFollowUp(nextForm.status)) {
        nextForm.followUpAt = getFollowUpInputValue(value, normalizedFollowUpDelayDays);
      }

      if (name === "status" && value === "interview") {
        nextForm.followUpAt = "";
      }

      if (name === "status" && !getStatusDisablesFollowUp(value) && !nextForm.interviewAt) {
        nextForm.followUpAt = getFollowUpInputValue(nextForm.sentAt, normalizedFollowUpDelayDays);
      }

      if (nextForm.status === "interview") {
        nextForm.followUpAt = "";
      }

      if (getApplicationStatusIsFinal(nextForm.status)) {
        nextForm.followUpAt = "";
        nextForm.interviewAt = "";
      }

      return nextForm;
    });
  }

  function addSelectedTag(tagName) {
    if (selectedTagNames.length >= APPLICATION_MAX_TAGS) {
      showToast("Vous pouvez associer jusqu’à " + APPLICATION_MAX_TAGS + " tags par candidature.", "warning");
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
    <Modal
      as="form"
      isOpen={isOpen}
      title="Nouvelle candidature"
      description="Ajoutez les informations utiles que vous avez."
      onClose={handleClose}
      closeDisabled={submitting}
      closeAriaLabel="Fermer le formulaire"
      maxWidthClassName="max-w-5xl"
      onSubmit={handleSubmit}
      footer={
        <>
          <button className="btn btn-ghost w-full lg:w-auto cursor-pointer" type="button" onClick={handleClose} disabled={submitting}>
            Annuler
          </button>

          <button className="btn btn-primary w-full lg:w-auto text-primary-content cursor-pointer" type="submit" disabled={submitting}>
            {submitting && (
              <span className="loading loading-spinner loading-sm" />
            )}

            Enregistrer la candidature
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <ApplicationFormInformation form={form} onFieldChange={handleChange} />

        <ApplicationFormDates form={form} onFieldChange={handleChange} />

        <SectionCard>
          <ApplicationFormTags selectedTags={selectedTagNames} allowedTagOptions={APPLICATION_ALLOWED_TAG_OPTIONS} maxTagsPerApplication={APPLICATION_MAX_TAGS} tagSelectValue={tagSelectValue} onTagSelectChange={handleTagSelectChange} onRemoveTag={removeSelectedTag} />
        </SectionCard>

        <ApplicationFormContact contactOptions={contactOptions} contactMode={contactMode} selectedContactId={selectedContactId} contactForm={contactForm} contactNotesMaxLength={APPLICATION_CONTACT_NOTES_MAX_LENGTH} onContactModeChange={handleContactModeChange} onSelectedContactChange={handleSelectedContactChange} onContactFormChange={handleContactFormChange} />

        <ApplicationFormDocument documentOptions={documentOptions} documentMode={documentMode} selectedDocumentId={selectedDocumentId} documentForm={documentForm} documentsLoading={documentsLoading} documentsError={documentsError} fileInputResetKey={fileInputResetKey} onDocumentModeChange={handleDocumentModeChange} onSelectedDocumentChange={handleSelectedDocumentChange} onDocumentTypeChange={handleDocumentTypeChange} onDocumentFileChange={handleDocumentFileChange} />

        <ApplicationFormNotes form={form} applicationNotesMaxLength={APPLICATION_NOTES_MAX_LENGTH} onFieldChange={handleChange} />
      </div>
    </Modal>
  );
}

export default ApplicationModal;
