function getContactFieldAutocomplete(name, browserAutocomplete) {
  if (!browserAutocomplete) {
    return "off";
  }

  if (name === "firstName") {
    return "given-name";
  }

  if (name === "lastName") {
    return "family-name";
  }

  if (name === "company") {
    return "organization";
  }

  if (name === "position") {
    return "organization-title";
  }

  if (name === "email") {
    return "email";
  }

  if (name === "phoneNumber") {
    return "tel";
  }

  if (name === "linkedinUrl") {
    return "url";
  }

  return "off";
}

function getFieldPlaceholder(placeholders, name) {
  if (placeholders && placeholders[name]) {
    return placeholders[name];
  }

  return "";
}

function getNotesTextareaClassName(minHeightClassName) {
  let className = "textarea textarea-bordered w-full resize-none";

  if (minHeightClassName) {
    className = className + " " + minHeightClassName;
  }

  return className;
}

export function ContactFormFields({
  form,
  browserAutocomplete = false,
  placeholders = {},
  phoneInputType = "tel",
  onFieldChange,
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="form-control w-full">
        <span className="label mb-1">
          Prénom
        </span>

        <input
          className="input input-bordered w-full"
          name="firstName"
          type="text"
          autoComplete={getContactFieldAutocomplete("firstName", browserAutocomplete)}
          value={form.firstName}
          onChange={onFieldChange}
          placeholder={getFieldPlaceholder(placeholders, "firstName")}
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
          autoComplete={getContactFieldAutocomplete("lastName", browserAutocomplete)}
          value={form.lastName}
          onChange={onFieldChange}
          placeholder={getFieldPlaceholder(placeholders, "lastName")}
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
          autoComplete={getContactFieldAutocomplete("company", browserAutocomplete)}
          value={form.company}
          onChange={onFieldChange}
          placeholder={getFieldPlaceholder(placeholders, "company")}
        />
      </label>

      <label className="form-control w-full">
        <span className="label mb-1">
          Poste
        </span>

        <input
          className="input input-bordered w-full"
          name="position"
          type="text"
          autoComplete={getContactFieldAutocomplete("position", browserAutocomplete)}
          value={form.position}
          onChange={onFieldChange}
          placeholder={getFieldPlaceholder(placeholders, "position")}
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
          autoComplete={getContactFieldAutocomplete("email", browserAutocomplete)}
          value={form.email}
          onChange={onFieldChange}
          placeholder={getFieldPlaceholder(placeholders, "email")}
        />
      </label>

      <label className="form-control w-full">
        <span className="label mb-1">
          Téléphone
        </span>

        <input
          className="input input-bordered w-full"
          name="phoneNumber"
          type={phoneInputType}
          autoComplete={getContactFieldAutocomplete("phoneNumber", browserAutocomplete)}
          value={form.phoneNumber}
          onChange={onFieldChange}
          placeholder={getFieldPlaceholder(placeholders, "phoneNumber")}
        />
      </label>

      <label className="form-control w-full md:col-span-2">
        <span className="label mb-1">
          LinkedIn
        </span>

        <input
          className="input input-bordered w-full"
          name="linkedinUrl"
          type="url"
          autoComplete={getContactFieldAutocomplete("linkedinUrl", browserAutocomplete)}
          value={form.linkedinUrl}
          onChange={onFieldChange}
          placeholder={getFieldPlaceholder(placeholders, "linkedinUrl")}
        />
      </label>
    </div>
  );
}

export function ContactNotesField({
  form,
  notesMaxLength,
  label = "Notes",
  placeholder = "",
  minHeightClassName = "min-h-28",
  onFieldChange,
}) {
  return (
    <label className="form-control w-full">
      <span className="label mb-1">
        {label}
      </span>

      <textarea
        className={getNotesTextareaClassName(minHeightClassName)}
        name="notes"
        maxLength={notesMaxLength}
        value={form.notes}
        onChange={onFieldChange}
        placeholder={placeholder}
      />

      <span className="mt-1 text-right text-xs text-base-content/50">
        {form.notes.length} / {notesMaxLength}
      </span>
    </label>
  );
}
