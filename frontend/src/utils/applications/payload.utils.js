function addTextField(payload, fieldName, value) {
  const trimmedValue = String(value || "").trim();

  if (trimmedValue) {
    payload[fieldName] = trimmedValue;
  }
}

function addDateField(payload, fieldName, value) {
  if (value) {
    payload[fieldName] = value;
  }
}

function addSalaryField(payload, value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return;
  }

  const salary = Number(trimmedValue);

  if (Number.isInteger(salary) && salary >= 0) {
    payload.salary = salary;
  }
}

function getSafeFollowUpAt(form) {
  if (form.interviewAt) {
    return "";
  }

  return form.followUpAt;
}

export function buildApplicationPayload(form) {
  const payload = {
    company: form.company.trim(),
    position: form.position.trim(),
    status: form.status,
    sentAt: form.sentAt,
  };

  addTextField(payload, "contractType", form.contractType);
  addTextField(payload, "location", form.location);
  addTextField(payload, "link", form.link);
  addTextField(payload, "notes", form.notes);
  addSalaryField(payload, form.salary);
  addDateField(payload, "followUpAt", getSafeFollowUpAt(form));
  addDateField(payload, "interviewAt", form.interviewAt);

  return payload;
}

export function buildContactPayload(contactForm, applicationCompany) {
  const payload = {};

  addTextField(payload, "firstName", contactForm.firstName);
  addTextField(payload, "lastName", contactForm.lastName);
  addTextField(payload, "position", contactForm.position);
  addTextField(payload, "email", contactForm.email);
  addTextField(payload, "phoneNumber", contactForm.phoneNumber);
  addTextField(payload, "company", contactForm.company);
  addTextField(payload, "linkedinUrl", contactForm.linkedinUrl);
  addTextField(payload, "notes", contactForm.notes);

  if (!payload.company) {
    addTextField(payload, "company", applicationCompany);
  }

  return payload;
}

export function buildContactRelationPayload(contactId) {
  return {
    contactId,
  };
}

export function hasNewContactValue(contactForm) {
  return (
    contactForm.firstName.trim().length > 0
    || contactForm.lastName.trim().length > 0
    || contactForm.position.trim().length > 0
    || contactForm.email.trim().length > 0
    || contactForm.phoneNumber.trim().length > 0
    || contactForm.company.trim().length > 0
    || contactForm.linkedinUrl.trim().length > 0
    || contactForm.notes.trim().length > 0
  );
}
