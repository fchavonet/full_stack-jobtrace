import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplicationHistory,
  listApplications,
  updateApplication,
} from "../src/api/applications.api";

import {
  getDateInputValue,
  getFollowUpDelayDays,
  getFollowUpInputValue,
  getFormUsesAutomaticFollowUpDate,
  getTodayInputValue,
} from "../src/utils/applications/dates.utils";

import {
  getApplicationContractTypeLabel,
  getApplicationStatusBadgeClassName,
  getApplicationStatusIsFinal,
  getApplicationStatusLabel,
  getApplicationStatusSortValue,
  getOptionLabel,
} from "../src/utils/applications/display.utils";

import {
  getHistoryActionLabel,
} from "../src/utils/applications/history.utils";

import {
  buildApplicationPayload,
  buildContactPayload,
  buildContactRelationPayload,
  hasNewContactValue,
} from "../src/utils/applications/payload.utils";

import {
  getAllowedTagName,
  getApplicationContacts,
  getApplicationDocuments,
  getApplicationTags,
  getAvailableContactOptions,
  getAvailableDocumentOptions,
  getContactId,
  getContactIsLinked,
  getDocumentId,
  getDocumentIsLinked,
  getExistingTagId,
  getTagId,
  getTagIsAlreadySelected,
  getTagName,
  getTagsFromApiResponse,
} from "../src/utils/applications/relations.utils";

import {
  getApplicationFollowUpAt,
  getApplicationFollowUpIsRelevant,
  getApplicationInterviewAt,
  getFilteredApplications,
  getFollowUpDisplay,
  getNextSortDirection,
  getSortedApplications,
} from "../src/utils/applications/table.utils";

import {
  TEST_APPLICATION,
  TEST_CONTACT,
  TEST_DOCUMENT,
  TEST_TAG,
} from "./helpers/test-data";

function createFetchResponse({
  body = "",
  contentType = "application/json",
  ok = true,
  status = 200,
} = {}) {
  return {
    ok,
    status,

    headers: {
      get: vi.fn(function (headerName) {
        if (headerName === "content-type") {
          return contentType;
        }

        return null;
      }),
    },

    text: vi.fn().mockResolvedValue(body),
  };
}

