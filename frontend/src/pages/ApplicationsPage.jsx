import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import {
  deleteApplication,
  getApplication,
  getApplicationHistory,
  listApplications,
  updateApplication,
} from "../api/applications.api";
import { listContacts } from "../api/contacts.api";
import { getUserProfile } from "../api/profile.api";
import { listTags } from "../api/tags.api";
import ApplicationDetailsModal from "../components/applications/ApplicationDetailsModal";
import ApplicationModal from "../components/applications/ApplicationModal";
import ApplicationsTable from "../components/applications/ApplicationsTable";
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

function getProfileFromResponse(response) {
  if (response && response.data && response.data.user) {
    return response.data.user;
  }

  if (response && response.data && response.data.profile) {
    return response.data.profile;
  }

  if (response && response.data) {
    return response.data;
  }

  return {};
}

function getApplicationFromResponse(response) {
  if (response && response.data && response.data.application) {
    return response.data.application;
  }

  if (response && response.application) {
    return response.application;
  }

  if (response && response.id) {
    return response;
  }

  return null;
}

function getFollowUpDelayDaysFromProfile(profile) {
  const parsedDelay = Number(profile.followUpDelayDays);

  if (Number.isFinite(parsedDelay) && parsedDelay > 0) {
    return parsedDelay;
  }

  return 15;
}

function getDetailsModalKey(application) {
  if (application && application.id) {
    return application.id;
  }

  return "empty";
}

function ApplicationsPage() {
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingApplications, setRefreshingApplications] = useState(false);
  const [followUpDelayDays, setFollowUpDelayDays] = useState(15);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedApplicationHistory, setSelectedApplicationHistory] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingApplication, setUpdatingApplication] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(function () {
    async function loadInitialData() {
      try {
        const [
          applicationsResponse,
          contactsResponse,
          tagsResponse,
          profileResponse,
        ] = await Promise.all([
          listApplications(),
          listContacts(),
          listTags(),
          getUserProfile(),
        ]);

        const profile = getProfileFromResponse(profileResponse);

        setApplications(getListFromResponse(applicationsResponse, "applications"));
        setContacts(getListFromResponse(contactsResponse, "contacts"));
        setTags(getListFromResponse(tagsResponse, "tags"));
        setFollowUpDelayDays(getFollowUpDelayDaysFromProfile(profile));
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
      const [contactsResponse, tagsResponse] = await Promise.all([
        listContacts(),
        listTags(),
      ]);

      setContacts(getListFromResponse(contactsResponse, "contacts"));
      setTags(getListFromResponse(tagsResponse, "tags"));
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
        tagsResponse,
      ] = await Promise.all([
        getApplication(applicationId),
        getApplicationHistory(applicationId),
        listApplications(),
        listTags(),
      ]);

      const detailedApplication = getApplicationFromResponse(applicationResponse);

      if (detailedApplication) {
        setSelectedApplication(detailedApplication);
      }

      setSelectedApplicationHistory(getListFromResponse(historyResponse, "history"));
      setApplications(getListFromResponse(applicationsResponse, "applications"));
      setTags(getListFromResponse(tagsResponse, "tags"));
    } catch {
      showToast("Impossible de recharger la candidature.", "error");
    }
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

      const detailedApplication = getApplicationFromResponse(applicationResponse);
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
      const updatedApplication = getApplicationFromResponse(response);

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

      {!loading && (
        <ApplicationsTable
          applications={applications}
          onOpenApplication={openApplicationDetails}
          onDeleteApplication={handleDeleteApplication}
        />
      )}

      <ApplicationModal
        contacts={contacts}
        tags={tags}
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
        isOpen={isDetailsModalOpen}
        onClose={closeApplicationDetails}
        onUpdateApplication={handleUpdateApplication}
        onApplicationChanged={reloadSelectedApplication}
      />
    </section>
  );
}

export default ApplicationsPage;
