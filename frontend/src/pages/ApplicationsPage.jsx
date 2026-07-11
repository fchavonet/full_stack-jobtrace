import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CirclePlus, RefreshCw } from "lucide-react";

import { deleteApplication, getApplication, getApplicationHistory, listApplications, updateApplication } from "../api/applications.api";
import { listContacts } from "../api/contacts.api";
import { getUserProfile } from "../api/profile.api";
import ApplicationDetailsModal from "../components/applications/ApplicationDetailsModal";
import ApplicationModal from "../components/applications/ApplicationModal";
import ApplicationsTable from "../components/applications/ApplicationsTable";
import { SectionCard } from "../components/ui/Cards";
import LoadingCard from "../components/ui/LoadingCard";
import { ActiveFilterCard } from "../components/ui/Cards";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../hooks/useToast";
import { getFollowUpDelayDays } from "../utils/applications/dates.utils";
import { getListFromResponse, getResponseEntity } from "../utils/common/apiResponse.utils";
import { getProfileFromResponse } from "../utils/profile/profile.utils";

function getDetailsModalKey(application) {
  if (application && application.id) {
    return application.id;
  }

  return "empty";
}

function getApplicationModalOpen(isModalOpen, hasNewApplicationRequest, loading) {
  if (isModalOpen) {
    return true;
  }

  if (loading) {
    return false;
  }

  if (hasNewApplicationRequest) {
    return true;
  }

  return false;
}

function ApplicationsPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingApplications, setRefreshingApplications] = useState(false);
  const [followUpDelayDays, setFollowUpDelayDays] = useState(15);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedApplicationHistory, setSelectedApplicationHistory] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingApplication, setUpdatingApplication] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [deletingApplication, setDeletingApplication] = useState(false);

  const applicationFilterId = searchParams.get("application") || "";
  const hasNewApplicationRequest = searchParams.get("new") === "1";
  const isApplicationModalOpen = getApplicationModalOpen(isModalOpen, hasNewApplicationRequest, loading);

  const filteredApplications = useMemo(function () {
    if (!applicationFilterId) {
      return applications;
    }

    return applications.filter(function (application) {
      return application.id === applicationFilterId;
    });
  }, [applications, applicationFilterId]);

  useEffect(function () {
    async function loadInitialData() {
      try {
        const [applicationsResponse, contactsResponse, profileResponse] = await Promise.all([
          listApplications(),
          listContacts(),
          getUserProfile(),
        ]);

        const profile = getProfileFromResponse(profileResponse);

        setApplications(getListFromResponse(applicationsResponse, "applications"));
        setContacts(getListFromResponse(contactsResponse, "contacts"));
        setFollowUpDelayDays(getFollowUpDelayDays(profile.followUpDelayDays));
      } catch {
        showToast("Impossible de charger les candidatures.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [showToast]);

  async function reloadApplications() {
    setRefreshingApplications(true);

    try {
      const applicationsResponse = await listApplications();

      setApplications(getListFromResponse(applicationsResponse, "applications"));
    } catch {
      showToast("Impossible de recharger les candidatures.", "error");
    } finally {
      setRefreshingApplications(false);
    }
  }

  async function reloadModalData() {
    try {
      const contactsResponse = await listContacts();

      setContacts(getListFromResponse(contactsResponse, "contacts"));
    } catch {
      showToast("Impossible de recharger les données de création.", "error");
    }
  }

  async function reloadSelectedApplication(applicationId) {
    try {
      const [applicationResponse, historyResponse, applicationsResponse] = await Promise.all([
        getApplication(applicationId),
        getApplicationHistory(applicationId),
        listApplications(),
      ]);

      const detailedApplication = getResponseEntity(applicationResponse, "application");

      if (detailedApplication) {
        setSelectedApplication(detailedApplication);
      }

      setSelectedApplicationHistory(getListFromResponse(historyResponse, "history"));
      setApplications(getListFromResponse(applicationsResponse, "applications"));
    } catch {
      showToast("Impossible de recharger la candidature.", "error");
    }
  }

  function removeSearchParam(searchParamName) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete(searchParamName);
    setSearchParams(nextSearchParams, { replace: true });
  }

  function clearApplicationFilter() {
    removeSearchParam("application");
  }

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    if (hasNewApplicationRequest) {
      removeSearchParam("new");
    }

    setIsModalOpen(false);
  }

  async function openApplicationDetails(application) {
    setSelectedApplication(application);
    setSelectedApplicationHistory([]);
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);

    try {
      const [applicationResponse, historyResponse] = await Promise.all([
        getApplication(application.id),
        getApplicationHistory(application.id),
      ]);

      const detailedApplication = getResponseEntity(applicationResponse, "application");
      const history = getListFromResponse(historyResponse, "history");

      if (detailedApplication) {
        setSelectedApplication(detailedApplication);
      }

      setSelectedApplicationHistory(history);
    } catch {
      showToast("Impossible de charger le détail de la candidature.", "error");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeApplicationDetails() {
    setIsDetailsModalOpen(false);
    setSelectedApplication(null);
    setSelectedApplicationHistory([]);
    setDetailsLoading(false);
    setUpdatingApplication(false);
  }

  async function handleUpdateApplication(applicationId, payload) {
    setUpdatingApplication(true);

    try {
      const response = await updateApplication(applicationId, payload);
      const updatedApplication = getResponseEntity(response, "application");

      if (updatedApplication) {
        setSelectedApplication(updatedApplication);
      }

      showToast("Candidature modifiée.", "success");
      await reloadSelectedApplication(applicationId);

      return updatedApplication;
    } catch (error) {
      showToast("Impossible de modifier la candidature.", "error");
      throw error;
    } finally {
      setUpdatingApplication(false);
    }
  }

  function handleDeleteApplication(application) {
    setApplicationToDelete(application);
  }

  function closeDeleteApplicationModal() {
    if (deletingApplication) {
      return;
    }

    setApplicationToDelete(null);
  }

  async function confirmDeleteApplication() {
    if (!applicationToDelete) {
      return;
    }

    setDeletingApplication(true);

    try {
      await deleteApplication(applicationToDelete.id);

      if (
        selectedApplication &&
        selectedApplication.id === applicationToDelete.id
      ) {
        closeApplicationDetails();
      }

      setApplicationToDelete(null);
      showToast("Candidature supprimée.", "success");

      await reloadApplications();
    } catch {
      showToast("Impossible de supprimer la candidature.", "error");
    } finally {
      setDeletingApplication(false);
    }
  }

  async function handleApplicationCreated() {
    await Promise.all([
      reloadApplications(),
      reloadModalData(),
    ]);
  }

  return (
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <PageHeader
        title="Candidatures"
        description="Enregistrez et suivez vos candidatures."
        actions={
          <>
            <button className="btn btn-outline w-full md:w-auto flex flex-row justify-center items-center gap-2 cursor-pointer" type="button" onClick={reloadApplications} disabled={loading || refreshingApplications}>
              {!refreshingApplications && (
                <RefreshCw className="w-5 h-5" />
              )}

              Recharger
            </button>

            <button className="btn btn-primary w-full md:w-auto flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer" type="button" onClick={openModal} disabled={loading}>
              <CirclePlus className="w-5 h-5" />
              Nouvelle candidature
            </button>
          </>
        }
      />

      {loading && (
        <LoadingCard />
      )}

      {applicationFilterId && (
        <ActiveFilterCard className="mt-6" onClear={clearApplicationFilter} />
      )}

      {!loading && applicationFilterId && filteredApplications.length === 0 && (
        <SectionCard className="text-center">
          <h2 className="text-lg font-semibold text-base-content">
            Aucune candidature trouvée
          </h2>

          <p className="mt-2 text-sm text-base-content/60">
            La candidature liée à cet événement calendrier n’existe plus ou n’est plus disponible.
          </p>
        </SectionCard>
      )}

      {!loading && (!applicationFilterId || filteredApplications.length > 0) && (
        <ApplicationsTable
          applications={filteredApplications}
          onOpenApplication={openApplicationDetails}
          onDeleteApplication={handleDeleteApplication}
        />
      )}

      <ApplicationModal
        contacts={contacts}
        followUpDelayDays={followUpDelayDays}
        isOpen={isApplicationModalOpen}
        onClose={closeModal}
        onApplicationCreated={handleApplicationCreated}
      />

      <ApplicationDetailsModal
        key={getDetailsModalKey(selectedApplication)}
        application={selectedApplication}
        history={selectedApplicationHistory}
        loading={detailsLoading}
        updating={updatingApplication}
        followUpDelayDays={followUpDelayDays}
        isOpen={isDetailsModalOpen}
        onClose={closeApplicationDetails}
        onUpdateApplication={handleUpdateApplication}
        onApplicationChanged={reloadSelectedApplication}
      />

      <ConfirmationModal
        isOpen={Boolean(applicationToDelete)}
        title="Supprimer la candidature"
        description="Cette candidature et son historique seront définitivement supprimés."
        confirmLabel="OK"
        cancelLabel="Annuler"
        submitting={deletingApplication}
        onClose={closeDeleteApplicationModal}
        onConfirm={confirmDeleteApplication}
      />
    </section>
  );
}

export default ApplicationsPage;