function mockJsonResponse(data) {
  const fetchMock = vi.fn().mockResolvedValue(
    createFetchResponse({
      body: JSON.stringify(data),
    }),
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function getFetchRequestOptions(fetchMock) {
  return fetchMock.mock.calls[0][1];
}

const APPLICATION_FORM = {
  company: "  Wayne Enterprises  ",
  position: "  Frontend Developer  ",
  status: "sent",
  contractType: "permanent",
  location: "  Gotham City  ",
  salary: "45000",
  link: "  https://example.com/job  ",
  sentAt: "2026-07-01",
  followUpAt: "2026-07-08",
  interviewAt: "",
  notes: "  Candidature prioritaire.  ",
};

const EMPTY_CONTACT_FORM = {
  firstName: "",
  lastName: "",
  position: "",
  email: "",
  phoneNumber: "",
  company: "",
  linkedinUrl: "",
  notes: "",
};

beforeEach(function () {
  vi.useRealTimers();
});

afterEach(function () {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Applications API", function () {
  test("GET /applications - Should list applications", async function () {
    const response = {
      success: true,
      data: {
        applications: [
          TEST_APPLICATION,
        ],
      },
    };

    const fetchMock = mockJsonResponse(response);

    const result = await listApplications();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/applications",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        authenticated: true,
      }),
    );

    expect(result).toEqual(response);
  });

  test("POST /applications - Should create application", async function () {
    const payload = {
      company: "Wayne Enterprises",
      position: "Frontend Developer",
      status: "sent",
      sentAt: "2026-07-01",
    };

    const response = {
      success: true,
      data: {
        application: TEST_APPLICATION,
      },
    };

    const fetchMock = mockJsonResponse(response);

    const result = await createApplication(payload);
    const requestOptions = getFetchRequestOptions(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/applications",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );

    expect(requestOptions.body).toBe(
      JSON.stringify(payload),
    );

    expect(requestOptions.headers).toEqual({
      "Content-Type": "application/json",
    });

    expect(result).toEqual(response);
  });

  test("GET /applications/:id - Should get application", async function () {
    const response = {
      success: true,
      data: {
        application: TEST_APPLICATION,
      },
    };

    const fetchMock = mockJsonResponse(response);

    const result = await getApplication(
      TEST_APPLICATION.id,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/applications/"
      + TEST_APPLICATION.id,
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        authenticated: true,
      }),
    );

    expect(result).toEqual(response);
  });

  test("PATCH /applications/:id - Should update application", async function () {
    const payload = {
      status: "interview",
      interviewAt: "2026-07-15",
    };

    const response = {
      success: true,
      data: {
        application: {
          ...TEST_APPLICATION,
          ...payload,
        },
      },
    };

    const fetchMock = mockJsonResponse(response);

    const result = await updateApplication(
      TEST_APPLICATION.id,
      payload,
    );

    const requestOptions = getFetchRequestOptions(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/applications/"
      + TEST_APPLICATION.id,
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
      }),
    );

    expect(requestOptions.body).toBe(
      JSON.stringify(payload),
    );

    expect(result).toEqual(response);
  });

  test("DELETE /applications/:id - Should delete application", async function () {
    const response = {
      success: true,
      message: "Application deleted.",
    };

    const fetchMock = mockJsonResponse(response);

    const result = await deleteApplication(
      TEST_APPLICATION.id,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/applications/"
      + TEST_APPLICATION.id,
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
        authenticated: true,
      }),
    );

    expect(result).toEqual(response);
  });

  test("GET /applications/:id/history - Should get application history", async function () {
    const response = {
      success: true,
      data: {
        history: [],
      },
    };

    const fetchMock = mockJsonResponse(response);

    const result = await getApplicationHistory(
      TEST_APPLICATION.id,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/applications/"
      + TEST_APPLICATION.id
      + "/history",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        authenticated: true,
      }),
    );

    expect(result).toEqual(response);
  });

  test("GET /applications - Should throw API error", async function () {
    const apiError = {
      success: false,
      message: "Authentication required.",
      errors: [],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        createFetchResponse({
          body: JSON.stringify(apiError),
          ok: false,
          status: 401,
        }),
      ),
    );

    await expect(
      listApplications(),
    ).rejects.toEqual(apiError);
  });
});

