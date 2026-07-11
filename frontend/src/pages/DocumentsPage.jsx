import { CirclePlus } from "lucide-react";
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
import ConfirmationModal from "../components/ui/ConfirmationModal";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";
import Search from "../components/ui/Search";
import { SectionCard } from "../components/ui/Cards";

import { useToast } from "../hooks/useToast";

import { getListFromResponse } from "../utils/common/apiResponse.utils";
import {
  canPreviewDocument,
  getDocumentName,
  getFilteredDocuments,
  getUploadErrorMessage,
  revokePreviewUrls,
  revokeUrl,
  validateDocumentFile,
} from "../utils/documents/document.utils";

function DocumentsEmptyCard({ title, description }) {
  return (
    <SectionCard
      className="text-center"
      centered={true}
      contentClassName="hidden"
      title={title}
      description={description}
    >
      <div />
    </SectionCard>
  );
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
  const [documentToDelete, setDocumentToDelete] = useState(null);

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

  function handleDeleteDocument(doc) {
    setDocumentToDelete(doc);
  }

  function closeDeleteDocumentModal() {
    if (deletingId) {
      return;
    }

    setDocumentToDelete(null);
  }

  async function confirmDeleteDocument() {
    if (!documentToDelete) {
      return;
    }

    const documentId = documentToDelete.id;

    setDeletingId(documentId);

    try {
      await deleteDocument(documentId);

      if (previewUrlsRef.current[documentId]) {
        revokeUrl(previewUrlsRef.current[documentId]);
      }

      const nextPreviewUrls = {
        ...previewUrlsRef.current,
      };

      delete nextPreviewUrls[documentId];

      previewUrlsRef.current = nextPreviewUrls;
      setPreviewUrls(nextPreviewUrls);

      setDocuments(function (currentDocuments) {
        return currentDocuments.filter(function (currentDocument) {
          return currentDocument.id !== documentId;
        });
      });

      setDocumentToDelete(null);
      showToast("Document supprimé.", "success");
    } catch {
      showToast("Impossible de supprimer le document.", "error");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <PageHeader
        title="Documents"
        description="Retrouvez vos CV, lettres de motivation et fichiers liés à vos candidatures."
        actions={
          <button
            className="btn btn-primary w-full md:w-auto flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer"
            type="button"
            onClick={openDocumentModal}
          >
            <CirclePlus className="w-5 h-5" />
            Nouveau document
          </button>
        }
      />

      <Search
        title="Documents enregistrés"
        description="Recherchez un CV, une lettre de motivation ou un fichier associé à vos candidatures."
        resultLabel={displayedDocuments.length + " / " + documents.length}
        value={searchValue}
        onChange={handleSearchChange}
        placeholder="Rechercher un document..."
      />

      {loading && (
        <LoadingCard />
      )}

      {!loading && documents.length === 0 && (
        <DocumentsEmptyCard
          title="Aucun document pour le moment"
          description="Ajoutez votre premier document."
        />
      )}

      {!loading && documents.length > 0 && displayedDocuments.length === 0 && (
        <DocumentsEmptyCard
          title="Aucun résultat"
          description="Modifiez votre recherche pour afficher des documents."
        />
      )}

      {!loading && displayedDocuments.length > 0 && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      <ConfirmationModal
        isOpen={Boolean(documentToDelete)}
        title="Supprimer le document"
        description="Ce document sera définitivement supprimé de votre espace."
        confirmLabel="OK"
        cancelLabel="Annuler"
        submitting={Boolean(deletingId)}
        onClose={closeDeleteDocumentModal}
        onConfirm={confirmDeleteDocument}
      />
    </section>
  );
}

export default DocumentsPage;
