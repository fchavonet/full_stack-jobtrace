import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { listContacts } from "../api/contacts.api";
import { getUserProfile } from "../api/profile.api";
import { listTags } from "../api/tags.api";
import ApplicationModal from "../components/applications/ApplicationModal";
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

function getFollowUpDelayDaysFromProfile(profile) {
  const parsedDelay = Number(profile.followUpDelayDays);

  if (Number.isFinite(parsedDelay) && parsedDelay > 0) {
    return parsedDelay;
  }

  return 15;
}

function ApplicationsPage() {
  const { showToast } = useToast();

  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followUpDelayDays, setFollowUpDelayDays] = useState(15);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(function () {
    async function loadInitialData() {
      try {
        const [contactsResponse, tagsResponse, profileResponse] = await Promise.all([
          listContacts(),
          listTags(),
          getUserProfile(),
        ]);

        const profile = getProfileFromResponse(profileResponse);

        setContacts(getListFromResponse(contactsResponse, "contacts"));
        setTags(getListFromResponse(tagsResponse, "tags"));
        setFollowUpDelayDays(getFollowUpDelayDaysFromProfile(profile));
      } catch {
        showToast("Impossible de charger les données de création.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [showToast]);

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

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleApplicationCreated() {
    await reloadModalData();
  }

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            Candidatures
          </h1>

          <p className="text-base-content/70">
            Enregistrez et suivez vos candidatures.
          </p>
        </div>

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

      {loading && (
        <div className="mt-4 rounded-2xl bg-base-100 p-6 shadow-sm">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      <ApplicationModal
        contacts={contacts}
        tags={tags}
        followUpDelayDays={followUpDelayDays}
        isOpen={isModalOpen}
        onClose={closeModal}
        onApplicationCreated={handleApplicationCreated}
      />
    </section>
  );
}

export default ApplicationsPage;