describe("Application display utilities", function () {
  test("getOptionLabel - Should return matching label", function () {
    const options = [
      {
        value: "first",
        label: "Premier",
      },
      {
        value: "second",
        label: "Deuxième",
      },
    ];

    expect(
      getOptionLabel(
        options,
        "second",
        "Inconnu",
      ),
    ).toBe("Deuxième");
  });

  test("getOptionLabel - Should return fallback", function () {
    expect(
      getOptionLabel(
        [],
        "unknown",
        "Inconnu",
      ),
    ).toBe("Inconnu");
  });

  test("getApplicationStatusLabel - Should return status labels", function () {
    expect(
      getApplicationStatusLabel("sent"),
    ).toBe("Envoyée");

    expect(
      getApplicationStatusLabel("follow_up"),
    ).toBe("À relancer");

    expect(
      getApplicationStatusLabel("interview"),
    ).toBe("Entretien");

    expect(
      getApplicationStatusLabel("rejected"),
    ).toBe("Refusée");

    expect(
      getApplicationStatusLabel("accepted"),
    ).toBe("Acceptée");
  });

  test("getApplicationStatusLabel - Should return fallback", function () {
    expect(
      getApplicationStatusLabel("unknown"),
    ).toBe("Inconnu");
  });

  test("getApplicationContractTypeLabel - Should return contract label", function () {
    expect(
      getApplicationContractTypeLabel("permanent"),
    ).toBe("CDI");
  });

  test("getApplicationContractTypeLabel - Should return fallback", function () {
    expect(
      getApplicationContractTypeLabel("unknown"),
    ).toBe("Non renseigné");
  });

  test("getApplicationStatusSortValue - Should return status order", function () {
    expect(
      getApplicationStatusSortValue("sent"),
    ).toBe(1);

    expect(
      getApplicationStatusSortValue("accepted"),
    ).toBeGreaterThan(
      getApplicationStatusSortValue("sent"),
    );
  });

  test("getApplicationStatusSortValue - Should place unknown status last", function () {
    expect(
      getApplicationStatusSortValue("unknown"),
    ).toBe(99);
  });

  test("getApplicationStatusBadgeClassName - Should return status class", function () {
    expect(
      getApplicationStatusBadgeClassName("sent"),
    ).toBe("badge badge-info");

    expect(
      getApplicationStatusBadgeClassName("follow_up"),
    ).toBe("badge badge-warning");

    expect(
      getApplicationStatusBadgeClassName("interview"),
    ).toBe("badge badge-primary text-white");

    expect(
      getApplicationStatusBadgeClassName("rejected"),
    ).toBe("badge badge-error");

    expect(
      getApplicationStatusBadgeClassName("accepted"),
    ).toBe("badge badge-success");
  });

  test("getApplicationStatusBadgeClassName - Should return default class", function () {
    expect(
      getApplicationStatusBadgeClassName("unknown"),
    ).toBe("badge badge-outline");
  });

  test("getApplicationStatusIsFinal - Should identify final statuses", function () {
    expect(
      getApplicationStatusIsFinal("accepted"),
    ).toBe(true);

    expect(
      getApplicationStatusIsFinal("rejected"),
    ).toBe(true);

    expect(
      getApplicationStatusIsFinal("sent"),
    ).toBe(false);

    expect(
      getApplicationStatusIsFinal("interview"),
    ).toBe(false);
  });
});

describe("Application date utilities", function () {
  test("getTodayInputValue - Should return current date", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    expect(
      getTodayInputValue(),
    ).toBe("2026-07-12");
  });

  test("getDateInputValue - Should return ISO date", function () {
    expect(
      getDateInputValue(
        "2026-07-01T12:00:00.000Z",
      ),
    ).toBe("2026-07-01");
  });

  test("getDateInputValue - Should return empty value for missing date", function () {
    expect(
      getDateInputValue(null),
    ).toBe("");

    expect(
      getDateInputValue(""),
    ).toBe("");
  });

  test("getDateInputValue - Should return empty value for invalid date", function () {
    expect(
      getDateInputValue("invalid-date"),
    ).toBe("");
  });

  test("getFollowUpDelayDays - Should return valid delay", function () {
    expect(
      getFollowUpDelayDays(10),
    ).toBe(10);

    expect(
      getFollowUpDelayDays("14"),
    ).toBe(14);
  });

  test("getFollowUpDelayDays - Should return fallback delay", function () {
    expect(
      getFollowUpDelayDays(null),
    ).toBe(15);

    expect(
      getFollowUpDelayDays(0),
    ).toBe(15);

    expect(
      getFollowUpDelayDays(-1),
    ).toBe(15);

    expect(
      getFollowUpDelayDays("invalid"),
    ).toBe(15);
  });

  test("getFollowUpInputValue - Should add delay to sent date", function () {
    expect(
      getFollowUpInputValue(
        "2026-07-01",
        7,
      ),
    ).toBe("2026-07-08");
  });

  test("getFollowUpInputValue - Should return empty value for invalid date", function () {
    expect(
      getFollowUpInputValue(
        "invalid-date",
        7,
      ),
    ).toBe("");
  });

  test("getFormUsesAutomaticFollowUpDate - Should recognize automatic date", function () {
    expect(
      getFormUsesAutomaticFollowUpDate(
        {
          sentAt: "2026-07-01",
          followUpAt: "2026-07-08",
          interviewAt: "",
        },
        7,
      ),
    ).toBe(true);
  });

  test("getFormUsesAutomaticFollowUpDate - Should accept empty follow-up date", function () {
    expect(
      getFormUsesAutomaticFollowUpDate(
        {
          sentAt: "2026-07-01",
          followUpAt: "",
          interviewAt: "",
        },
        7,
      ),
    ).toBe(true);
  });

  test("getFormUsesAutomaticFollowUpDate - Should reject custom follow-up date", function () {
    expect(
      getFormUsesAutomaticFollowUpDate(
        {
          sentAt: "2026-07-01",
          followUpAt: "2026-07-15",
          interviewAt: "",
        },
        7,
      ),
    ).toBe(false);
  });

  test("getFormUsesAutomaticFollowUpDate - Should reject form without sent date", function () {
    expect(
      getFormUsesAutomaticFollowUpDate(
        {
          sentAt: "",
          followUpAt: "",
          interviewAt: "",
        },
        7,
      ),
    ).toBe(false);
  });

  test("getFormUsesAutomaticFollowUpDate - Should reject form with interview", function () {
    expect(
      getFormUsesAutomaticFollowUpDate(
        {
          sentAt: "2026-07-01",
          followUpAt: "2026-07-08",
          interviewAt: "2026-07-10",
        },
        7,
      ),
    ).toBe(false);
  });
});

