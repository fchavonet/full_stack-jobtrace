import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from "../src/api/contacts.api";

import ContactCard from "../src/components/contacts/ContactCard";
import ContactModal from "../src/components/contacts/ContactModal";
import ContactSummaryCard from "../src/components/contacts/ContactSummaryCard";

import {
  getContactFromResponse,
  getContactLabel,
  getContactModalKey,
  getContactName,
  getFilteredContacts,
} from "../src/utils/contacts/contact.utils";

import {
  TEST_CONTACT,
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

afterEach(function () {
  vi.unstubAllGlobals();
});

describe("Contacts API", function () {
  test("GET /contacts - Should list contacts", async function () {
    const response = {
      success: true,
      data: {
        contacts: [
          TEST_CONTACT,
        ],
      },
    };

    const fetchMock = mockJsonResponse(response);

    const result = await listContacts();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/contacts",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        authenticated: true,
      }),
    );

    expect(result).toEqual(response);
  });

  test("POST /contacts - Should create contact", async function () {
    const payload = {
      firstName: "Bruce",
      lastName: "Wayne",
      company: "Wayne Enterprises",
      position: "Chief Executive Officer",
    };

    const response = {
      success: true,
      data: {
        contact: TEST_CONTACT,
      },
    };

    const fetchMock = mockJsonResponse(response);

    const result = await createContact(payload);
    const requestOptions = getFetchRequestOptions(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/contacts",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        authenticated: true,
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

  test("PATCH /contacts/:id - Should update contact", async function () {
    const payload = {
      position: "CEO",
    };

    const response = {
      success: true,
      data: {
        contact: {
          ...TEST_CONTACT,
          position: "CEO",
        },
      },
    };

    const fetchMock = mockJsonResponse(response);

    const result = await updateContact(
      TEST_CONTACT.id,
      payload,
    );

    const requestOptions = getFetchRequestOptions(fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/contacts/"
      + TEST_CONTACT.id,
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        authenticated: true,
      }),
    );

    expect(requestOptions.body).toBe(
      JSON.stringify(payload),
    );

    expect(result).toEqual(response);
  });

  test("DELETE /contacts/:id - Should delete contact", async function () {
    const response = {
      success: true,
      message: "Contact deleted.",
    };

    const fetchMock = mockJsonResponse(response);

    const result = await deleteContact(
      TEST_CONTACT.id,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/contacts/"
      + TEST_CONTACT.id,
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
        authenticated: true,
      }),
    );

    expect(result).toEqual(response);
  });

  test("GET /contacts - Should throw API error", async function () {
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
      listContacts(),
    ).rejects.toEqual(apiError);
  });
});

describe("Contact utilities", function () {
  test("getContactFromResponse - Should return direct contact", function () {
    expect(
      getContactFromResponse(TEST_CONTACT),
    ).toEqual(TEST_CONTACT);
  });

  test("getContactFromResponse - Should return contact from response data", function () {
    expect(
      getContactFromResponse({
        data: {
          contact: TEST_CONTACT,
        },
      }),
    ).toEqual(TEST_CONTACT);
  });

  test("getContactFromResponse - Should return null when contact is missing", function () {
    expect(
      getContactFromResponse({}),
    ).toBeNull();
  });

  test("getContactModalKey - Should return contact identifier", function () {
    expect(
      getContactModalKey(TEST_CONTACT),
    ).toBe(TEST_CONTACT.id);
  });

  test("getContactModalKey - Should return key for new contact", function () {
    expect(
      getContactModalKey(null),
    ).toBe("new-contact");
  });

  test("getContactName - Should return full name", function () {
    expect(
      getContactName(TEST_CONTACT),
    ).toBe("Bruce Wayne");
  });

  test("getContactName - Should return first name only", function () {
    expect(
      getContactName({
        firstName: "Bruce",
      }),
    ).toBe("Bruce");
  });

  test("getContactName - Should return last name only", function () {
    expect(
      getContactName({
        lastName: "Wayne",
      }),
    ).toBe("Wayne");
  });

  test("getContactName - Should support nested contact", function () {
    expect(
      getContactName({
        contact: TEST_CONTACT,
      }),
    ).toBe("Bruce Wayne");
  });

  test("getContactName - Should return fallback when name is missing", function () {
    expect(
      getContactName({}),
    ).toBe("Contact sans nom");
  });

  test("getContactLabel - Should return contact name", function () {
    expect(
      getContactLabel(TEST_CONTACT),
    ).toBe("Bruce Wayne");
  });

  test("getContactLabel - Should include position and company", function () {
    expect(
      getContactLabel(
        TEST_CONTACT,
        true,
      ),
    ).toBe(
      "Bruce Wayne - Chief Executive Officer chez Wayne Enterprises",
    );
  });

  test("getContactLabel - Should include position without company", function () {
    expect(
      getContactLabel(
        {
          firstName: "Bruce",
          position: "CEO",
        },
        true,
      ),
    ).toBe("Bruce - CEO");
  });

  test("getContactLabel - Should include company without position", function () {
    expect(
      getContactLabel(
        {
          firstName: "Bruce",
          company: "Wayne Enterprises",
        },
        true,
      ),
    ).toBe("Bruce - Wayne Enterprises");
  });

  test("getContactLabel - Should use email when name is missing", function () {
    expect(
      getContactLabel({
        email: "bruce.wayne@jobtrace.test",
      }),
    ).toBe("bruce.wayne@jobtrace.test");
  });

  test("getFilteredContacts - Should preserve contacts without search", function () {
    const contacts = [
      TEST_CONTACT,
    ];

    expect(
      getFilteredContacts(
        contacts,
        "",
      ),
    ).toBe(contacts);
  });

  test("getFilteredContacts - Should filter by first name", function () {
    expect(
      getFilteredContacts(
        [
          TEST_CONTACT,
        ],
        "bruce",
      ),
    ).toEqual([
      TEST_CONTACT,
    ]);
  });

  test("getFilteredContacts - Should filter by last name", function () {
    expect(
      getFilteredContacts(
        [
          TEST_CONTACT,
        ],
        "wayne",
      ),
    ).toEqual([
      TEST_CONTACT,
    ]);
  });

  test("getFilteredContacts - Should filter by company", function () {
    expect(
      getFilteredContacts(
        [
          TEST_CONTACT,
        ],
        "enterprises",
      ),
    ).toEqual([
      TEST_CONTACT,
    ]);
  });

  test("getFilteredContacts - Should filter by position", function () {
    expect(
      getFilteredContacts(
        [
          TEST_CONTACT,
        ],
        "chief executive",
      ),
    ).toEqual([
      TEST_CONTACT,
    ]);
  });

  test("getFilteredContacts - Should filter by email", function () {
    expect(
      getFilteredContacts(
        [
          TEST_CONTACT,
        ],
        "jobtrace.test",
      ),
    ).toEqual([
      TEST_CONTACT,
    ]);
  });

  test("getFilteredContacts - Should ignore casing and accents", function () {
    const contact = {
      ...TEST_CONTACT,
      firstName: "Élodie",
      lastName: "Durand",
    };

    expect(
      getFilteredContacts(
        [
          contact,
        ],
        "ELODIE",
      ),
    ).toEqual([
      contact,
    ]);
  });

  test("getFilteredContacts - Should return empty array without match", function () {
    expect(
      getFilteredContacts(
        [
          TEST_CONTACT,
        ],
        "LexCorp",
      ),
    ).toEqual([]);
  });
});

