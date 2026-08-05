import {
  describe,
  expect,
  test
} from "vitest";

import {
  buildApplicationsLocationMapData
} from "../src/utils/statistics/locationMap.utils";

describe(
  "Applications location map coordinates",
  function () {
    test(
      "Should use stored coordinates for an unknown city",
      function () {
        const result =
          buildApplicationsLocationMapData([
            {
              id: "application-1",
              company: "Example",
              position: "Developer",
              location:
                "Saint-Bertrand-de-Comminges",
              locationCode: "31472",
              locationLatitude:
                43.0267,
              locationLongitude:
                0.5708
            }
          ]);

        expect(result).toHaveLength(1);

        expect(result[0]).toMatchObject({
          city:
            "Saint-Bertrand-de-Comminges",
          locationCode: "31472",
          latitude: 43.0267,
          longitude: 0.5708,
          count: 1
        });
      }
    );

    test(
      "Should group applications by INSEE code",
      function () {
        const result =
          buildApplicationsLocationMapData([
            {
              id: "application-1",
              location: "Toulouse",
              locationCode: "31555",
              locationLatitude:
                43.6043,
              locationLongitude:
                1.4437
            },
            {
              id: "application-2",
              location: "Toulouse",
              locationCode: "31555",
              locationLatitude:
                43.6043,
              locationLongitude:
                1.4437
            }
          ]);

        expect(result).toHaveLength(1);
        expect(result[0].count).toBe(2);
      }
    );

    test(
      "Should preserve legacy city fallback",
      function () {
        const result =
          buildApplicationsLocationMapData([
            {
              id: "application-1",
              location: "Toulouse"
            }
          ]);

        expect(result).toHaveLength(1);

        expect(result[0]).toMatchObject({
          city: "Toulouse",
          latitude: 43.6047,
          longitude: 1.4442,
          count: 1
        });
      }
    );
  }
);