describe("Application payload utilities", function () {
  test("buildApplicationPayload - Should build complete payload", function () {
    expect(
      buildApplicationPayload(APPLICATION_FORM),
    ).toEqual({
      company: "Wayne Enterprises",
      position: "Frontend Developer",
      status: "sent",
      sentAt: "2026-07-01",
      contractType: "permanent",
      location: "Gotham City",
      salary: 45000,
      link: "https://example.com/job",
      followUpAt: "2026-07-08",
      notes: "Candidature prioritaire.",
    });
  });

  test("buildApplicationPayload - Should remove empty optional fields", function () {
    const payload = buildApplicationPayload({
      ...APPLICATION_FORM,
      contractType: "",
      location: "",
      salary: "",
      link: "",
      followUpAt: "",
      interviewAt: "",
      notes: "",
    });

    expect(payload).toEqual({
      company: "Wayne Enterprises",
      position: "Frontend Developer",
      status: "sent",
      sentAt: "2026-07-01",
    });
  });

  test("buildApplicationPayload - Should ignore invalid salary", function () {
    const payload = buildApplicationPayload({
      ...APPLICATION_FORM,
      salary: "invalid",
    });

    expect(payload).not.toHaveProperty("salary");
  });

  test("buildApplicationPayload - Should ignore negative salary", function () {
    const payload = buildApplicationPayload({
      ...APPLICATION_FORM,
      salary: "-1000",
    });

    expect(payload).not.toHaveProperty("salary");
  });

  test("buildApplicationPayload - Should remove follow-up when interview exists", function () {
    const payload = buildApplicationPayload({
      ...APPLICATION_FORM,
      interviewAt: "2026-07-15",
    });

    expect(payload).not.toHaveProperty("followUpAt");

    expect(payload).toHaveProperty(
      "interviewAt",
      "2026-07-15",
    );
  });

  test("buildApplicationPayload - Should remove dates for final status", function () {
    const payload = buildApplicationPayload({
      ...APPLICATION_FORM,
      status: "accepted",
      interviewAt: "2026-07-15",
    });

    expect(payload).not.toHaveProperty("followUpAt");
    expect(payload).not.toHaveProperty("interviewAt");
  });

  test("buildApplicationPayload - Should remove dates before sent date", function () {
    const payload = buildApplicationPayload({
      ...APPLICATION_FORM,
      followUpAt: "2026-06-30",
      interviewAt: "2026-06-29",
    });

    expect(payload).not.toHaveProperty("followUpAt");
    expect(payload).not.toHaveProperty("interviewAt");
  });

  test("buildContactPayload - Should build complete contact payload", function () {
    const contactForm = {
      firstName: "  Bruce  ",
      lastName: "  Wayne  ",
      position: "  CEO  ",
      email: "  bruce@wayne.test  ",
      phoneNumber: "  0102030405  ",
      company: "  Wayne Enterprises  ",
      linkedinUrl: "  https://linkedin.com/in/bruce  ",
      notes: "  Contact principal.  ",
    };

    expect(
      buildContactPayload(
        contactForm,
        "Fallback Company",
      ),
    ).toEqual({
      firstName: "Bruce",
      lastName: "Wayne",
      position: "CEO",
      email: "bruce@wayne.test",
      phoneNumber: "0102030405",
      company: "Wayne Enterprises",
      linkedinUrl: "https://linkedin.com/in/bruce",
      notes: "Contact principal.",
    });
  });

  test("buildContactPayload - Should use application company", function () {
    expect(
      buildContactPayload(
        EMPTY_CONTACT_FORM,
        "Wayne Enterprises",
      ),
    ).toEqual({
      company: "Wayne Enterprises",
    });
  });

  test("buildContactRelationPayload - Should build relation payload", function () {
    expect(
      buildContactRelationPayload(
        TEST_CONTACT.id,
      ),
    ).toEqual({
      contactId: TEST_CONTACT.id,
    });
  });

  test("hasNewContactValue - Should detect contact value", function () {
    expect(
      hasNewContactValue({
        ...EMPTY_CONTACT_FORM,
        firstName: "Bruce",
      }),
    ).toBe(true);
  });

  test("hasNewContactValue - Should reject empty contact", function () {
    expect(
      hasNewContactValue(
        EMPTY_CONTACT_FORM,
      ),
    ).toBe(false);
  });

  test("hasNewContactValue - Should reject spaces only", function () {
    expect(
      hasNewContactValue({
        ...EMPTY_CONTACT_FORM,
        notes: "   ",
      }),
    ).toBe(false);
  });
});

