import { CalendarDays, Download, File, FileImage, FileText, HardDrive, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

import {
  formatDocumentDate,
  formatDocumentFileSize,
  getDocumentDate,
  getDocumentExtensionLabel,
  getDocumentName,
  getDocumentSize,
  getDocumentTypeLabel,
  isImageDocument,
  isPdfDocument,
} from "../../utils/documents/document.utils";

GlobalWorkerOptions.workerSrc = pdfWorker;

function getDocumentIcon(doc) {
  if (isImageDocument(doc)) {
    return <FileImage className="h-4 w-4 shrink-0 text-primary" />;
  }

  if (isPdfDocument(doc)) {
    return <FileText className="h-4 w-4 shrink-0 text-primary" />;
  }

  return <File className="h-4 w-4 shrink-0 text-primary" />;
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
      className="mx-auto flex h-40 w-28 items-center justify-center overflow-hidden rounded-xl border border-base-300 bg-base-100 p-0 transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:h-full sm:min-h-36 sm:w-full"
      type="button"
      onClick={function () {
        onPreviewDocument(doc);
      }}
      aria-label={"Agrandir l’aperçu de " + getDocumentName(doc)}
    >
      <div className="flex aspect-[210/297] h-full w-full items-center justify-center overflow-hidden rounded bg-white shadow-sm ring-1 ring-base-300 sm:max-h-48 sm:min-h-32">
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
    <article className="flex h-auto w-full min-w-0 flex-col rounded-2xl bg-base-100 p-4 shadow-sm sm:h-80 sm:p-5">
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

      <div className="mt-4 min-w-0 overflow-hidden rounded-xl border border-base-300 bg-base-200/50 p-3 text-sm text-base-content/70 sm:min-h-0 sm:flex-1">
        <div className="grid min-w-0 gap-4 sm:h-full sm:grid-cols-[minmax(0,1fr)_8rem] sm:gap-3">
          <div className="flex min-w-0 flex-col justify-center gap-3">
            <div className="flex min-w-0 items-center gap-2 text-base-content/70">
              {getDocumentIcon(doc)}

              <span className="truncate">
                {getDocumentTypeLabel(doc)} · {getDocumentExtensionLabel(doc)}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-base-content/70">
              <HardDrive className="h-4 w-4 shrink-0 text-primary" />

              <span className="truncate">
                {formatDocumentFileSize(getDocumentSize(doc))}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2 text-base-content/70">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" />

              <span className="truncate">
                {formatDocumentDate(getDocumentDate(doc))}
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
