const TEST_USER = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "dick.grayson@jobtrace.test",
  firstName: "Dick",
  lastName: "Grayson",
  emailVerified: true,
  theme: "light",
  followUpDelayDays: 7,
};

const TEST_APPLICATION = {
  id: "00000000-0000-4000-8000-000000000002",
  company: "Wayne Enterprises",
  position: "Frontend Developer",
  location: "Gotham City",
  status: "sent",
  contractType: "permanent",
  salary: 45000,
  sentAt: "2026-07-01T00:00:00.000Z",
  followUpAt: "2026-07-08T00:00:00.000Z",
  interviewAt: null,
  notes: "Application de test.",
  createdAt: "2026-07-01T10:00:00.000Z",
  updatedAt: "2026-07-01T10:00:00.000Z",
  tags: [],
  contacts: [],
  documents: [],
};

const TEST_CONTACT = {
  id: "00000000-0000-4000-8000-000000000003",
  firstName: "Bruce",
  lastName: "Wayne",
  company: "Wayne Enterprises",
  position: "Chief Executive Officer",
  email: "bruce.wayne@jobtrace.test",
  phone: "0102030405",
  linkedinUrl: "https://www.linkedin.com/in/bruce-wayne",
  notes: "Contact de test.",
};

const TEST_TAG = {
  id: "00000000-0000-4000-8000-000000000004",
  name: "Prioritaire",
  slug: "prioritaire",
  color: "#4528e8",
};

const TEST_DOCUMENT = {
  id: "00000000-0000-4000-8000-000000000005",
  name: "CV Frontend.pdf",
  type: "resume",
  mimeType: "application/pdf",
  size: 204800,
  createdAt: "2026-07-01T10:00:00.000Z",
};

const TEST_API_ERROR = {
  success: false,
  message: "Une erreur est survenue.",
  errors: [],
};

export {
  TEST_API_ERROR,
  TEST_APPLICATION,
  TEST_CONTACT,
  TEST_DOCUMENT,
  TEST_TAG,
  TEST_USER,
};
