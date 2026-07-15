import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  createTag,
  listTags,
} from "../src/api/tags.api";

import {
  linkTagToApplication,
  unlinkTagFromApplication,
} from "../src/api/relations.api";

import {
  apiRequest,
} from "../src/api/client";

import ApplicationFormTags from "../src/components/applications/form-sections/ApplicationFormTags";

import {
  APPLICATION_ALLOWED_TAG_OPTIONS,
  APPLICATION_MAX_TAGS,
} from "../src/constants/application.constants";

import {
  getAllowedTagName,
  getApplicationTags,
  getExistingTagId,
  getTagId,
  getTagIsAlreadySelected,
  getTagName,
  getTagsFromApiResponse,
} from "../src/utils/applications/relations.utils";

import {
  TEST_APPLICATION,
  TEST_TAG,
} from "./helpers/test-data";

vi.mock("../src/api/client", function () {
  return {
    apiRequest: vi.fn(),
  };
});

beforeEach(function () {
  apiRequest.mockReset();
});

describe("Tags API", function () {
  test("GET /tags - Should list tags", async function () {
    const response = {
      success: true,
      data: {
        tags: [
          TEST_TAG,
        ],
      },
    };

    apiRequest.mockResolvedValue(response);

    const result = await listTags();

    expect(apiRequest).toHaveBeenCalledWith(
      "/tags",
      {
        method: "GET",
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("POST /tags - Should create tag", async function () {
    const payload = {
      name: "Urgent",
    };

    const response = {
      success: true,
      data: {
        tag: {
          ...TEST_TAG,
          name: "Urgent",
        },
      },
    };

    apiRequest.mockResolvedValue(response);

    const result = await createTag(payload);

    expect(apiRequest).toHaveBeenCalledWith(
      "/tags",
      {
        method: "POST",
        body: payload,
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("GET /tags - Should propagate API error", async function () {
    const apiError = {
      success: false,
      message: "Authentication required.",
      errors: [],
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      listTags(),
    ).rejects.toEqual(apiError);
  });

  test("POST /tags - Should propagate validation error", async function () {
    const apiError = {
      success: false,
      message: "Tag already exists.",
      errors: [],
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      createTag({
        name: "Urgent",
      }),
    ).rejects.toEqual(apiError);
  });
});

describe("Tag relations API", function () {
  test("POST /applications/:id/tags - Should link tag", async function () {
    const payload = {
      tagId: TEST_TAG.id,
    };

    const response = {
      success: true,
    };

    apiRequest.mockResolvedValue(response);

    const result = await linkTagToApplication(
      TEST_APPLICATION.id,
      payload,
    );

    expect(apiRequest).toHaveBeenCalledWith(
      "/applications/"
      + TEST_APPLICATION.id
      + "/tags",
      {
        method: "POST",
        body: {
          tagId: TEST_TAG.id,
        },
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("POST /applications/:id/tags - Should only send tag identifier", async function () {
    apiRequest.mockResolvedValue({
      success: true,
    });

    await linkTagToApplication(
      TEST_APPLICATION.id,
      {
        tagId: TEST_TAG.id,
        name: "Urgent",
        ignored: true,
      },
    );

    expect(apiRequest).toHaveBeenCalledWith(
      "/applications/"
      + TEST_APPLICATION.id
      + "/tags",
      {
        method: "POST",
        body: {
          tagId: TEST_TAG.id,
        },
        authenticated: true,
      },
    );
  });

  test("DELETE /applications/:id/tags/:tagId - Should unlink tag", async function () {
    const response = {
      success: true,
    };

    apiRequest.mockResolvedValue(response);

    const result = await unlinkTagFromApplication(
      TEST_APPLICATION.id,
      TEST_TAG.id,
    );

    expect(apiRequest).toHaveBeenCalledWith(
      "/applications/"
      + TEST_APPLICATION.id
      + "/tags/"
      + TEST_TAG.id,
      {
        method: "DELETE",
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("DELETE /applications/:id/tags/:tagId - Should propagate API error", async function () {
    const apiError = {
      success: false,
      message: "Tag relation not found.",
      errors: [],
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      unlinkTagFromApplication(
        TEST_APPLICATION.id,
        TEST_TAG.id,
      ),
    ).rejects.toEqual(apiError);
  });
});

describe("Tag constants", function () {
  test("APPLICATION_MAX_TAGS - Should limit applications to three tags", function () {
    expect(
      APPLICATION_MAX_TAGS,
    ).toBe(3);
  });

  test("APPLICATION_ALLOWED_TAG_OPTIONS - Should contain expected tags", function () {
    expect(
      APPLICATION_ALLOWED_TAG_OPTIONS,
    ).toEqual([
      "À préparer",
      "Candidature en ligne",
      "Candidature spontanée",
      "Entreprise cible",
      "Remise en main propre",
      "Réseau",
      "Télétravail possible",
      "Urgent",
    ]);
  });

  test("APPLICATION_ALLOWED_TAG_OPTIONS - Should contain unique values", function () {
    const uniqueTags = new Set(
      APPLICATION_ALLOWED_TAG_OPTIONS,
    );

    expect(
      uniqueTags.size,
    ).toBe(
      APPLICATION_ALLOWED_TAG_OPTIONS.length,
    );
  });
});

describe("Tag utilities", function () {
  test("getApplicationTags - Should return application tags", function () {
    const tags = [
      TEST_TAG,
    ];

    expect(
      getApplicationTags({
        tags,
      }),
    ).toBe(tags);
  });

  test("getApplicationTags - Should return empty array for missing application", function () {
    expect(
      getApplicationTags(null),
    ).toEqual([]);

    expect(
      getApplicationTags(undefined),
    ).toEqual([]);
  });

  test("getApplicationTags - Should return empty array for invalid tags", function () {
    expect(
      getApplicationTags({
        tags: null,
      }),
    ).toEqual([]);

    expect(
      getApplicationTags({
        tags: {},
      }),
    ).toEqual([]);
  });

  test("getAllowedTagName - Should return exact allowed tag", function () {
    expect(
      getAllowedTagName("Urgent"),
    ).toBe("Urgent");
  });

  test("getAllowedTagName - Should ignore casing", function () {
    expect(
      getAllowedTagName("URGENT"),
    ).toBe("Urgent");
  });

  test("getAllowedTagName - Should ignore accents and casing", function () {
    expect(
      getAllowedTagName("A PREPARER"),
    ).toBe("À préparer");
  });

  test("getAllowedTagName - Should trim spaces", function () {
    expect(
      getAllowedTagName("  Réseau  "),
    ).toBe("Réseau");
  });

  test("getAllowedTagName - Should reject unsupported tag", function () {
    expect(
      getAllowedTagName("Prioritaire"),
    ).toBe("");
  });

  test("getAllowedTagName - Should reject empty value", function () {
    expect(
      getAllowedTagName(""),
    ).toBe("");

    expect(
      getAllowedTagName(null),
    ).toBe("");
  });

  test("getTagName - Should return string tag", function () {
    expect(
      getTagName("Urgent"),
    ).toBe("Urgent");
  });

  test("getTagName - Should return nested tag name", function () {
    expect(
      getTagName({
        tag: {
          name: "Urgent",
        },
      }),
    ).toBe("Urgent");
  });

  test("getTagName - Should return direct tag name", function () {
    expect(
      getTagName({
        name: "Urgent",
      }),
    ).toBe("Urgent");
  });

  test("getTagName - Should return fallback", function () {
    expect(
      getTagName(null),
    ).toBe("Tag");

    expect(
      getTagName({}),
    ).toBe("Tag");
  });

  test("getTagId - Should return nested tag identifier", function () {
    expect(
      getTagId({
        tag: {
          id: "nested-tag-id",
        },
      }),
    ).toBe("nested-tag-id");
  });

  test("getTagId - Should return relation tag identifier", function () {
    expect(
      getTagId({
        tagId: "relation-tag-id",
      }),
    ).toBe("relation-tag-id");
  });

  test("getTagId - Should return direct identifier", function () {
    expect(
      getTagId({
        id: "direct-tag-id",
      }),
    ).toBe("direct-tag-id");
  });

  test("getTagId - Should return empty identifier", function () {
    expect(
      getTagId(null),
    ).toBe("");

    expect(
      getTagId({}),
    ).toBe("");
  });

  test("getTagIsAlreadySelected - Should detect string tag", function () {
    expect(
      getTagIsAlreadySelected(
        [
          "Urgent",
        ],
        "urgent",
      ),
    ).toBe(true);
  });

  test("getTagIsAlreadySelected - Should detect nested tag", function () {
    expect(
      getTagIsAlreadySelected(
        [
          {
            tag: {
              name: "À préparer",
            },
          },
        ],
        "A PREPARER",
      ),
    ).toBe(true);
  });

  test("getTagIsAlreadySelected - Should return false when tag is absent", function () {
    expect(
      getTagIsAlreadySelected(
        [
          "Urgent",
        ],
        "Réseau",
      ),
    ).toBe(false);
  });

  test("getExistingTagId - Should return matching identifier", function () {
    expect(
      getExistingTagId(
        [
          {
            id: "urgent-tag-id",
            name: "Urgent",
          },
        ],
        "URGENT",
      ),
    ).toBe("urgent-tag-id");
  });

  test("getExistingTagId - Should ignore accents", function () {
    expect(
      getExistingTagId(
        [
          {
            id: "prepare-tag-id",
            name: "À préparer",
          },
        ],
        "A PREPARER",
      ),
    ).toBe("prepare-tag-id");
  });

  test("getExistingTagId - Should return empty identifier when absent", function () {
    expect(
      getExistingTagId(
        [
          TEST_TAG,
        ],
        "Urgent",
      ),
    ).toBe("");
  });

  test("getTagsFromApiResponse - Should return direct list", function () {
    const tags = [
      TEST_TAG,
    ];

    expect(
      getTagsFromApiResponse(tags),
    ).toEqual(tags);
  });

  test("getTagsFromApiResponse - Should return nested list", function () {
    const tags = [
      TEST_TAG,
    ];

    expect(
      getTagsFromApiResponse({
        data: {
          tags,
        },
      }),
    ).toEqual(tags);
  });

  test("getTagsFromApiResponse - Should return empty list", function () {
    expect(
      getTagsFromApiResponse({}),
    ).toEqual([]);
  });
});

describe("Application form tags", function () {
  test("ApplicationFormTags - Should display default title", function () {
    render(
      <ApplicationFormTags
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Tags",
        },
      ),
    ).toBeInTheDocument();
  });

  test("ApplicationFormTags - Should display custom title", function () {
    render(
      <ApplicationFormTags
        title="Étiquettes"
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Étiquettes",
        },
      ),
    ).toBeInTheDocument();
  });

  test("ApplicationFormTags - Should display empty state", function () {
    render(
      <ApplicationFormTags
        selectedTags={[]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "Aucun tag associé.",
      ),
    ).toBeInTheDocument();
  });

  test("ApplicationFormTags - Should display allowed options", function () {
    render(
      <ApplicationFormTags
        allowedTagOptions={
          APPLICATION_ALLOWED_TAG_OPTIONS
        }
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "option",
        {
          name: "Ajouter un tag",
        },
      ),
    ).toBeInTheDocument();

    APPLICATION_ALLOWED_TAG_OPTIONS.forEach(
      function (tagName) {
        expect(
          screen.getByRole(
            "option",
            {
              name: tagName,
            },
          ),
        ).toBeInTheDocument();
      },
    );
  });

  test("ApplicationFormTags - Should display string tags", function () {
    render(
      <ApplicationFormTags
        selectedTags={[
          "Urgent",
          "Réseau",
        ]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Urgent"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Réseau"),
    ).toBeInTheDocument();
  });

  test("ApplicationFormTags - Should display direct object tag", function () {
    render(
      <ApplicationFormTags
        selectedTags={[
          {
            id: "urgent-tag-id",
            name: "Urgent",
          },
        ]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Urgent"),
    ).toBeInTheDocument();
  });

  test("ApplicationFormTags - Should display nested object tag", function () {
    render(
      <ApplicationFormTags
        selectedTags={[
          {
            tagId: "urgent-tag-id",
            tag: {
              id: "urgent-tag-id",
              name: "Urgent",
            },
          },
        ]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Urgent"),
    ).toBeInTheDocument();
  });

  test("ApplicationFormTags - Should display fallback tag name", function () {
    render(
      <ApplicationFormTags
        selectedTags={[
          {},
        ]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Tag"),
    ).toBeInTheDocument();
  });

  test("ApplicationFormTags - Should call selection callback", async function () {
    const user = userEvent.setup();
    const selectedValues = [];

    function handleTagSelectChange(event) {
      selectedValues.push(event.target.value);
    }

    render(
      <ApplicationFormTags
        allowedTagOptions={[
          "Urgent",
          "Réseau",
        ]}
        tagSelectValue=""
        onTagSelectChange={handleTagSelectChange}
        onRemoveTag={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "Urgent",
    );

    expect(selectedValues).toEqual([
      "Urgent",
    ]);
  });

  test("ApplicationFormTags - Should call remove callback with string tag", async function () {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();

    render(
      <ApplicationFormTags
        selectedTags={[
          "Urgent",
        ]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={onRemoveTag}
      />,
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Retirer le tag Urgent",
        },
      ),
    );

    expect(
      onRemoveTag,
    ).toHaveBeenCalledWith("Urgent");
  });

  test("ApplicationFormTags - Should call remove callback with object tag", async function () {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();

    const tag = {
      id: "urgent-tag-id",
      name: "Urgent",
    };

    render(
      <ApplicationFormTags
        selectedTags={[
          tag,
        ]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={onRemoveTag}
      />,
    );

    await user.click(
      screen.getByRole(
        "button",
        {
          name: "Retirer le tag Urgent",
        },
      ),
    );

    expect(
      onRemoveTag,
    ).toHaveBeenCalledWith(tag);
  });

  test("ApplicationFormTags - Should disable select when disabled", function () {
    render(
      <ApplicationFormTags
        disabled={true}
        allowedTagOptions={[
          "Urgent",
        ]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("combobox"),
    ).toBeDisabled();
  });

  test("ApplicationFormTags - Should disable remove buttons when disabled", function () {
    render(
      <ApplicationFormTags
        disabled={true}
        selectedTags={[
          "Urgent",
        ]}
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByRole(
        "button",
        {
          name: "Retirer le tag Urgent",
        },
      ),
    ).toBeDisabled();
  });

  test("ApplicationFormTags - Should disable select at maximum tag count", function () {
    render(
      <ApplicationFormTags
        selectedTags={[
          "Urgent",
          "Réseau",
          "Entreprise cible",
        ]}
        maxTagsPerApplication={3}
        allowedTagOptions={
          APPLICATION_ALLOWED_TAG_OPTIONS
        }
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("combobox"),
    ).toBeDisabled();
  });

  test("ApplicationFormTags - Should keep select enabled below maximum", function () {
    render(
      <ApplicationFormTags
        selectedTags={[
          "Urgent",
          "Réseau",
        ]}
        maxTagsPerApplication={3}
        allowedTagOptions={
          APPLICATION_ALLOWED_TAG_OPTIONS
        }
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("combobox"),
    ).not.toBeDisabled();
  });

  test("ApplicationFormTags - Should apply custom class name", function () {
    const {
      container,
    } = render(
      <ApplicationFormTags
        className="custom-class"
        onTagSelectChange={vi.fn()}
        onRemoveTag={vi.fn()}
      />,
    );

    expect(
      container.firstChild,
    ).toHaveClass("form-control");

    expect(
      container.firstChild,
    ).toHaveClass("w-full");

    expect(
      container.firstChild,
    ).toHaveClass("custom-class");
  });
});