describe("Application relation utilities", function () {
  test("getApplicationTags - Should return tags", function () {
    expect(
      getApplicationTags({
        tags: [
          TEST_TAG,
        ],
      }),
    ).toEqual([
      TEST_TAG,
    ]);
  });

  test("getApplicationTags - Should return empty array", function () {
    expect(
      getApplicationTags(null),
    ).toEqual([]);

    expect(
      getApplicationTags({
        tags: null,
      }),
    ).toEqual([]);
  });

  test("getApplicationContacts - Should return contacts", function () {
    expect(
      getApplicationContacts({
        contacts: [
          TEST_CONTACT,
        ],
      }),
    ).toEqual([
      TEST_CONTACT,
    ]);
  });

  test("getApplicationDocuments - Should return documents", function () {
    expect(
      getApplicationDocuments({
        documents: [
          TEST_DOCUMENT,
        ],
      }),
    ).toEqual([
      TEST_DOCUMENT,
    ]);
  });

  test("getAllowedTagName - Should reject unknown tag", function () {
    expect(
      getAllowedTagName("Inconnu"),
    ).toBe("");

    expect(
      getAllowedTagName(""),
    ).toBe("");
  });

  test("getTagName - Should return string tag", function () {
    expect(
      getTagName("Prioritaire"),
    ).toBe("Prioritaire");
  });

  test("getTagName - Should return nested tag name", function () {
    expect(
      getTagName({
        tag: TEST_TAG,
      }),
    ).toBe("Prioritaire");
  });

  test("getTagName - Should return direct tag name", function () {
    expect(
      getTagName(TEST_TAG),
    ).toBe("Prioritaire");
  });

  test("getTagName - Should return fallback", function () {
    expect(
      getTagName(null),
    ).toBe("Tag");
  });

  test("getTagId - Should return nested tag identifier", function () {
    expect(
      getTagId({
        tag: TEST_TAG,
      }),
    ).toBe(TEST_TAG.id);
  });

  test("getTagId - Should return relation tag identifier", function () {
    expect(
      getTagId({
        tagId: TEST_TAG.id,
      }),
    ).toBe(TEST_TAG.id);
  });

  test("getTagId - Should return direct identifier", function () {
    expect(
      getTagId(TEST_TAG),
    ).toBe(TEST_TAG.id);
  });

  test("getTagId - Should return empty identifier", function () {
    expect(
      getTagId(null),
    ).toBe("");
  });

  test("getTagIsAlreadySelected - Should detect selected tag", function () {
    expect(
      getTagIsAlreadySelected(
        [
          {
            tag: TEST_TAG,
          },
        ],
        "prioritaire",
      ),
    ).toBe(true);
  });

  test("getExistingTagId - Should return existing tag identifier", function () {
    expect(
      getExistingTagId(
        [
          TEST_TAG,
        ],
        "PRIORITAIRE",
      ),
    ).toBe(TEST_TAG.id);
  });

  test("getExistingTagId - Should return empty identifier", function () {
    expect(
      getExistingTagId(
        [
          TEST_TAG,
        ],
        "Inconnu",
      ),
    ).toBe("");
  });

  test("getTagsFromApiResponse - Should extract tags", function () {
    expect(
      getTagsFromApiResponse({
        data: {
          tags: [
            TEST_TAG,
          ],
        },
      }),
    ).toEqual([
      TEST_TAG,
    ]);
  });

  test("getContactId - Should return nested contact identifier", function () {
    expect(
      getContactId({
        contact: TEST_CONTACT,
      }),
    ).toBe(TEST_CONTACT.id);
  });

  test("getContactId - Should return relation contact identifier", function () {
    expect(
      getContactId({
        contactId: TEST_CONTACT.id,
      }),
    ).toBe(TEST_CONTACT.id);
  });

  test("getContactId - Should return direct contact identifier", function () {
    expect(
      getContactId(TEST_CONTACT),
    ).toBe(TEST_CONTACT.id);
  });

  test("getDocumentId - Should return nested document identifier", function () {
    expect(
      getDocumentId({
        document: TEST_DOCUMENT,
      }),
    ).toBe(TEST_DOCUMENT.id);
  });

  test("getDocumentId - Should return relation document identifier", function () {
    expect(
      getDocumentId({
        documentId: TEST_DOCUMENT.id,
      }),
    ).toBe(TEST_DOCUMENT.id);
  });

  test("getDocumentId - Should return direct document identifier", function () {
    expect(
      getDocumentId(TEST_DOCUMENT),
    ).toBe(TEST_DOCUMENT.id);
  });

  test("getContactIsLinked - Should detect linked contact", function () {
    expect(
      getContactIsLinked(
        {
          contacts: [
            {
              contact: TEST_CONTACT,
            },
          ],
        },
        TEST_CONTACT.id,
      ),
    ).toBe(true);
  });

  test("getDocumentIsLinked - Should detect linked document", function () {
    expect(
      getDocumentIsLinked(
        {
          documents: [
            {
              document: TEST_DOCUMENT,
            },
          ],
        },
        TEST_DOCUMENT.id,
      ),
    ).toBe(true);
  });

  test("getAvailableContactOptions - Should remove linked contacts", function () {
    const secondContact = {
      ...TEST_CONTACT,
      id: "second-contact-id",
      firstName: "Alfred",
      lastName: "Pennyworth",
    };

    expect(
      getAvailableContactOptions(
        [
          TEST_CONTACT,
          secondContact,
        ],
        {
          contacts: [
            {
              contact: TEST_CONTACT,
            },
          ],
        },
      ),
    ).toEqual([
      secondContact,
    ]);
  });

  test("getAvailableDocumentOptions - Should remove linked documents", function () {
    const secondDocument = {
      ...TEST_DOCUMENT,
      id: "second-document-id",
      name: "Cover letter.pdf",
    };

    expect(
      getAvailableDocumentOptions(
        [
          TEST_DOCUMENT,
          secondDocument,
        ],
        {
          documents: [
            {
              document: TEST_DOCUMENT,
            },
          ],
        },
      ),
    ).toEqual([
      secondDocument,
    ]);
  });
});

