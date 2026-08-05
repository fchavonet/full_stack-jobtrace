import {
  useEffect,
  useId,
  useRef,
  useState
} from "react";

import {
  searchCities
} from "../../api/cities.api";

const SEARCH_DELAY_MS = 300;
const MIN_CITY_QUERY_LENGTH = 2;

function getOptionId(
  listboxId,
  index
) {
  return listboxId
    + "-option-"
    + index;
}

function CityAutocomplete({
  value,
  onValueChange,
  onCitySelect,
  disabled = false
}) {
  const generatedId = useId();

  const inputId =
    generatedId + "-input";

  const listboxId =
    generatedId + "-listbox";

  const statusId =
    generatedId + "-status";

  const skipNextSearchRef =
    useRef(false);

  const [suggestions, setSuggestions] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState(false);

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    highlightedIndex,
    setHighlightedIndex
  ] = useState(-1);

  useEffect(
    function () {
      const query =
        String(value || "").trim();

      const abortController =
        new AbortController();

      let searchDelay =
        SEARCH_DELAY_MS;

      if (
        skipNextSearchRef.current
        || query.length
          < MIN_CITY_QUERY_LENGTH
      ) {
        searchDelay = 0;
      }

      const timeoutId =
        window.setTimeout(
          async function () {
            if (
              skipNextSearchRef.current
            ) {
              skipNextSearchRef.current =
                false;

              setSuggestions([]);
              setLoading(false);
              setSearchError(false);
              setIsOpen(false);
              setHighlightedIndex(-1);

              return;
            }

            if (
              query.length
                < MIN_CITY_QUERY_LENGTH
            ) {
              setSuggestions([]);
              setLoading(false);
              setSearchError(false);
              setIsOpen(false);
              setHighlightedIndex(-1);

              return;
            }

            setLoading(true);
            setSearchError(false);

            try {
              const cities =
                await searchCities(
                  query,
                  {
                    signal:
                      abortController.signal
                  }
                );

              if (
                abortController.signal
                  .aborted
              ) {
                return;
              }

              setSuggestions(cities);
              setIsOpen(
                cities.length > 0
              );
              setHighlightedIndex(-1);
            } catch (error) {
              if (
                error
                && error.name
                  === "AbortError"
              ) {
                return;
              }

              setSuggestions([]);
              setIsOpen(false);
              setSearchError(true);
              setHighlightedIndex(-1);
            } finally {
              if (
                !abortController.signal
                  .aborted
              ) {
                setLoading(false);
              }
            }
          },
          searchDelay
        );

      return function () {
        window.clearTimeout(
          timeoutId
        );

        abortController.abort();
      };
    },
    [value]
  );

  function handleInputChange(event) {
    setHighlightedIndex(-1);
    setSearchError(false);

    onValueChange(
      event.target.value
    );
  }

  function selectCity(city) {
    skipNextSearchRef.current =
      true;

    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);

    onCitySelect(city);
  }

  function handleInputFocus() {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  }

  function handleInputBlur() {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event) {
    if (
      event.key === "Escape"
    ) {
      setIsOpen(false);
      setHighlightedIndex(-1);

      return;
    }

    if (
      suggestions.length === 0
    ) {
      return;
    }

    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setIsOpen(true);

      setHighlightedIndex(
        function (currentIndex) {
          const nextIndex =
            currentIndex + 1;

          if (
            nextIndex
              >= suggestions.length
          ) {
            return 0;
          }

          return nextIndex;
        }
      );

      return;
    }

    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      setIsOpen(true);

      setHighlightedIndex(
        function (currentIndex) {
          const nextIndex =
            currentIndex - 1;

          if (nextIndex < 0) {
            return suggestions.length
              - 1;
          }

          return nextIndex;
        }
      );

      return;
    }

    if (
      event.key === "Enter"
      && isOpen
      && highlightedIndex >= 0
    ) {
      event.preventDefault();

      selectCity(
        suggestions[
          highlightedIndex
        ]
      );
    }
  }

  let activeDescendant;

  if (
    highlightedIndex >= 0
    && highlightedIndex
      < suggestions.length
  ) {
    activeDescendant =
      getOptionId(
        listboxId,
        highlightedIndex
      );
  }

  return (
    <div className="form-control w-full">
      <label
        className="label mb-1"
        htmlFor={inputId}
      >
        Ville
      </label>

      <div className="relative">
        <input
          id={inputId}
          className="input input-bordered w-full"
          name="location"
          type="text"
          autoComplete="off"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher une ville..."
          disabled={disabled}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            activeDescendant
          }
          aria-describedby={statusId}
          aria-busy={loading}
        />

        {loading && (
          <span
            className="loading loading-spinner loading-sm absolute right-3 top-3"
            aria-hidden="true"
          />
        )}

        {isOpen && (
          <ul
            id={listboxId}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-1 shadow-lg"
            role="listbox"
          >
            {suggestions.map(
              function (city, index) {
                let optionClassName =
                  "w-full rounded-lg px-3 py-2 text-left hover:bg-base-200 focus:bg-base-200 focus:outline-none";

                if (
                  index
                    === highlightedIndex
                ) {
                  optionClassName +=
                    " bg-base-200";
                }

                return (
                  <li
                    key={city.code}
                  >
                    <button
                      id={getOptionId(
                        listboxId,
                        index
                      )}
                      className={
                        optionClassName
                      }
                      type="button"
                      role="option"
                      aria-selected={
                        index
                          === highlightedIndex
                      }
                      onMouseDown={
                        function (event) {
                          event.preventDefault();
                        }
                      }
                      onClick={
                        function () {
                          selectCity(city);
                        }
                      }
                    >
                      <span className="block font-medium">
                        {city.name}
                      </span>
                    </button>
                  </li>
                );
              }
            )}
          </ul>
        )}
      </div>

      <div
        id={statusId}
        className="mt-1 min-h-5 text-xs text-base-content/60"
        role="status"
        aria-live="polite"
      >
        {searchError && (
          <span>
            Recherche indisponible.
            Vous pouvez saisir la ville
            manuellement.
          </span>
        )}

        {!searchError
          && !loading
          && value.trim().length >= 2
          && suggestions.length === 0
          && (
            <span>
              Saisissez une ville puis
              sélectionnez une proposition.
            </span>
          )}
      </div>
    </div>
  );
}

export default CityAutocomplete;
