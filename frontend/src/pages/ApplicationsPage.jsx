import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  deleteApplication,
  getApplication,
  getApplicationHistory,
  listApplications,
  updateApplication,
} from "../api/applications.api";
import { listContacts } from "../api/contacts.api";
import { getUserProfile } from "../api/profile.api";
import ApplicationDetailsModal from "../components/applications/ApplicationDetailsModal";
import ApplicationModal from "../components/applications/ApplicationModal";
import ApplicationsTable from "../components/applications/ApplicationsTable";
import { useToast } from "../hooks/useToast";
import { getFollowUpDelayDays } from "../utils/applications/dates.utils";
import {
  getListFromResponse,
  getResponseEntity,
} from "../utils/common/apiResponse.utils";
import { getProfileFromResponse } from "../utils/profile/profile.utils";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";

function getDetailsModalKey(application) {
  if (application && application.id) {
    return application.id;
  }

  return "empty";
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

  const applicationFilterId = searchParams.get("application") || "";

  const filteredApplications = useMemo(function () {
    if (!applicationFilterId) {
      return applications;
    }

    return applications.filter(function (application) {
      return application.id === applicationFilterId;
    });
  }, [applications, applicationFilterId]);

  const calendarFilteredApplication = useMemo(function () {
    if (!applicationFilterId) {
      return null;
    }

    const foundApplication = applications.find(function (application) {
      return application.id === applicationFilterId;
    });

    if (foundApplication) {
      return foundApplication;
    }

    return null;
  }, [applications, applicationFilterId]);

  useEffect(function () {
    async function loadInitialData() {
      try {
        const [
          applicationsResponse,
          contactsResponse,
          profileResponse,
        ] = await Promise.all([
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
      const [
        applicationResponse,
        historyResponse,
        applicationsResponse,
      ] = await Promise.all([
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

  function clearApplicationFilter() {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("application");
    setSearchParams(nextSearchParams);
  }

  function getCalendarFilterLabel() {
    if (!calendarFilteredApplication) {
      return "Candidature introuvable.";
    }

    return calendarFilteredApplication.company + " - " + calendarFilteredApplication.position;
  }

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
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

  async function handleDeleteApplication(application) {
    const confirmed = window.confirm("Supprimer cette candidature ?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteApplication(application.id);

      if (selectedApplication && selectedApplication.id === application.id) {
        closeApplicationDetails();
      }

      showToast("Candidature supprimée.", "success");
      await reloadApplications();
    } catch {
      showToast("Impossible de supprimer la candidature.", "error");
    }
  }

  async function handleApplicationCreated() {
    await Promise.all([
      reloadApplications(),
      reloadModalData(),
    ]);
  }

  return (
    <section>
      <PageHeader
        title="Candidatures"
        description="Enregistrez et suivez vos candidatures."
        actions={
          <>
            <button className="btn btn-outline w-full md:w-auto flex flex-row justify-center items-center gap-2 cursor-pointer" type="button" onClick={reloadApplications} disabled={loading || refreshingApplications}>
              {refreshingApplications && (
                <span className="loading loading-spinner loading-sm" />
              )}

              {!refreshingApplications && (
                <RefreshCw className="w-5 h-5" />
              )}

              Recharger
            </button>

            <button className="btn btn-primary w-full md:w-auto flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer" type="button" onClick={openModal} disabled={loading}>
              <Plus className="w-5 h-5" />
              Nouvelle candidature
            </button>
          </>
        }
      />

      {loading && (
        <LoadingCard />
      )}

      {applicationFilterId && (
        <div className="w-full min-w-0 mt-6 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl bg-base-100 shadow-sm">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-base-content">
              Filtre calendrier actif
            </h2>

            <p className="mt-1 text-sm text-base-content/60 truncate">
              {getCalendarFilterLabel()}
            </p>
          </div>

          <button className="btn btn-ghost btn-sm shrink-0 cursor-pointer" type="button" onClick={clearApplicationFilter}>
            Afficher toutes
          </button>
        </div>
      )}

      {!loading && applicationFilterId && filteredApplications.length === 0 && (
        <div className="w-full min-w-0 mt-6 p-4 md:p-6 text-center rounded-2xl bg-base-100 shadow-sm">
          <h2 className="text-lg font-semibold text-base-content">
            Aucune candidature trouvée
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            La candidature liée à cet événement calendrier n’existe plus ou n’est plus disponible.
          </p>
        </div>
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
        isOpen={isModalOpen}
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
    </section>
  );
}

export default ApplicationsPage;
