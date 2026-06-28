import { Pencil, Trash2 } from "lucide-react";

import { getContactName } from "../../utils/contacts/contact.utils";

function ContactInformationsBlock({ contact }) {
  return (
    <div className="w-full min-w-0 p-4 rounded-xl bg-base-200">
      <h3 className="text-sm font-semibold text-base-content">
        Informations
      </h3>

      <div className="w-full mt-4 flex flex-col justify-start items-stretch gap-2">
        <div className="w-full flex flex-col justify-start items-start gap-1">
          <p className="text-xs font-semibold text-base-content/50">
            Email
          </p>

          <p className="w-full text-sm text-base-content/70 truncate">
            {contact.email || "Email non renseigné"}
          </p>
        </div>

        <div className="w-full flex flex-col justify-start items-start gap-1">
          <p className="text-xs font-semibold text-base-content/50">
            Téléphone
          </p>

          <p className="w-full text-sm text-base-content/70 truncate">
            {contact.phoneNumber || "Téléphone non renseigné"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactNotesBlock({ notes }) {
  return (
    <div className="w-full min-w-0 p-4 flex-1 rounded-xl bg-base-200 overflow-y-auto">
      <h3 className="text-sm font-semibold text-base-content">
        Notes
      </h3>

      {notes && (
        <p className="mt-4 text-sm text-base-content/70 whitespace-pre-wrap">
          {notes}
        </p>
      )}

      {!notes && (
        <p className="mt-4 text-sm text-base-content/50">
          Aucune note renseignée.
        </p>
      )}
    </div>
  );
}

function ContactCard({
  contact,
  onEditContact,
  onDeleteContact,
}) {
  return (
    <article className="w-full h-full min-h-80 p-4 md:p-6 flex flex-col justify-start items-stretch gap-4 rounded-2xl bg-base-100 shadow-sm">
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-base-content truncate">
            {getContactName(contact)}
          </h2>

          <p className="mt-1 text-sm text-base-content/60 truncate">
            {contact.company || "Entreprise non renseignée"}
          </p>
        </div>

        <div className="shrink-0 flex flex-row justify-end items-center gap-1">
          <button
            className="btn btn-ghost btn-sm btn-square cursor-pointer"
            type="button"
            onClick={function () { onEditContact(contact); }}
            aria-label="Modifier le contact"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            className="btn btn-ghost btn-sm btn-square text-error cursor-pointer"
            type="button"
            onClick={function () { onDeleteContact(contact); }}
            aria-label="Supprimer le contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ContactInformationsBlock contact={contact} />

      <ContactNotesBlock notes={contact.notes} />
    </article>
  );
}

export default ContactCard;
