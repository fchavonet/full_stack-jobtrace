import { Link as LinkIcon, Mail, Phone } from "lucide-react";

import { ItemCard } from "../ui/Cards";

import { getContactName } from "../../utils/contacts/contact.utils";

function getContactField(contact, fieldName) {
  if (contact && contact[fieldName]) {
    return contact[fieldName];
  }

  if (contact && contact.contact && contact.contact[fieldName]) {
    return contact.contact[fieldName];
  }

  return "";
}

function getContactSubtitle(contact) {
  const position = getContactField(contact, "position");
  const company = getContactField(contact, "company");

  if (position && company) {
    return position + " chez " + company;
  }

  if (position) {
    return position;
  }

  if (company) {
    return company;
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

function ContactSummaryRow({
  icon: Icon,
  value,
  fallback,
  href = "",
  external = false,
}) {
  return (
    <div className="w-full min-w-0 flex flex-row justify-start items-center gap-2">
      <Icon className="w-4 h-4 shrink-0 text-primary" />

      {href && external && (
        <a
          className="min-w-0 text-sm text-base-content/70 hover:underline truncate cursor-pointer"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {value}
        </a>
      )}

      {href && !external && (
        <a
          className="min-w-0 text-sm text-base-content/70 hover:underline truncate cursor-pointer"
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

function ContactSummaryCard({
  contact,
  rightElement,
}) {
  const email = getContactField(contact, "email");
  const phoneNumber = getContactField(contact, "phoneNumber");
  const linkedinUrl = getContactField(contact, "linkedinUrl");
  const notes = getContactField(contact, "notes");

  return (
    <ItemCard className="border border-base-300 bg-base-200/50">
      <div className="w-full min-w-0 flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="w-full min-w-0">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-base-content truncate">
              {getContactName(contact)}
            </h3>

            <p className="mt-1 text-xs text-base-content/60 truncate">
              {getContactSubtitle(contact)}
            </p>
          </div>

          <div className="w-full mt-4 flex flex-col justify-start items-stretch gap-2">
            <ContactSummaryRow
              icon={Mail}
              value={email}
              fallback="Email non renseigné"
              href={getEmailHref(email)}
            />

            <ContactSummaryRow
              icon={Phone}
              value={phoneNumber}
              fallback="Téléphone non renseigné"
              href={getPhoneHref(phoneNumber)}
            />

            <ContactSummaryRow
              icon={LinkIcon}
              value="LinkedIn"
              fallback="LinkedIn non renseigné"
              href={getLinkedInHref(linkedinUrl)}
              external={true}
            />
          </div>

          {notes && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-base-content">
                Notes
              </h3>

              <p className="mt-2 text-sm text-base-content/70 whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          )}
        </div>

        {rightElement && (
          <div className="shrink-0">
            {rightElement}
          </div>
        )}
      </div>
    </ItemCard>
  );
}

export default ContactSummaryCard;
