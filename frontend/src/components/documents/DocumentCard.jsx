import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import {
  CalendarDays,
  Download,
  File,
  FileImage,
  FileText,
  HardDrive,
  Trash2,
} from "lucide-react";

import { ItemCard, SectionCard } from "../ui/Cards";

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
    return <FileImage className="w-4 h-4 shrink-0 text-primary" />;
  }

  if (isPdfDocument(doc)) {
    return <FileText className="w-4 h-4 shrink-0 text-primary" />;
  }

  return <File className="w-4 h-4 shrink-0 text-primary" />;
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
      <div className="w-full h-full flex flex-col justify-center items-center gap-2 text-center text-base-content/50">
        <FileText className="w-5 h-5 text-primary" />

        <span className="text-xs">
          PDF
        </span>
      </div>
    );
  }

  return (
    <canvas
      className="w-full h-full object-contain"
      ref={canvasRef}
      aria-label="Aperçu PDF"
    />
  );
}

function DocumentPreview({
  doc,
  previewUrl,
  previewFailed,
  onPreviewDocument,
}) {
  return (
    <button
      className="w-28 h-40 mx-auto p-0 flex justify-center items-center overflow-hidden rounded-xl border border-base-300 bg-base-100 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer sm:w-full sm:h-full sm:min-h-36"
      type="button"
      onClick={function () {
        onPreviewDocument(doc);
      }}
      aria-label={"Agrandir l’aperçu de " + getDocumentName(doc)}
    >
      <div className="w-full h-full flex justify-center items-center aspect-[210/297] overflow-hidden rounded bg-white shadow-sm ring-1 ring-base-300 sm:min-h-32 sm:max-h-48">
        {previewUrl && isImageDocument(doc) && (
          <img
            className="w-full h-full object-cover"
            width="210"
            height="297"
            src={previewUrl}
            alt={"Aperçu de " + getDocumentName(doc)}
            loading="lazy"
            decoding="async"
          />
        )}

        {previewUrl && isPdfDocument(doc) && (
          <PdfThumbnail previewUrl={previewUrl} />
        )}

        {!previewUrl && (
          <div className="p-3 flex flex-col justify-center items-center gap-2 text-center text-base-content/50">
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

function DocumentInfoRow({ icon: Icon, children }) {
  return (
    <div className="w-full min-w-0 flex flex-row justify-start items-center gap-2">
      <Icon className="w-4 h-4 shrink-0 text-primary" />

      <span className="min-w-0 text-sm font-normal text-base-content/70 truncate">
        {children}
      </span>
    </div>
  );
}

function DocumentCardActions({
  doc,
  deleting,
  onDownloadDocument,
  onDeleteDocument,
}) {
  return (
    <div className="shrink-0 flex flex-row justify-end items-center gap-1">
      <button
        className="btn btn-ghost btn-sm btn-square cursor-pointer"
        type="button"
        onClick={function () {
          onDownloadDocument(doc);
        }}
        aria-label="Télécharger le document"
      >
        <Download className="w-4 h-4" />
      </button>

      <button
        className="btn btn-ghost btn-sm btn-square text-error cursor-pointer"
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
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

function DocumentInformationsBlock({
  doc,
  previewUrl,
  previewFailed,
  onPreviewDocument,
}) {
  return (
    <ItemCard>
      <div className="w-full min-w-0 grid gap-4 md:grid-cols-[minmax(0,1fr)_8rem]">
        <div className="w-full min-w-0">
          <h3 className="text-sm font-semibold text-base-content">
            Informations
          </h3>

          <div className="w-full mt-3 flex flex-col justify-start items-stretch gap-2">
            <DocumentInfoRow icon={FileText}>
              {getDocumentTypeLabel(doc)}
            </DocumentInfoRow>

            <div className="w-full min-w-0 flex flex-row justify-start items-center gap-2">
              {getDocumentIcon(doc)}

              <span className="min-w-0 text-sm font-normal text-base-content/70 truncate">
                {getDocumentExtensionLabel(doc)}
              </span>
            </div>

            <DocumentInfoRow icon={HardDrive}>
              {formatDocumentFileSize(getDocumentSize(doc))}
            </DocumentInfoRow>

            <DocumentInfoRow icon={CalendarDays}>
              {formatDocumentDate(getDocumentDate(doc))}
            </DocumentInfoRow>
          </div>
        </div>

        <div className="w-full flex justify-center items-start md:items-center">
          <DocumentPreview
            doc={doc}
            previewUrl={previewUrl}
            previewFailed={previewFailed}
            onPreviewDocument={onPreviewDocument}
          />
        </div>
      </div>
    </ItemCard>
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
    <SectionCard
      as="article"
      className="h-full min-h-80 flex flex-col justify-start items-stretch"
      contentClassName="flex flex-col flex-1 justify-start items-stretch gap-4"
      title={getDocumentName(doc)}
      description={getDocumentTypeLabel(doc)}
      rightElement={
        <DocumentCardActions
          doc={doc}
          deleting={deleting}
          onDownloadDocument={onDownloadDocument}
          onDeleteDocument={onDeleteDocument}
        />
      }
    >
      <DocumentInformationsBlock
        doc={doc}
        previewUrl={previewUrl}
        previewFailed={previewFailed}
        onPreviewDocument={onPreviewDocument}
      />
    </SectionCard>
  );
}

export default DocumentCard;
