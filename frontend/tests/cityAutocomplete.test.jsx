import {
  useState
} from "react";

import {
  cleanup,
  fireEvent,
  render,
  screen
} from "@testing-library/react";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi
} from "vitest";

import CityAutocomplete from "../src/components/applications/CityAutocomplete";

import {
  searchCities
} from "../src/api/cities.api";

vi.mock(
  "../src/api/cities.api",
  function () {
    return {
      searchCities: vi.fn()
    };
  }
);

const TOULOUSE = {
  code: "31555",
  name: "Toulouse",
  label:
    "Toulouse (31 - Haute-Garonne)",
  departmentCode: "31",
  departmentName: "Haute-Garonne",
  postalCodes: [
    "31000"
  ],
  latitude: 43.6043,
  longitude: 1.4437
};

function CityAutocompleteHarness({
  onCitySelect
}) {
  const [value, setValue] =
    useState("");

  function handleCitySelect(city) {
    setValue(city.name);
    onCitySelect(city);
  }

  return (
    <CityAutocomplete
      value={value}
      onValueChange={setValue}
      onCitySelect={
        handleCitySelect
      }
    />
  );
}

beforeEach(function () {
  vi.clearAllMocks();
});

afterEach(function () {
  cleanup();
});

describe(
  "CityAutocomplete",
  function () {
    test(
      "Should not search with one character",
      function () {
        render(
          <CityAutocompleteHarness
            onCitySelect={vi.fn()}
          />
        );

        fireEvent.change(
          screen.getByRole(
            "combobox",
            {
              name: "Ville"
            }
          ),
          {
            target: {
              value: "T"
            }
          }
        );

        expect(
          searchCities
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "Should select a city with the keyboard",
      async function () {
        searchCities.mockResolvedValueOnce([
          TOULOUSE
        ]);

        const onCitySelect = vi.fn();

        render(
          <CityAutocompleteHarness
            onCitySelect={
              onCitySelect
            }
          />
        );

        const input =
          screen.getByRole(
            "combobox",
            {
              name: "Ville"
            }
          );

        fireEvent.change(
          input,
          {
            target: {
              value: "Tou"
            }
          }
        );

        await screen.findByRole(
          "option",
          {
            name: "Toulouse"
          }
        );

        fireEvent.keyDown(
          input,
          {
            key: "ArrowDown"
          }
        );

        fireEvent.keyDown(
          input,
          {
            key: "Enter"
          }
        );

        expect(
          onCitySelect
        ).toHaveBeenCalledWith(
          TOULOUSE
        );

        expect(input).toHaveValue(
          "Toulouse"
        );
      }
    );

    test(
      "Should preserve manual entry when API fails",
      async function () {
        searchCities.mockRejectedValueOnce(
          new Error(
            "Service unavailable."
          )
        );

        render(
          <CityAutocompleteHarness
            onCitySelect={vi.fn()}
          />
        );

        const input =
          screen.getByRole(
            "combobox",
            {
              name: "Ville"
            }
          );

        fireEvent.change(
          input,
          {
            target: {
              value: "Lyon"
            }
          }
        );

        expect(
          await screen.findByText(
            /Recherche indisponible/
          )
        ).toBeInTheDocument();

        expect(input).toHaveValue(
          "Lyon"
        );
      }
    );
  }
);
