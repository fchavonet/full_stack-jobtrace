import { X } from "lucide-react";
import { useState } from "react";

import {
  ContactFormFields,
  ContactNotesField,
} from "./ContactFormFields";

const contactNotesMaxLength = 300;

const emptyContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  company: "",
  notes: "",
};

const contactFieldPlaceholders = {
  firstName: "Ex : Bruce",
  lastName: "Ex : Wayne",
  email: "bruce.wayne@example.com",
  phoneNumber: "06 00 00 00 00",
  company: "Ex : Wayne Enterprises",
};

function getModalClassName(isOpen) {
  let className = "modal";

  if (isOpen) {
    className = "modal modal-open";
  }

  return className;
}

function getContactForm(contact) {
  if (!contact) {
    return emptyContactForm;
  }

  return {
    firstName: contact.firstName || "",
    lastName: contact.lastName || "",
    email: contact.email || "",
    phoneNumber: contact.phoneNumber || "",
    company: contact.company || "",
    notes: contact.notes || "",
  };
}

function getContactPayload(form) {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phoneNumber: form.phoneNumber.trim(),
    company: form.company.trim(),
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
    <div className={getModalClassName(isOpen)}>
      <div className="modal-box flex h-full max-h-none w-full max-w-3xl flex-col rounded-none bg-base-100 p-0 shadow-sm sm:h-auto sm:max-h-[92vh] sm:rounded-2xl">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4 border-b border-base-300 p-4 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold">
                {isEditing && "Modifier le contact"}
                {!isEditing && "Nouveau contact"}
              </h2>

              <p className="text-sm text-base-content/60">
                Renseignez les informations utiles pour retrouver rapidement ce contact.
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
            <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold">
                Informations du contact
              </h3>

              <div className="mt-4">
                <ContactFormFields
                  form={form}
                  browserAutocomplete={true}
                  placeholders={contactFieldPlaceholders}
                  phoneInputType="tel"
                  onFieldChange={handleFieldChange}
                />
              </div>
            </section>

            <section className="mt-4 rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  Notes
                </h3>
              </div>

              <ContactNotesField
                form={form}
                notesMaxLength={contactNotesMaxLength}
                placeholder="Informations utiles sur ce contact..."
                minHeightClassName="min-h-28"
                onFieldChange={handleFieldChange}
              />
            </section>
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

              {isEditing && "Enregistrer les modifications"}
              {!isEditing && "Enregistrer le contact"}
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

export default ContactModal;
