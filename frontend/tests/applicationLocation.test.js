import {
  describe,
  expect,
  test
} from "vitest";

import {
  buildApplicationPayload
} from "../src/utils/applications/payload.utils";

import {
  buildAnnouncementUpdatePayload,
  getEditFormFromApplication,
  getNextApplicationEditForm
} from "../src/utils/applications/detailsForm.utils";

const BASE_FORM = {
  company: "Airbus",
  position: "Développeur",
  status: "sent",
  contractType: "permanent",
  location: "Toulouse",
  locationCode: "31555",
  locationLatitude: 43.6043,
  locationLongitude: 1.4437,
  salary: "45000",
  link: "",
  sentAt: "2026-08-05",
  followUpAt: "",
  interviewAt: "",
  notes: ""
};

describe(
  "Application location payload",
  function () {
    test(
      "Should include selected city coordinates",
      function () {
        const payload =
          buildApplicationPayload(
            BASE_FORM
          );

        expect(payload).toMatchObject({
          location: "Toulouse",
          locationCode: "31555",
          locationLatitude: 43.6043,
          locationLongitude: 1.4437
        });
      }
    );

    test(
      "Should omit coordinates for free text location",
      function () {
        const payload =
          buildApplicationPayload({
            ...BASE_FORM,
            location: "Télétravail",
            locationCode: "",
            locationLatitude: null,
            locationLongitude: null
          });

        expect(
          payload.location
        ).toBe("Télétravail");

        expect(payload).not.toHaveProperty(
          "locationCode"
        );

        expect(payload).not.toHaveProperty(
          "locationLatitude"
        );

        expect(payload).not.toHaveProperty(
          "locationLongitude"
        );
      }
    );

    test(
      "Should restore location data in edit form",
      function () {
        const form =
          getEditFormFromApplication({
            ...BASE_FORM,
            salary: 45000,
            sentAt:
              "2026-08-05T00:00:00.000Z",
            followUpAt: null,
            interviewAt: null
          });

        expect(form).toMatchObject({
          location: "Toulouse",
          locationCode: "31555",
          locationLatitude: 43.6043,
          locationLongitude: 1.4437
        });
      }
    );

    test(
      "Should clear coordinates after manual location change",
      function () {
        const form =
          getNextApplicationEditForm({
            currentForm: BASE_FORM,
            fieldName: "location",
            value: "Télétravail",
            followUpDelayDays: 15
          });

        expect(form).toMatchObject({
          location: "Télétravail",
          locationCode: "",
          locationLatitude: null,
          locationLongitude: null
        });
      }
    );

    test(
      "Should send null coordinates when clearing a selected city",
      function () {
        const payload =
          buildAnnouncementUpdatePayload({
            ...BASE_FORM,
            location: "Télétravail",
            locationCode: "",
            locationLatitude: null,
            locationLongitude: null
          });

        expect(payload).toMatchObject({
          location: "Télétravail",
          locationCode: null,
          locationLatitude: null,
          locationLongitude: null
        });
      }
    );
  }
);