describe("Application table utilities", function () {
  const applications = [
    {
      ...TEST_APPLICATION,
      id: "application-one",
      company: "Wayne Enterprises",
      position: "Frontend Developer",
      location: "Gotham City",
      status: "sent",
      contractType: "permanent",
      sentAt: "2026-07-01",
      followUpAt: "2026-07-15",
      interviewAt: null,
    },
    {
      ...TEST_APPLICATION,
      id: "application-two",
      company: "LexCorp",
      position: "Backend Developer",
      location: "Metropolis",
      status: "interview",
      contractType: "fixed_term",
      sentAt: "2026-07-02",
      followUpAt: null,
      interviewAt: "2026-07-20",
    },
    {
      ...TEST_APPLICATION,
      id: "application-three",
      company: "Daily Planet",
      position: "Full Stack Developer",
      location: "Metropolis",
      status: "rejected",
      contractType: "internship",
      sentAt: "2026-07-03",
      followUpAt: null,
      interviewAt: null,
    },
  ];

  test("getApplicationFollowUpIsRelevant - Should accept relevant follow-up", function () {
    expect(
      getApplicationFollowUpIsRelevant(
        applications[0],
      ),
    ).toBe(true);
  });

  test("getApplicationFollowUpIsRelevant - Should reject follow-up with interview", function () {
    expect(
      getApplicationFollowUpIsRelevant({
        ...applications[0],
        interviewAt: "2026-07-20",
      }),
    ).toBe(false);
  });

  test("getApplicationFollowUpIsRelevant - Should reject final status", function () {
    expect(
      getApplicationFollowUpIsRelevant({
        ...applications[0],
        status: "accepted",
      }),
    ).toBe(false);
  });

  test("getApplicationFollowUpIsRelevant - Should reject date before sent date", function () {
    expect(
      getApplicationFollowUpIsRelevant({
        ...applications[0],
        followUpAt: "2026-06-30",
      }),
    ).toBe(false);
  });

  test("getApplicationFollowUpAt - Should return relevant date", function () {
    expect(
      getApplicationFollowUpAt(
        applications[0],
      ),
    ).toBe("2026-07-15");
  });

  test("getApplicationFollowUpAt - Should return empty date", function () {
    expect(
      getApplicationFollowUpAt({
        ...applications[0],
        status: "accepted",
      }),
    ).toBe("");
  });

  test("getApplicationInterviewAt - Should return interview date", function () {
    expect(
      getApplicationInterviewAt(
        applications[1],
      ),
    ).toBe("2026-07-20");
  });

  test("getApplicationInterviewAt - Should reject final status", function () {
    expect(
      getApplicationInterviewAt({
        ...applications[1],
        status: "rejected",
      }),
    ).toBe("");
  });

  test("getApplicationInterviewAt - Should reject date before sent date", function () {
    expect(
      getApplicationInterviewAt({
        ...applications[1],
        interviewAt: "2026-06-30",
      }),
    ).toBe("");
  });

  test("getFollowUpDisplay - Should return overdue badge", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    expect(
      getFollowUpDisplay("2026-07-11"),
    ).toEqual({
      label: "En retard",
      className: "badge badge-error text-[10px]",
    });
  });

  test("getFollowUpDisplay - Should return today badge", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    expect(
      getFollowUpDisplay("2026-07-12"),
    ).toEqual({
      label: "Aujourd’hui",
      className: "badge badge-warning text-[10px]",
    });
  });

  test("getFollowUpDisplay - Should return tomorrow badge", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    expect(
      getFollowUpDisplay("2026-07-13"),
    ).toEqual({
      label: "Demain",
      className: "badge badge-info text-[10px]",
    });
  });

  test("getFollowUpDisplay - Should return near follow-up badge", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    expect(
      getFollowUpDisplay("2026-07-17"),
    ).toEqual({
      label: "Dans 5 jours",
      className: "badge badge-info text-[10px]",
    });
  });

  test("getFollowUpDisplay - Should return distant follow-up badge", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    expect(
      getFollowUpDisplay("2026-07-22"),
    ).toEqual({
      label: "Dans 10 jours",
      className: "badge badge-ghost text-[10px]",
    });
  });

  test("getFollowUpDisplay - Should return null for invalid date", function () {
    expect(
      getFollowUpDisplay("invalid-date"),
    ).toBeNull();
  });

  test("getFilteredApplications - Should filter by search", function () {
    expect(
      getFilteredApplications(
        applications,
        "wayne",
        "all",
      ),
    ).toEqual([
      applications[0],
    ]);
  });

  test("getFilteredApplications - Should ignore search accents and casing", function () {
    expect(
      getFilteredApplications(
        applications,
        "FRONTEND",
        "all",
      ),
    ).toEqual([
      applications[0],
    ]);
  });

  test("getFilteredApplications - Should filter by status", function () {
    expect(
      getFilteredApplications(
        applications,
        "",
        "interview",
      ),
    ).toEqual([
      applications[1],
    ]);
  });

  test("getFilteredApplications - Should combine search and status", function () {
    expect(
      getFilteredApplications(
        applications,
        "metropolis",
        "rejected",
      ),
    ).toEqual([
      applications[2],
    ]);
  });

  test("getSortedApplications - Should preserve array without key", function () {
    expect(
      getSortedApplications(
        applications,
        {
          key: "",
          direction: "asc",
        },
      ),
    ).toBe(applications);
  });

  test("getSortedApplications - Should sort companies ascending", function () {
    const result = getSortedApplications(
      applications,
      {
        key: "company",
        direction: "asc",
      },
    );

    expect(
      result.map(function (application) {
        return application.company;
      }),
    ).toEqual([
      "Daily Planet",
      "LexCorp",
      "Wayne Enterprises",
    ]);

    expect(result).not.toBe(applications);
  });

  test("getSortedApplications - Should sort companies descending", function () {
    const result = getSortedApplications(
      applications,
      {
        key: "company",
        direction: "desc",
      },
    );

    expect(
      result.map(function (application) {
        return application.company;
      }),
    ).toEqual([
      "Wayne Enterprises",
      "LexCorp",
      "Daily Planet",
    ]);
  });

  test("getSortedApplications - Should sort sent dates", function () {
    const result = getSortedApplications(
      applications,
      {
        key: "sentAt",
        direction: "desc",
      },
    );

    expect(
      result.map(function (application) {
        return application.id;
      }),
    ).toEqual([
      "application-three",
      "application-two",
      "application-one",
    ]);
  });

  test("getSortedApplications - Should place missing dates last", function () {
    const result = getSortedApplications(
      applications,
      {
        key: "followUpAt",
        direction: "asc",
      },
    );

    expect(result[0].id).toBe("application-one");
  });

  test("getNextSortDirection - Should start ascending", function () {
    expect(
      getNextSortDirection(
        {
          key: "",
          direction: "asc",
        },
        "company",
      ),
    ).toBe("asc");
  });

  test("getNextSortDirection - Should reverse current ascending sort", function () {
    expect(
      getNextSortDirection(
        {
          key: "company",
          direction: "asc",
        },
        "company",
      ),
    ).toBe("desc");
  });

  test("getNextSortDirection - Should restart ascending for another key", function () {
    expect(
      getNextSortDirection(
        {
          key: "company",
          direction: "desc",
        },
        "sentAt",
      ),
    ).toBe("asc");
  });
});

describe("Application history utilities", function () {
  test("getHistoryActionLabel - Should return known labels", function () {
    expect(
      getHistoryActionLabel(
        "application_created",
      ),
    ).toBe("Candidature créée");

    expect(
      getHistoryActionLabel(
        "application_updated",
      ),
    ).toBe("Candidature modifiée");

    expect(
      getHistoryActionLabel(
        "application_status_updated",
      ),
    ).toBe("Statut modifié");

    expect(
      getHistoryActionLabel("tag_linked"),
    ).toBe("Tag ajouté");

    expect(
      getHistoryActionLabel("tag_unlinked"),
    ).toBe("Tag retiré");

    expect(
      getHistoryActionLabel("contact_linked"),
    ).toBe("Contact ajouté");

    expect(
      getHistoryActionLabel("contact_unlinked"),
    ).toBe("Contact retiré");

    expect(
      getHistoryActionLabel("document_linked"),
    ).toBe("Document ajouté");

    expect(
      getHistoryActionLabel("document_unlinked"),
    ).toBe("Document retiré");
  });

  test("getHistoryActionLabel - Should return fallback label", function () {
    expect(
      getHistoryActionLabel("unknown"),
    ).toBe("Action enregistrée");
  });
});