describe("Contact card", function () {
  test("ContactCard - Should display contact information", function () {
    render(
      <ContactCard
        contact={{
          ...TEST_CONTACT,
          phoneNumber: "0102030405",
        }}
        onEditContact={vi.fn()}
        onDeleteContact={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Bruce Wayne",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Chief Executive Officer chez Wayne Enterprises",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "link",
        {
          name: "0102030405",
        },
      ),
    ).toHaveAttribute(
      "href",
      "tel:0102030405",
    );
  });

  test("ContactCard - Should display information fallbacks", function () {
    render(
      <ContactCard
        contact={{
          id: "empty-contact",
          firstName: "",
          lastName: "",
          position: "",
          company: "",
          email: "",
          phoneNumber: "",
          linkedinUrl: "",
          notes: "",
        }}
        onEditContact={vi.fn()}
        onDeleteContact={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Contact sans nom"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Informations professionnelles non renseignées",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Email non renseigné"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Téléphone non renseigné"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("LinkedIn non renseigné"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Aucune note renseignée."),
    ).toBeInTheDocument();
  });

  test("ContactCard - Should normalize phone link", function () {
    render(
      <ContactCard
        contact={{
          ...TEST_CONTACT,
          phoneNumber: "+33 6 12 34 56 78",
        }}
        onEditContact={vi.fn()}
        onDeleteContact={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "link",
        {
          name: "+33 6 12 34 56 78",
        },
      ),
    ).toHaveAttribute(
      "href",
      "tel:+33612345678",
    );
  });

  test("ContactCard - Should add protocol to LinkedIn URL", function () {
    render(
      <ContactCard
        contact={{
          ...TEST_CONTACT,
          linkedinUrl: "www.linkedin.com/in/bruce-wayne",
        }}
        onEditContact={vi.fn()}
        onDeleteContact={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "link",
        {
          name: "LinkedIn",
        },
      ),
    ).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/bruce-wayne",
    );
  });

  test("ContactCard - Should reject invalid LinkedIn URL", function () {
    render(
      <ContactCard
        contact={{
          ...TEST_CONTACT,
          linkedinUrl: "https://example.com/bruce",
        }}
        onEditContact={vi.fn()}
        onDeleteContact={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole(
        "link",
        {
          name: "LinkedIn",
        },
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("LinkedIn non renseigné"),
    ).toBeInTheDocument();
  });

  test("ContactCard - Should call edit callback", async function () {
    const user = userEvent.setup();
    const onEditContact = vi.fn();

    render(
      <ContactCard
        contact={TEST_CONTACT}
        onEditContact={onEditContact}
        onDeleteContact={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Modifier le contact",
        },
      ),
    );

    expect(onEditContact).toHaveBeenCalledWith(
      TEST_CONTACT,
    );
  });

  test("ContactCard - Should call delete callback", async function () {
    const user = userEvent.setup();
    const onDeleteContact = vi.fn();

    render(
      <ContactCard
        contact={TEST_CONTACT}
        onEditContact={vi.fn()}
        onDeleteContact={onDeleteContact}
      />,
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Supprimer le contact",
        },
      ),
    );

    expect(onDeleteContact).toHaveBeenCalledWith(
      TEST_CONTACT,
    );
  });

  test("ContactCard - Should truncate long notes", function () {
    const notes = "A".repeat(310);

    render(
      <ContactCard
        contact={{
          ...TEST_CONTACT,
          notes,
        }}
        onEditContact={vi.fn()}
        onDeleteContact={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "A".repeat(300) + "...",
      ),
    ).toBeInTheDocument();
  });
});

