import {
  afterEach,
  describe,
  expect,
  test,
  vi
} from "vitest";

import {
  searchCities
} from "../src/api/cities.api";

function createJsonResponse(
  data,
  options = {}
) {
  let ok = true;
  let status = 200;

  if (
    typeof options.ok
      === "boolean"
  ) {
    ok = options.ok;
  }

  if (
    Number.isInteger(
      options.status
    )
  ) {
    status = options.status;
  }

  return {
    ok,
    status,
    json:
      vi.fn().mockResolvedValue(
        data
      )
  };
}

afterEach(function () {
  vi.unstubAllGlobals();
});

describe("Cities API", function () {
  test(
    "Should not request a query shorter than two characters",
    async function () {
      const fetchMock = vi.fn();

      vi.stubGlobal(
        "fetch",
        fetchMock
      );

      const cities =
        await searchCities(" T ");

      expect(cities).toEqual([]);

      expect(
        fetchMock
      ).not.toHaveBeenCalled();
    }
  );

  test(
    "Should retrieve and sanitize city coordinates",
    async function () {
      const fetchMock =
        vi.fn().mockResolvedValue(
          createJsonResponse({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {
                  nom: "Toulouse",
                  code: "31555",
                  codesPostaux: [
                    "31000",
                    "31100"
                  ],
                  departement: {
                    code: "31",
                    nom:
                      "Haute-Garonne"
                  }
                },
                geometry: {
                  type: "Point",
                  coordinates: [
                    1.4437,
                    43.6043
                  ]
                }
              }
            ]
          })
        );

      vi.stubGlobal(
        "fetch",
        fetchMock
      );

      const cities =
        await searchCities(" Tou ");

      expect(
        fetchMock
      ).toHaveBeenCalledTimes(1);

      const requestUrl =
        new URL(
          fetchMock.mock.calls[0][0]
        );

      expect(
        requestUrl.searchParams.get(
          "nom"
        )
      ).toBe("Tou");

      expect(
        requestUrl.searchParams.get(
          "format"
        )
      ).toBe("geojson");

      expect(
        requestUrl.searchParams.get(
          "geometry"
        )
      ).toBe("centre");

      expect(
        requestUrl.searchParams.get(
          "boost"
        )
      ).toBe("population");

      expect(cities).toEqual([
        {
          code: "31555",
          name: "Toulouse",
          label:
            "Toulouse (31 - Haute-Garonne)",
          departmentCode: "31",
          departmentName:
            "Haute-Garonne",
          postalCodes: [
            "31000",
            "31100"
          ],
          latitude: 43.6043,
          longitude: 1.4437
        }
      ]);
    }
  );

  test(
    "Should ignore malformed features",
    async function () {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          createJsonResponse({
            type:
              "FeatureCollection",
            features: [
              {
                properties: {
                  nom: "Ville invalide",
                  code: "00000"
                },
                geometry: null
              }
            ]
          })
        )
      );

      const cities =
        await searchCities(
          "Ville"
        );

      expect(cities).toEqual([]);
    }
  );

  test(
    "Should reject an API error",
    async function () {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          createJsonResponse(
            {},
            {
              ok: false,
              status: 503
            }
          )
        )
      );

      await expect(
        searchCities("Lyon")
      ).rejects.toMatchObject({
        message:
          "Unable to search cities.",
        statusCode: 503
      });
    }
  );

  test(
    "Should forward the abort signal",
    async function () {
      const fetchMock =
        vi.fn().mockResolvedValue(
          createJsonResponse({
            type:
              "FeatureCollection",
            features: []
          })
        );

      vi.stubGlobal(
        "fetch",
        fetchMock
      );

      const abortController =
        new AbortController();

      await searchCities(
        "Bordeaux",
        {
          signal:
            abortController.signal
        }
      );

      expect(
        fetchMock.mock.calls[0][1]
          .signal
      ).toBe(
        abortController.signal
      );
    }
  );
});
