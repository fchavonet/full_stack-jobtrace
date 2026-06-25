function ApplicationModalContact({
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
    <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
      <div>
        <h3 className="text-lg font-semibold">
          Contact associé
        </h3>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="form-control w-full">
          <span className="label mb-1">
            Action contact
          </span>

          <select
            className="select select-bordered w-full"
            value={contactMode}
            onChange={onContactModeChange}
          >
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

            <select
              className="select select-bordered w-full"
              value={selectedContactId}
              onChange={onSelectedContactChange}
            >
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
          <div className="grid gap-4 md:grid-cols-2">
            <label className="form-control w-full">
              <span className="label mb-1">
                Prénom
              </span>

              <input
                className="input input-bordered w-full"
                name="firstName"
                type="text"
                autoComplete="off"
                value={contactForm.firstName}
                onChange={onContactFormChange}
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Nom
              </span>

              <input
                className="input input-bordered w-full"
                name="lastName"
                type="text"
                autoComplete="off"
                value={contactForm.lastName}
                onChange={onContactFormChange}
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Email
              </span>

              <input
                className="input input-bordered w-full"
                name="email"
                type="email"
                autoComplete="off"
                value={contactForm.email}
                onChange={onContactFormChange}
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Téléphone
              </span>

              <input
                className="input input-bordered w-full"
                name="phoneNumber"
                type="text"
                autoComplete="off"
                value={contactForm.phoneNumber}
                onChange={onContactFormChange}
              />
            </label>

            <label className="form-control w-full">
              <span className="label mb-1">
                Entreprise
              </span>

              <input
                className="input input-bordered w-full"
                name="company"
                type="text"
                autoComplete="off"
                value={contactForm.company}
                onChange={onContactFormChange}
                placeholder="Reprend l’entreprise si vide"
              />
            </label>

            <label className="form-control w-full md:col-span-2">
              <span className="label mb-1">
                Notes contact
              </span>

              <textarea
                className="textarea textarea-bordered min-h-24 w-full resize-none"
                name="notes"
                maxLength={contactNotesMaxLength}
                value={contactForm.notes}
                onChange={onContactFormChange}
              />

              <span className="mt-1 text-right text-xs text-base-content/50">
                {contactForm.notes.length} / {contactNotesMaxLength}
              </span>
            </label>
          </div>
        )}
      </div>
    </section>
  );
}

export default ApplicationModalContact;