describe("Contact summary card", function () {
  test("ContactSummaryCard - Should display nested contact", function () {
    render(
      <ContactSummaryCard
        contact={{
          contact: {
            ...TEST_CONTACT,
            phoneNumber: "0102030405",
          },
        }}
      />,
    );

    expect(
      screen.getByText("Bruce Wayne"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Chief Executive Officer chez Wayne Enterprises",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "link",
        {
          name: "0102030405",
        },
      ),
    ).toHaveAttribute(
      "href",
      "tel:0102030405",
    );
  });

  test("ContactSummaryCard - Should display right element", function () {
    render(
      <ContactSummaryCard
        contact={TEST_CONTACT}
        rightElement={
          <button type="button">
            Détacher
          </button>
        }
      />,
    );

    expect(
      screen.getByRole(
        "button",
        {
          name: "Détacher",
        },
      ),
    ).toBeInTheDocument();
  });

  test("ContactSummaryCard - Should display notes", function () {
    render(
      <ContactSummaryCard
        contact={{
          ...TEST_CONTACT,
          notes: "Contact principal.",
        }}
      />,
    );

    expect(
      screen.getByText("Contact principal."),
    ).toBeInTheDocument();
  });
});

describe("Contact modal", function () {
  test("ContactModal - Should display creation form", function () {
    render(
      <ContactModal
        contact={null}
        isOpen={true}
        submitting={false}
        onClose={vi.fn()}
        onSubmitContact={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Nouveau contact",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "button",
        {
          name: "Enregistrer le contact",
        },
      ),
    ).toBeInTheDocument();
  });

  test("ContactModal - Should preload contact values", function () {
    render(
      <ContactModal
        contact={{
          ...TEST_CONTACT,
          phoneNumber: "0102030405",
        }}
        isOpen={true}
        submitting={false}
        onClose={vi.fn()}
        onSubmitContact={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Modifier le contact",
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Bruce"),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Wayne"),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        "Wayne Enterprises",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "button",
        {
          name: "Enregistrer les modifications",
        },
      ),
    ).toBeInTheDocument();
  });

  test("ContactModal - Should submit trimmed payload", async function () {
    const user = userEvent.setup();
    const onSubmitContact = vi.fn().mockResolvedValue();

    render(
      <ContactModal
        contact={null}
        isOpen={true}
        submitting={false}
        onClose={vi.fn()}
        onSubmitContact={onSubmitContact}
      />,
    );

    await user.type(
      screen.getByLabelText("Prénom"),
      "  Bruce  ",
    );

    await user.type(
      screen.getByLabelText("Nom"),
      "  Wayne  ",
    );

    await user.type(
      screen.getByLabelText("Entreprise"),
      "  Wayne Enterprises  ",
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Enregistrer le contact",
        },
      ),
    );

    expect(onSubmitContact).toHaveBeenCalledWith({
      firstName: "Bruce",
      lastName: "Wayne",
      position: "",
      email: "",
      phoneNumber: "",
      company: "Wayne Enterprises",
      linkedinUrl: "",
      notes: "",
    });
  });

  test("ContactModal - Should update notes counter", function () {
    render(
      <ContactModal
        contact={null}
        isOpen={true}
        submitting={false}
        onClose={vi.fn()}
        onSubmitContact={vi.fn()}
      />,
    );

    const notesField = document.querySelector(
      "textarea[name=\"notes\"]",
    );

    expect(notesField).toBeInTheDocument();

    fireEvent.change(
      notesField,
      {
        target: {
          value: "Batman",
        },
      },
    );

    expect(
      screen.getByText(/6\s*\/\s*300/),
    ).toBeInTheDocument();
  });

  test("ContactModal - Should call close callback", async function () {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ContactModal
        contact={null}
        isOpen={true}
        submitting={false}
        onClose={onClose}
        onSubmitContact={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Annuler",
        },
      ),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("ContactModal - Should prevent closing while submitting", async function () {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ContactModal
        contact={null}
        isOpen={true}
        submitting={true}
        onClose={onClose}
        onSubmitContact={vi.fn()}
      />,
    );

    const cancelButton = screen.getByRole(
      "button",
      {
        name: "Annuler",
      },
    );

    expect(cancelButton).toBeDisabled();

    await user.click(cancelButton);

    expect(onClose).not.toHaveBeenCalled();
  });
});