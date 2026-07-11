import { useState } from "react";

import {
  ContactFormFields,
  ContactNotesField,
} from "./ContactFormFields";

import { SectionCard } from "../ui/Cards";
import Modal from "../ui/Modal";

const contactNotesMaxLength = 300;

const emptyContactForm = {
  firstName: "",
  lastName: "",
  position: "",
  email: "",
  phoneNumber: "",
  company: "",
  linkedinUrl: "",
  notes: "",
};

const contactFieldPlaceholders = {
  firstName: "Ex : Bruce",
  lastName: "Ex : Wayne",
  position: "Ex : CEO",
  email: "bruce.wayne@example.com",
  phoneNumber: "06 00 00 00 00",
  company: "Ex : Wayne Enterprises",
  linkedinUrl: "https://www.linkedin.com/in/bruce-wayne",
};

function getContactForm(contact) {
  if (!contact) {
    return emptyContactForm;
  }

  return {
    firstName: contact.firstName || "",
    lastName: contact.lastName || "",
    position: contact.position || "",
    email: contact.email || "",
    phoneNumber: contact.phoneNumber || "",
    company: contact.company || "",
    linkedinUrl: contact.linkedinUrl || "",
    notes: contact.notes || "",
  };
}

function getContactPayload(form) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    position: form.position.trim(),
    email: form.email.trim(),
    phoneNumber: form.phoneNumber.trim(),
    company: form.company.trim(),
    linkedinUrl: form.linkedinUrl.trim(),
    notes: form.notes.trim(),
  };
}

function ContactModal({
  contact,
  isOpen,
  submitting,
  onClose,
  onSubmitContact,
}) {
  const [form, setForm] = useState(function () {
    return getContactForm(contact);
  });

  const isEditing = Boolean(contact);

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setForm(function (currentForm) {
      return {
        ...currentForm,
        [name]: value,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmitContact(getContactPayload(form));
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    onClose();
  }

  return (
    <Modal
      as="form"
      isOpen={isOpen}
      title={isEditing ? "Modifier le contact" : "Nouveau contact"}
      description="Renseignez les informations utiles pour retrouver rapidement ce contact."
      onClose={handleClose}
      closeDisabled={submitting}
      closeAriaLabel="Fermer le formulaire"
      maxWidthClassName="max-w-5xl"
      onSubmit={handleSubmit}
      footer={
        <>
          <button
            className="btn btn-ghost w-full lg:w-auto cursor-pointer"
            type="button"
            onClick={handleClose}
            disabled={submitting}
          >
            Annuler
          </button>

          <button
            className="btn btn-primary w-full lg:w-auto text-primary-content cursor-pointer"
            type="submit"
            disabled={submitting}
          >
            {submitting && (
              <span className="loading loading-spinner loading-sm" />
            )}

            {isEditing && "Enregistrer les modifications"}
            {!isEditing && "Enregistrer le contact"}
          </button>
        </>
      }
    >
      <SectionCard
        title="Informations du contact"
        description="Ajoutez les informations professionnelles principales."
      >
        <ContactFormFields
          form={form}
          browserAutocomplete={true}
          placeholders={contactFieldPlaceholders}
          phoneInputType="tel"
          onFieldChange={handleFieldChange}
        />
      </SectionCard>

      <SectionCard
        className="mt-6"
        title="Notes"
        description="Ajoutez un contexte utile sur ce contact."
      >
        <ContactNotesField
          form={form}
          notesMaxLength={contactNotesMaxLength}
          placeholder="Informations utiles sur ce contact..."
          minHeightClassName="min-h-28"
          onFieldChange={handleFieldChange}
        />
      </SectionCard>
    </Modal>
  );
}

export default ContactModal;
