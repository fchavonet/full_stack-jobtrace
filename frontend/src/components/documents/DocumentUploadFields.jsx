import { FileText, HardDrive } from "lucide-react";

import { ItemCard } from "../ui/Cards";

function DocumentUploadHelp() {
  return (
    <ItemCard className="mt-4">
      <div className="w-full flex flex-col justify-start items-stretch gap-3">
        <div className="min-w-0 flex flex-row justify-start items-start gap-2">
          <FileText className="w-4 h-4 shrink-0 mt-0.5 text-primary" />

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-base-content">
              Formats acceptés
            </h3>

            <p className="mt-1 text-sm text-primary">
              DOC, DOCX, PDF, JPG & JPEG, PNG
            </p>
          </div>
        </div>

        <div className="min-w-0 flex flex-row justify-start items-start gap-2">
          <HardDrive className="w-4 h-4 shrink-0 mt-0.5 text-primary" />

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-base-content">
              Taille maximale
            </h3>

            <p className="mt-1 text-sm text-primary">
              5 Mo
            </p>
          </div>
        </div>
      </div>
    </ItemCard>
  );
}

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
        <DocumentUploadHelp />
      )}
    </>
  );
}

export default DocumentUploadFields;
