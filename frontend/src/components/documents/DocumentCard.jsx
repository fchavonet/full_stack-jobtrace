import { CalendarDays, Download, File, FileImage, FileText, HardDrive, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

function fixDocumentNameEncoding(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const hasBrokenEncoding =
    value.includes("Ã") ||
    value.includes("Â") ||
    value.includes("â") ||
    value.includes("Ì") ||
    value.includes("�") ||
    /[\u0080-\u009F]/.test(value);

  if (!hasBrokenEncoding) {
    return value.normalize("NFC");
  }

  try {
    const bytes = Uint8Array.from(value, function (character) {
      return character.charCodeAt(0);
    });

    const decodedValue = new TextDecoder("utf-8").decode(bytes);

    if (!decodedValue.includes("�")) {
      return decodedValue.normalize("NFC");
    }
  } catch {
    return value.normalize("NFC");
  }

  return value.normalize("NFC");
}

function removeControlCharacters(value) {
  let cleanedValue = "";

  for (const character of value) {
    const characterCode = character.charCodeAt(0);
    const isControlCharacter =
      characterCode <= 31 ||
      (characterCode >= 127 && characterCode <= 159);

    if (!isControlCharacter) {
      cleanedValue += character;
    }
  }

  return cleanedValue;
}

function cleanDocumentName(value) {
  const fixedValue = fixDocumentNameEncoding(value);
  const safeFileName = fixedValue.replace(/[\\/]/g, "-");

  return removeControlCharacters(safeFileName).trim();
}

function getDocumentName(doc) {
  if (!doc) {
    return "Document sans nom";
  }

  if (doc.originalName) {
    const name = cleanDocumentName(doc.originalName);

    if (name) {
      return name;
    }
  }

  if (doc.original_name) {
    const name = cleanDocumentName(doc.original_name);

    if (name) {
      return name;
    }
  }

  if (doc.name) {
    const name = cleanDocumentName(doc.name);

    if (name) {
      return name;
    }
  }

  return "Document sans nom";
}

function getDocumentMimeType(doc) {
  if (doc.mimeType) {
    return doc.mimeType;
  }

  if (doc.mime_type) {
    return doc.mime_type;
  }

  return "";
}

function getDocumentSize(doc) {
  if (typeof doc.size === "number") {
    return doc.size;
  }

  return 0;
}

function getDocumentDate(doc) {
  if (doc.createdAt) {
    return doc.createdAt;
  }

  if (doc.created_at) {
    return doc.created_at;
  }

  return "";
}

function getDocumentType(doc) {
  if (doc.type) {
    return doc.type;
  }

  return "document";
}

function getDocumentTypeLabel(doc) {
  const type = getDocumentType(doc);

  if (type === "resume") {
    return "CV";
  }

  if (type === "cover_letter") {
    return "Lettre de motivation";
  }

  return "Document";
}

function getDocumentExtension(doc) {
  const name = getDocumentName(doc);
  const parts = name.split(".");

  if (parts.length <= 1) {
    return "FICHIER";
  }

  return parts[parts.length - 1].toUpperCase();
}

function isImageDocument(doc) {
  const mimeType = getDocumentMimeType(doc);
  const extension = getDocumentExtension(doc).toLowerCase();

  if (mimeType.startsWith("image/")) {
    return true;
  }

  if (extension === "png") {
    return true;
  }

  if (extension === "jpg") {
    return true;
  }

  if (extension === "jpeg") {
    return true;
  }

  return false;
}

function isPdfDocument(doc) {
  const mimeType = getDocumentMimeType(doc);
  const extension = getDocumentExtension(doc).toLowerCase();

  if (mimeType === "application/pdf") {
    return true;
  }

  if (extension === "pdf") {
    return true;
  }

  return false;
}

function getDocumentIcon(doc) {
  if (isImageDocument(doc)) {
    return <FileImage className="h-4 w-4 shrink-0 text-primary" />;
  }

  if (isPdfDocument(doc)) {
    return <FileText className="h-4 w-4 shrink-0 text-primary" />;
  }

  return <File className="h-4 w-4 shrink-0 text-primary" />;
}

function formatFileSize(size) {
  const value = Number(size);

  if (!Number.isFinite(value) || value <= 0) {
    return "Taille inconnue";
  }

  if (value < 1024) {
    return value + " o";
  }

  if (value < 1024 * 1024) {
    return Math.round(value / 1024) + " Ko";
  }

  return (value / 1024 / 1024).toFixed(1) + " Mo";
}

function formatDate(value) {
  if (!value) {
    return "Date inconnue";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleDateString("fr-FR");
}

async function cleanupPdfDocument(pdfDocument) {
  if (!pdfDocument) {
    return;
  }

  if (typeof pdfDocument.cleanup === "function") {
    await pdfDocument.cleanup();
  }
}

function drawFullPdfPage(sourceCanvas, targetCanvas) {
  const targetContext = targetCanvas.getContext("2d");

  targetCanvas.width = sourceCanvas.width;
  targetCanvas.height = sourceCanvas.height;

  targetContext.drawImage(sourceCanvas, 0, 0);
}

function PdfThumbnail({ previewUrl }) {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(function () {
    let cancelled = false;

    async function renderPdfThumbnail() {
      if (!previewUrl) {
        return;
      }

      try {
        setFailed(false);

        const response = await fetch(previewUrl);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        const loadingTask = getDocument({
          data,
        });

        const pdfDocument = await loadingTask.promise;
        const page = await pdfDocument.getPage(1);
        const viewport = page.getViewport({
          scale: 2,
        });

        const sourceCanvas = window.document.createElement("canvas");
        const sourceContext = sourceCanvas.getContext("2d");

        sourceCanvas.width = viewport.width;
        sourceCanvas.height = viewport.height;

        await page.render({
          canvasContext: sourceContext,
          viewport,
        }).promise;

        if (cancelled) {
          await cleanupPdfDocument(pdfDocument);
          return;
        }

        const targetCanvas = canvasRef.current;

        if (!targetCanvas) {
          await cleanupPdfDocument(pdfDocument);
          return;
        }

        drawFullPdfPage(sourceCanvas, targetCanvas);
        await cleanupPdfDocument(pdfDocument);
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    }

    renderPdfThumbnail();

    return function cleanup() {
      cancelled = true;
    };
  }, [previewUrl]);

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-base-content/50">
        <FileText className="h-5 w-5 text-primary" />

        <span className="text-xs">
          PDF
        </span>
      </div>
    );
  }

  return (
    <canvas
      className="h-full w-full object-contain"
      ref={canvasRef}
      aria-label="Aperçu PDF"
    />
  );
}

function DocumentPreview({ doc, previewUrl, previewFailed, onPreviewDocument }) {
  return (
    <button
      className="flex h-full min-h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-100 p-0 transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
      type="button"
      onClick={function () {
        onPreviewDocument(doc);
      }}
      aria-label={"Agrandir l’aperçu de " + getDocumentName(doc)}
    >
      <div className="flex aspect-[210/297] h-full max-h-48 min-h-32 w-full items-center justify-center overflow-hidden rounded bg-white shadow-sm ring-1 ring-base-300">
        {previewUrl && isImageDocument(doc) && (
          <img
            className="h-full w-full object-cover"
            src={previewUrl}
            alt={"Aperçu de " + getDocumentName(doc)}
          />
        )}

        {previewUrl && isPdfDocument(doc) && (
          <PdfThumbnail previewUrl={previewUrl} />
        )}

        {!previewUrl && (
          <div className="flex flex-col items-center justify-center gap-2 p-3 text-center text-base-content/50">
            {getDocumentIcon(doc)}

            {!previewFailed && (
              <span className="text-xs">
                Aperçu
              </span>
            )}

            {previewFailed && (
              <span className="text-xs">
                Indisponible
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function DocumentCard({
  doc,
  previewUrl,
  previewFailed,
  deleting,
  onPreviewDocument,
  onDownloadDocument,
  onDeleteDocument,
}) {
  return (
    <article className="flex h-80 flex-col rounded-2xl bg-base-100 p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">
            {getDocumentName(doc)}
          </h2>

          <p className="truncate text-sm text-base-content/60">
            {getDocumentTypeLabel(doc)}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            className="btn btn-ghost btn-sm btn-square"
            type="button"
            onClick={function () {
              onDownloadDocument(doc);
            }}
            aria-label="Télécharger le document"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            className="btn btn-ghost btn-sm btn-square text-error"
            type="button"
            onClick={function () {
              onDeleteDocument(doc);
            }}
            disabled={deleting}
            aria-label="Supprimer le document"
          >
            {deleting && (
              <span className="loading loading-spinner loading-xs" />
            )}

            {!deleting && (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-base-300 bg-base-200/50 p-3 text-sm text-base-content/70">
        <div className="grid h-full gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <div className="flex min-w-0 flex-col justify-center gap-3">
            <div className="flex min-w-0 items-center gap-2 text-base-content/70">
              {getDocumentIcon(doc)}

              <span className="truncate">
                {getDocumentTypeLabel(doc)} · {getDocumentExtension(doc)}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-base-content/70">
              <HardDrive className="h-4 w-4 shrink-0 text-primary" />

              <span className="truncate">
                {formatFileSize(getDocumentSize(doc))}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-base-content/70">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" />

              <span className="truncate">
                {formatDate(getDocumentDate(doc))}
              </span>
            </div>
          </div>

          <DocumentPreview
            doc={doc}
            previewUrl={previewUrl}
            previewFailed={previewFailed}
            onPreviewDocument={onPreviewDocument}
          />
        </div>
      </div>
    </article>
  );
}

export default DocumentCard;
