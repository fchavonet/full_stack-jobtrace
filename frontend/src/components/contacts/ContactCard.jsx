import { Link as LinkIcon, Mail, Pencil, Phone, Trash2 } from "lucide-react";

import { ItemCard, SectionCard } from "../ui/Cards";

import { getContactName } from "../../utils/contacts/contact.utils";

const contactNotesPreviewMaxLength = 300;

function getContactSubtitle(contact) {
  if (contact.position && contact.company) {
    return contact.position + " chez " + contact.company;
  }

  if (contact.position) {
    return contact.position;
  }

  if (contact.company) {
    return contact.company;
  }

  return "Informations professionnelles non renseignées";
}

function getEmailHref(email) {
  if (!email) {
    return "";
  }

  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "";
  }

  return "mailto:" + trimmedEmail;
}

function getPhoneHref(phoneNumber) {
  if (!phoneNumber) {
    return "";
  }

  const cleanedPhoneNumber = phoneNumber.replace(/[^\d+]/g, "");

  if (!cleanedPhoneNumber) {
    return "";
  }

  return "tel:" + cleanedPhoneNumber;
}

function getLinkedInHref(linkedinUrl) {
  if (!linkedinUrl) {
    return "";
  }

  let href = linkedinUrl.trim();

  if (!href) {
    return "";
  }

  if (!href.startsWith("http://") && !href.startsWith("https://")) {
    href = "https://" + href;
  }

  if (!href.includes("linkedin.com")) {
    return "";
  }

  return href;
}

function getContactNotesPreview(notes) {
  if (!notes) {
    return "";
  }

  const trimmedNotes = notes.trim();

  if (trimmedNotes.length <= contactNotesPreviewMaxLength) {
    return trimmedNotes;
  }

  return trimmedNotes.slice(0, contactNotesPreviewMaxLength).trim() + "...";
}

function ContactInfoRow({
  icon: Icon,
  value,
  fallback,
  href = "",
  external = false,
}) {
  return (
    <div className="w-full min-w-0 flex flex-row justify-start items-center gap-2">
      <Icon className="w-4 h-4 shrink-0 text-base-content/40" />

      {href && external && (
        <a
          className="min-w-0 text-sm text-primary hover:underline truncate cursor-pointer"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {value}
        </a>
      )}

      {href && !external && (
        <a
          className="min-w-0 text-sm text-primary hover:underline truncate cursor-pointer"
          href={href}
        >
          {value}
        </a>
      )}

      {!href && (
        <span className="min-w-0 text-sm text-base-content/50 truncate">
          {fallback}
        </span>
      )}
    </div>
  );
}

function ContactInformationsBlock({ contact }) {
  return (
    <ItemCard className="shrink-0">
      <h3 className="text-sm font-semibold text-base-content">
        Informations
      </h3>

      <div className="w-full mt-3 flex flex-col justify-start items-stretch gap-2">
        <ContactInfoRow
          icon={Mail}
          value={contact.email}
          fallback="Email non renseigné"
          href={getEmailHref(contact.email)}
        />

        <ContactInfoRow
          icon={Phone}
          value={contact.phoneNumber}
          fallback="Téléphone non renseigné"
          href={getPhoneHref(contact.phoneNumber)}
        />

        <ContactInfoRow
          icon={LinkIcon}
          value="LinkedIn"
          fallback="LinkedIn non renseigné"
          href={getLinkedInHref(contact.linkedinUrl)}
          external={true}
        />
      </div>
    </ItemCard>
  );
}

function ContactNotesBlock({ notes }) {
  const notesPreview = getContactNotesPreview(notes);

  return (
    <ItemCard className="flex-1 min-h-36 overflow-y-auto">
      <h3 className="text-sm font-semibold text-base-content">
        Notes
      </h3>

      {notesPreview && (
        <p className="mt-3 text-sm text-base-content/70 whitespace-pre-wrap">
          {notesPreview}
        </p>
      )}

      {!notesPreview && (
        <p className="mt-3 text-sm text-base-content/50">
          Aucune note renseignée.
        </p>
      )}
    </ItemCard>
  );
}

function ContactCardActions({
  contact,
  onEditContact,
  onDeleteContact,
}) {
  return (
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
  );
}

function ContactCard({
  contact,
  onEditContact,
  onDeleteContact,
}) {
  return (
    <SectionCard
      as="article"
      className="h-full min-h-80 flex flex-col justify-start items-stretch"
      contentClassName="flex flex-col flex-1 justify-start items-stretch gap-4"
      title={getContactName(contact)}
      description={getContactSubtitle(contact)}
      rightElement={
        <ContactCardActions
          contact={contact}
          onEditContact={onEditContact}
          onDeleteContact={onDeleteContact}
        />
      }
    >
      <ContactInformationsBlock contact={contact} />

      <ContactNotesBlock notes={contact.notes} />
    </SectionCard>
  );
}

export default ContactCard;
