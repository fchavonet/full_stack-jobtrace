import DocumentUploadFields from "../../documents/DocumentUploadFields";

function ApplicationFormDocument({
  documentOptions,
  documentMode,
  selectedDocumentId,
  documentForm,
  documentsLoading,
  documentsError,
  fileInputResetKey,
  onDocumentModeChange,
  onSelectedDocumentChange,
  onDocumentTypeChange,
  onDocumentFileChange,
}) {
  return (
    <section className="rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
      <div>
        <h3 className="text-lg font-semibold">
          Document associé
        </h3>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="form-control w-full">
          <span className="label mb-1">
            Action document
          </span>

          <select
            className="select select-bordered w-full"
            value={documentMode}
            onChange={onDocumentModeChange}
          >
            <option value="none">
              Aucun document
            </option>

            <option value="existing">
              Sélectionner un document existant
            </option>

            <option value="upload">
              Ajouter un nouveau document
            </option>
          </select>
        </label>

        {documentMode === "existing" && (
          <div className="grid gap-2">
            {documentsLoading && (
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <span className="loading loading-spinner loading-sm" />
                Chargement des documents...
              </div>
            )}

            {documentsError && (
              <div className="alert alert-warning">
                <span>
                  Les documents existants ne peuvent pas être chargés pour le moment.
                </span>
              </div>
            )}

            {!documentsLoading && !documentsError && documentOptions.length === 0 && (
              <div className="alert">
                <span>
                  Aucun document existant disponible.
                </span>
              </div>
            )}

            {!documentsLoading && !documentsError && documentOptions.length > 0 && (
              <label className="form-control w-full">
                <span className="label mb-1">
                  Document existant
                </span>

                <select
                  className="select select-bordered w-full"
                  value={selectedDocumentId}
                  onChange={onSelectedDocumentChange}
                >
                  <option value="">
                    Aucun document sélectionné
                  </option>

                  {documentOptions.map(function (documentOption) {
                    return (
                      <option key={documentOption.id} value={documentOption.id}>
                        {documentOption.label}
                      </option>
                    );
                  })}
                </select>
              </label>
            )}
          </div>
        )}

        {documentMode === "upload" && (
          <DocumentUploadFields
            documentType={documentForm.type}
            fileInputResetKey={fileInputResetKey}
            onDocumentTypeChange={onDocumentTypeChange}
            onDocumentFileChange={onDocumentFileChange}
          />
        )}
      </div>
    </section>
  );
}

export default ApplicationFormDocument;
