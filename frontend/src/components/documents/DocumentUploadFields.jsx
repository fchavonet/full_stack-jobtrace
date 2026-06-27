function DocumentUploadFields({
  documentType,
  fileInputResetKey,
  disabled = false,
  includeOtherType = false,
  showHelp = false,
  onDocumentTypeChange,
  onDocumentFileChange,
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="form-control w-full">
          <span className="label mb-1">
            Type de document
          </span>

          <select
            className="select select-bordered w-full"
            value={documentType}
            onChange={onDocumentTypeChange}
            disabled={disabled}
          >
            <option value="resume">
              CV
            </option>

            <option value="cover_letter">
              Lettre de motivation
            </option>

            {includeOtherType && (
              <option value="other">
                Autre document
              </option>
            )}
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label mb-1">
            Fichier
          </span>

          <input
            key={fileInputResetKey}
            className="file-input file-input-bordered w-full"
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={onDocumentFileChange}
            disabled={disabled}
          />
        </label>
      </div>

      {showHelp && (
        <div className="mt-4 rounded-xl border border-base-300 bg-base-100 p-3 text-sm text-base-content/70">
          <p>
            Formats acceptés : PDF, DOC, DOCX, PNG, JPG, JPEG.
          </p>

          <p>
            Taille maximale : 5 Mo.
          </p>
        </div>
      )}
    </>
  );
}

export default DocumentUploadFields;
