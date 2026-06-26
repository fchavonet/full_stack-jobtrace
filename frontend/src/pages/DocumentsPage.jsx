import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  deleteDocument,
  getDocumentDirectUrl,
  getDocumentFile,
  listDocuments,
  uploadDocument,
} from "../api/documents.api";
import DocumentCard from "../components/documents/DocumentCard";
import DocumentModal from "../components/documents/DocumentModal";
import DocumentPreviewModal from "../components/documents/DocumentPreviewModal";
import { useToast } from "../hooks/useToast";

function getListFromResponse(response, listName) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response[listName])) {
    return response[listName];
  }

  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && response.data && Array.isArray(response.data[listName])) {
    return response.data[listName];
  }

  return [];
}

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

function getDocumentExtension(doc) {
  const name = getDocumentName(doc);
  const parts = name.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
}

function isImageDocument(doc) {
  const mimeType = getDocumentMimeType(doc);
  const extension = getDocumentExtension(doc);

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
  const extension = getDocumentExtension(doc);

  if (mimeType === "application/pdf") {
    return true;
  }

  if (extension === "pdf") {
    return true;
  }

  return false;
}

function canPreviewDocument(doc) {
  if (isImageDocument(doc)) {
    return true;
  }

  if (isPdfDocument(doc)) {
    return true;
  }

  return false;
}

function normalizeValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getDocumentSearchValue(doc) {
  return normalizeValue(
    [
      getDocumentName(doc),
      doc.type,
      getDocumentMimeType(doc),
      getDocumentExtension(doc),
    ].join(" "),
  );
}

function getFilteredDocuments(documents, searchValue) {
  const normalizedSearch = normalizeValue(searchValue);

  if (!normalizedSearch) {
    return documents;
  }

  return documents.filter(function (doc) {
    return getDocumentSearchValue(doc).includes(normalizedSearch);
  });
}

