import { Search as SearchIcon } from "lucide-react";

import { SectionCard } from "./Cards";

function Search({
  title,
  description,
  value,
  placeholder,
  resultLabel,
  onChange,
}) {
  return (
    <SectionCard
      title={title}
      description={description}
      rightElement={
        <p className="shrink-0 text-sm text-base-content/60">
          {resultLabel}
        </p>
      }
    >
      <label className="input input-bordered w-full flex flex-row justify-start items-center gap-2">
        <SearchIcon className="w-4 h-4 text-base-content/40" aria-hidden="true" />

        <input
          className="grow"
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={title || placeholder || "Rechercher"}
        />
      </label>
    </SectionCard>
  );
}

export default Search;
