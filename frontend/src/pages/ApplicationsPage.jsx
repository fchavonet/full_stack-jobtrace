import { CalendarDays, Plus, RefreshCw, X } from "lucide-react";
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

    return calendarFilteredApplication.company + " — " + calendarFilteredApplication.position;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Candidatures
          </h1>

          <p className="text-base-content/70">
            Enregistrez et suivez vos candidatures.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="btn btn-outline"
            type="button"
            onClick={reloadApplications}
            disabled={loading || refreshingApplications}
          >
            {refreshingApplications && (
              <span className="loading loading-spinner loading-sm" />
            )}

            {!refreshingApplications && (
              <RefreshCw className="h-5 w-5" />
            )}

            Recharger
          </button>

          <button
            className="btn btn-primary text-white"
            type="button"
            onClick={openModal}
            disabled={loading}
          >
            <Plus className="h-5 w-5" />
            Nouvelle candidature
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      {applicationFilterId && (
        <div className="alert mt-6 border border-base-300 bg-base-100">
          <CalendarDays className="h-5 w-5" />

          <div className="flex-1">
            <h2 className="font-semibold">
              Filtre calendrier actif
            </h2>

            <p className="text-sm text-base-content/70">
              {getCalendarFilterLabel()}
            </p>
          </div>

          <button className="btn btn-ghost btn-sm" type="button" onClick={clearApplicationFilter}>
            <X className="h-4 w-4" />
            Afficher toutes
          </button>
        </div>
      )}

      {!loading && applicationFilterId && filteredApplications.length === 0 && (
        <div className="mt-6 rounded-2xl bg-base-100 p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">
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