function revokeUrl(url) {
  if (!url) {
    return;
  }

  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function revokePreviewUrls(previewUrls) {
  Object.values(previewUrls).forEach(function (previewUrl) {
    revokeUrl(previewUrl);
  });
}

const maxDocumentFileSize = 5 * 1024 * 1024;

const allowedDocumentExtensions = [
  "pdf",
  "doc",
  "docx",
  "png",
  "jpg",
  "jpeg",
];

const allowedDocumentMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

function getSelectedFileExtension(file) {
  const parts = file.name.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
}

function validateDocumentFile(file) {
  if (!file) {
    return "Sélectionnez un fichier.";
  }

  const extension = getSelectedFileExtension(file);

  if (!allowedDocumentExtensions.includes(extension)) {
    return "Format non accepté. Formats autorisés : PDF, DOC, DOCX, PNG, JPG, JPEG.";
  }

  if (!allowedDocumentMimeTypes.includes(file.type)) {
    return "Type de fichier non accepté. Vérifiez que le fichier est un PDF, DOC, DOCX, PNG, JPG ou JPEG valide.";
  }

  if (file.size > maxDocumentFileSize) {
    return "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.";
  }

  return "";
}

function getUploadErrorMessage(error) {
  if (!error) {
    return "Impossible d’ajouter le document.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.message === "Only PDF, DOC, DOCX, PNG, JPG and JPEG files are allowed.") {
    return "Format non accepté. Formats autorisés : PDF, DOC, DOCX, PNG, JPG, JPEG.";
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.";
  }

  if (error.message && error.message.includes("File too large")) {
    return "Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.";
  }

  if (error.message && error.message.includes("Unexpected field")) {
    return "Le fichier n’a pas été envoyé correctement. Le champ attendu est “document”.";
  }

  if (error.message) {
    return error.message;
  }

  if (error.error) {
    return error.error;
  }

  return "Impossible d’ajouter le document.";
}

function DocumentsPage() {
  const { showToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [previewUrls, setPreviewUrls] = useState({});
  const [previewFailures, setPreviewFailures] = useState({});
  const [selectedPreviewDocument, setSelectedPreviewDocument] = useState(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedPreviewFailed, setSelectedPreviewFailed] = useState(false);

  const previewUrlsRef = useRef({});

  const displayedDocuments = useMemo(function () {
    return getFilteredDocuments(documents, searchValue);
  }, [documents, searchValue]);

  async function getPreviewUrl(doc) {
    if (previewUrlsRef.current[doc.id]) {
      return previewUrlsRef.current[doc.id];
    }

    const directUrl = getDocumentDirectUrl(doc);

    if (directUrl) {
      previewUrlsRef.current = {
        ...previewUrlsRef.current,
        [doc.id]: directUrl,
      };

      setPreviewUrls(function (currentPreviewUrls) {
        return {
          ...currentPreviewUrls,
          [doc.id]: directUrl,
        };
      });

      return directUrl;
    }

    const file = await getDocumentFile(doc.id);
    const previewUrl = URL.createObjectURL(file.blob);

    previewUrlsRef.current = {
      ...previewUrlsRef.current,
      [doc.id]: previewUrl,
    };

    setPreviewUrls(function (currentPreviewUrls) {
      return {
        ...currentPreviewUrls,
        [doc.id]: previewUrl,
      };
    });

    return previewUrl;
  }

  async function loadPreviewForDocuments(nextDocuments) {
    const nextPreviewUrls = {};
    const nextPreviewFailures = {};

    for (const doc of nextDocuments) {
      if (canPreviewDocument(doc)) {
        try {
          const directUrl = getDocumentDirectUrl(doc);

          if (directUrl) {
            nextPreviewUrls[doc.id] = directUrl;
          }

          if (!directUrl) {
            const file = await getDocumentFile(doc.id);
            nextPreviewUrls[doc.id] = URL.createObjectURL(file.blob);
          }
        } catch {
          nextPreviewFailures[doc.id] = true;
        }
      }
    }

    revokePreviewUrls(previewUrlsRef.current);
    previewUrlsRef.current = nextPreviewUrls;
    setPreviewUrls(nextPreviewUrls);
    setPreviewFailures(nextPreviewFailures);
  }

  async function loadDocuments() {
    try {
      const response = await listDocuments();
      const nextDocuments = getListFromResponse(response, "documents");

      setDocuments(nextDocuments);
      await loadPreviewForDocuments(nextDocuments);
    } catch {
      showToast("Impossible de charger les documents.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    let mounted = true;

    async function loadInitialDocuments() {
      try {
        const response = await listDocuments();
        const nextDocuments = getListFromResponse(response, "documents");

        if (!mounted) {
          return;
        }

        setDocuments(nextDocuments);
        await loadPreviewForDocuments(nextDocuments);
      } catch {
        if (mounted) {
          showToast("Impossible de charger les documents.", "error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInitialDocuments();

    return function cleanup() {
      mounted = false;
      revokePreviewUrls(previewUrlsRef.current);
    };
  }, [showToast]);

  function openDocumentModal() {
    setModalOpen(true);
  }

  function closeDocumentModal() {
    if (submitting) {
      return;
    }

    setModalOpen(false);
  }

  function handleSearchChange(event) {
    setSearchValue(event.target.value);
  }

  async function handleSubmitDocument(form) {
    const validationError = validateDocumentFile(form.file);

    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("document", form.file);

      await uploadDocument(formData);
      await loadDocuments();

      setModalOpen(false);
      showToast("Document ajouté.", "success");
    } catch (error) {
      const message = getUploadErrorMessage(error);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePreviewDocument(doc) {
    setSelectedPreviewDocument(doc);
    setSelectedPreviewUrl("");
    setSelectedPreviewFailed(false);

    if (!canPreviewDocument(doc)) {
      setSelectedPreviewFailed(true);
      return;
    }

    if (previewFailures[doc.id]) {
      setSelectedPreviewFailed(true);
      return;
    }

    setPreviewLoading(true);

    try {
      const previewUrl = await getPreviewUrl(doc);
      setSelectedPreviewUrl(previewUrl);
    } catch {
      setSelectedPreviewFailed(true);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreviewModal() {
    setSelectedPreviewDocument(null);
    setSelectedPreviewUrl("");
    setSelectedPreviewFailed(false);
    setPreviewLoading(false);
  }

  async function handleDownloadDocument(doc) {
    const directUrl = getDocumentDirectUrl(doc);

    if (directUrl) {
      const link = window.document.createElement("a");
      link.href = directUrl;
      link.download = getDocumentName(doc);
      link.target = "_blank";
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      return;
    }

    try {
      const file = await getDocumentFile(doc.id);
      const downloadUrl = URL.createObjectURL(file.blob);
      const link = window.document.createElement("a");

      link.href = downloadUrl;
      link.download = getDocumentName(doc);
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);
    } catch {
      showToast("Impossible de télécharger le document.", "error");
    }
  }

  async function handleDeleteDocument(doc) {
    const confirmed = window.confirm("Supprimer ce document ?");

    if (!confirmed) {
      return;
    }

    setDeletingId(doc.id);

    try {
      await deleteDocument(doc.id);

      if (previewUrlsRef.current[doc.id]) {
        revokeUrl(previewUrlsRef.current[doc.id]);
      }

      const nextPreviewUrls = {
        ...previewUrlsRef.current,
      };

      delete nextPreviewUrls[doc.id];

      previewUrlsRef.current = nextPreviewUrls;
      setPreviewUrls(nextPreviewUrls);

      setDocuments(function (currentDocuments) {
        return currentDocuments.filter(function (currentDocument) {
          return currentDocument.id !== doc.id;
        });
      });

      showToast("Document supprimé.", "success");
    } catch {
      showToast("Impossible de supprimer le document.", "error");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Documents
          </h1>

          <p className="text-base-content/70">
            Retrouvez vos CV, lettres de motivation et fichiers associés.
          </p>
        </div>

        <button
          className="btn btn-primary text-white"
          type="button"
          onClick={openDocumentModal}
        >
          <Plus className="h-5 w-5" />
          Nouveau document
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-base-100 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="input input-bordered flex w-full items-center gap-2 lg:max-w-xl">
            <Search className="h-4 w-4 text-base-content/40" />

            <input
              className="grow"
              type="search"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Rechercher un document..."
            />
          </label>

          <p className="text-sm text-base-content/60">
            {displayedDocuments.length} document(s) affiché(s) sur {documents.length}
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      {!loading && documents.length === 0 && (
        <div className="mt-6 rounded-2xl bg-base-100 p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">
            Aucun document pour le moment
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Ajoutez votre premier document.
          </p>
        </div>
      )}

      {!loading && documents.length > 0 && displayedDocuments.length === 0 && (
        <div className="mt-6 rounded-2xl bg-base-100 p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">
            Aucun résultat
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Modifiez votre recherche pour afficher des documents.
          </p>
        </div>
      )}

      {!loading && displayedDocuments.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayedDocuments.map(function (doc) {
            return (
              <DocumentCard
                key={doc.id}
                doc={doc}
                previewUrl={previewUrls[doc.id]}
                previewFailed={previewFailures[doc.id]}
                deleting={deletingId === doc.id}
                onPreviewDocument={handlePreviewDocument}
                onDownloadDocument={handleDownloadDocument}
                onDeleteDocument={handleDeleteDocument}
              />
            );
          })}
        </div>
      )}

      {modalOpen && (
        <DocumentModal
          submitting={submitting}
          onClose={closeDocumentModal}
          onSubmitDocument={handleSubmitDocument}
        />
      )}

      {selectedPreviewDocument && (
        <DocumentPreviewModal
          doc={selectedPreviewDocument}
          previewUrl={selectedPreviewUrl}
          previewLoading={previewLoading}
          previewFailed={selectedPreviewFailed}
          onClose={closePreviewModal}
          onDownloadDocument={handleDownloadDocument}
        />
      )}
    </section>
  );
}

export default DocumentsPage;
