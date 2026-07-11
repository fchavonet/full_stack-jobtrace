import { CalendarDays, FileImage, FileText, HardDrive } from "lucide-react";

import { ItemCard } from "../ui/Cards";

import { formatDocumentDate, formatDocumentFileSize, getDocumentDate, getDocumentExtensionLabel, getDocumentName, getDocumentSize, getDocumentTypeLabel, isImageDocument, isPdfDocument } from "../../utils/documents/document.utils";

function getDocumentIcon(document) {
  if (isImageDocument(document)) {
    return FileImage;
  }

  if (isPdfDocument(document)) {
    return FileText;
  }

  return File;
}

function DocumentSummaryRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="w-full min-w-0 flex flex-row justify-start items-center gap-2">
      <Icon className="w-4 h-4 shrink-0 text-primary" />

      <span className="shrink-0 text-sm text-base-content/50">
        {label} :
      </span>

      <span className="min-w-0 text-sm text-base-content/70 truncate">
        {value}
      </span>
    </div>
  );
}

function DocumentSummaryCard({
  document,
  rightElement,
}) {
  const DocumentIcon = getDocumentIcon(document);

  return (
    <ItemCard className="border border-base-300 bg-base-200/50">
      <div className="w-full min-w-0 flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="w-full min-w-0">
          <div className="w-full min-w-0 flex flex-row justify-start items-start gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-base-content truncate">
                {getDocumentName(document)}
              </h3>

              <p className="mt-1 text-xs text-base-content/60 truncate">
                {getDocumentTypeLabel(document)}
              </p>
            </div>
          </div>

          <div className="w-full mt-4 grid gap-2">
            <DocumentSummaryRow
              icon={FileText}
              label="Type"
              value={getDocumentTypeLabel(document)}
            />

            <DocumentSummaryRow
              icon={FileImage}
              label="Format"
              value={getDocumentExtensionLabel(document)}
            />

            <DocumentSummaryRow
              icon={HardDrive}
              label="Taille"
              value={formatDocumentFileSize(getDocumentSize(document))}
            />

            <DocumentSummaryRow
              icon={CalendarDays}
              label="Ajout"
              value={formatDocumentDate(getDocumentDate(document))}
            />
          </div>
        </div>

        {rightElement && (
          <div className="shrink-0">
            {rightElement}
          </div>
        )}
      </div>
    </ItemCard>
  );
}

export default DocumentSummaryCard;