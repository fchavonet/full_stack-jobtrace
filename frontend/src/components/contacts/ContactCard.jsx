import { Mail, Pencil, Phone, Trash2 } from "lucide-react";

import { getContactName } from "../../utils/contacts/contact.utils";

function ContactCard({
  contact,
  onEditContact,
  onDeleteContact,
}) {
  return (
    <article className="flex h-80 flex-col rounded-2xl bg-base-100 p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">
            {getContactName(contact)}
          </h2>

          <p className="truncate text-sm text-base-content/60">
            {contact.company || "Entreprise non renseignée"}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            className="btn btn-ghost btn-sm btn-square"
            type="button"
            onClick={function () { onEditContact(contact); }}
            aria-label="Modifier le contact"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            className="btn btn-ghost btn-sm btn-square text-error"
            type="button"
            onClick={function () { onDeleteContact(contact); }}
            aria-label="Supprimer le contact"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex min-w-0 items-center gap-2 text-base-content/70">
          <Mail className="h-4 w-4 shrink-0 text-primary" />

          <span className="truncate">
            {contact.email || "Email non renseigné"}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-base-content/70">
          <Phone className="h-4 w-4 shrink-0 text-primary" />

          <span className="truncate">
            {contact.phoneNumber || "Téléphone non renseigné"}
          </span>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-base-300 bg-base-200/50 p-3 text-sm text-base-content/70">
        {contact.notes && (
          <p className="whitespace-pre-wrap">
            {contact.notes}
          </p>
        )}

        {!contact.notes && (
          <p className="text-base-content/50">
            Aucune note renseignée.
          </p>
        )}
      </div>
    </article>
  );
}

export default ContactCard;
