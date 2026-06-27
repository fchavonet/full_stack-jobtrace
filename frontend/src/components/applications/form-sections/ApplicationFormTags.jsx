import { X } from "lucide-react";

function getTagName(tag) {
  if (typeof tag === "string") {
    return tag;
  }

  if (tag && tag.tag && tag.tag.name) {
    return tag.tag.name;
  }

  if (tag && tag.name) {
    return tag.name;
  }

  return "Tag";
}

function getTagKey(tag) {
  if (typeof tag === "string") {
    return tag;
  }

  if (tag && tag.tag && tag.tag.id) {
    return tag.tag.id;
  }

  if (tag && tag.tagId) {
    return tag.tagId;
  }

  if (tag && tag.id) {
    return tag.id;
  }

  return getTagName(tag);
}

function getContainerClassName(className) {
  let containerClassName = "form-control w-full";

  if (className) {
    containerClassName = containerClassName + " " + className;
  }

  return containerClassName;
}

function getSelectIsDisabled(disabled, selectedTags, maxTagsPerApplication) {
  if (disabled) {
    return true;
  }

  if (selectedTags.length >= maxTagsPerApplication) {
    return true;
  }

  return false;
}

function ApplicationFormTags({
  className = "",
  title = "Tags",
  selectedTags = [],
  allowedTagOptions = [],
  maxTagsPerApplication = 3,
  tagSelectValue = "",
  disabled = false,
  onTagSelectChange,
  onRemoveTag,
}) {
  const selectIsDisabled = getSelectIsDisabled(
    disabled,
    selectedTags,
    maxTagsPerApplication,
  );

  return (
    <div className={getContainerClassName(className)}>
      <h3 className="font-semibold">
        {title}
      </h3>

      <select
        className="select select-bordered mt-4 w-full"
        value={tagSelectValue}
        onChange={onTagSelectChange}
        disabled={selectIsDisabled}
      >
        <option value="">
          Ajouter un tag
        </option>

        {allowedTagOptions.map(function (tagOption) {
          return (
            <option key={tagOption} value={tagOption}>
              {tagOption}
            </option>
          );
        })}
      </select>

      <div className="mt-4 flex h-20 items-center overflow-y-auto rounded-xl border border-dashed border-base-300 bg-base-200/50 p-4">
        {selectedTags.length === 0 && (
          <p className="text-sm text-base-content/60">
            Aucun tag associé.
          </p>
        )}

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(function (tag) {
              const tagName = getTagName(tag);
              const tagKey = getTagKey(tag);

              return (
                <span className="badge badge-primary gap-2 px-3 py-3 text-white" key={tagKey}>
                  {tagName}

                  <button
                    className="btn btn-ghost btn-xs btn-circle text-white hover:bg-primary-content/20"
                    type="button"
                    onClick={function () { onRemoveTag(tag); }}
                    disabled={disabled}
                    aria-label={"Retirer le tag " + tagName}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationFormTags;
