import { ContactFormFields, ContactNotesField } from "../../contacts/ContactFormFields";

const applicationContactPlaceholders = {
  position: "Ex : CEO",
  company: "Reprend l’entreprise si vide",
  linkedinUrl: "https://www.linkedin.com/in/bruce-wayne",
};

function ApplicationFormContact({
  contactOptions,
  contactMode,
  selectedContactId,
  contactForm,
  contactNotesMaxLength,
  onContactModeChange,
  onSelectedContactChange,
  onContactFormChange,
}) {
  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">
          Contact associé
        </h3>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="form-control w-full">
          <span className="label mb-1">
            Ajouter un contact
          </span>

          <select className="select select-bordered w-full" value={contactMode} onChange={onContactModeChange}>
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

            <select className="select select-bordered w-full" value={selectedContactId} onChange={onSelectedContactChange}>
              <option value="">
                Aucun contact sélectionné
              </option>

              {contactOptions.map(function (contactOption) {
                return (
                  <option key={contactOption.id} value={contactOption.id}>
                    {contactOption.label}
                  </option>
                );
              })}
            </select>
          </label>
        )}

        {contactMode === "new" && (
          <div className="grid gap-4">
            <ContactFormFields form={contactForm} placeholders={applicationContactPlaceholders} phoneInputType="text" onFieldChange={onContactFormChange} />

            <ContactNotesField form={contactForm} notesMaxLength={contactNotesMaxLength} label="Notes contact" minHeightClassName="min-h-24" onFieldChange={onContactFormChange} />
          </div>
        )}
      </div>
    </section>
  );
}

export default ApplicationFormContact;
