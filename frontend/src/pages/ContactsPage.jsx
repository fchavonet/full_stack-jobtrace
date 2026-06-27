import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from "../api/contacts.api";
import ContactCard from "../components/contacts/ContactCard";
import ContactModal from "../components/contacts/ContactModal";
import { useToast } from "../hooks/useToast";
import { getListFromResponse } from "../utils/common/apiResponse.utils";
import {
  getContactFromResponse,
  getContactModalKey,
  getFilteredContacts,
} from "../utils/contacts/contact.utils";

function ContactsPage() {
  const { showToast } = useToast();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const displayedContacts = useMemo(function () {
    return getFilteredContacts(contacts, searchValue);
  }, [contacts, searchValue]);

  useEffect(function () {
    let shouldIgnore = false;

    async function fetchContacts() {
      try {
        const response = await listContacts();

        if (shouldIgnore) {
          return;
        }

        setContacts(getListFromResponse(response, "contacts"));
      } catch {
        if (shouldIgnore) {
          return;
        }

        showToast("Impossible de charger les contacts.", "error");
      } finally {
        if (!shouldIgnore) {
          setLoading(false);
        }
      }
    }

    fetchContacts();

    return function cleanup() {
      shouldIgnore = true;
    };
  }, [showToast]);

  function handleSearchChange(event) {
    setSearchValue(event.target.value);
  }

  function openCreateModal() {
    setSelectedContact(null);
    setIsModalOpen(true);
  }

  function openEditModal(contact) {
    setSelectedContact(contact);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    setSelectedContact(null);
  }

  async function handleSubmitContact(payload) {
    setSubmitting(true);

    try {
      if (selectedContact) {
        const response = await updateContact(selectedContact.id, payload);
        const updatedContact = getContactFromResponse(response);

        if (updatedContact) {
          setContacts(function (currentContacts) {
            return currentContacts.map(function (contact) {
              if (contact.id === updatedContact.id) {
                return updatedContact;
              }

              return contact;
            });
          });
        }

        showToast("Contact modifié.", "success");
      }

      if (!selectedContact) {
        const response = await createContact(payload);
        const createdContact = getContactFromResponse(response);

        if (createdContact) {
          setContacts(function (currentContacts) {
            return [createdContact, ...currentContacts];
          });
        }

        showToast("Contact créé.", "success");
      }

      setIsModalOpen(false);
      setSelectedContact(null);
    } catch {
      showToast("Impossible d’enregistrer le contact.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteContact(contact) {
    const confirmed = window.confirm("Supprimer ce contact ?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteContact(contact.id);

      setContacts(function (currentContacts) {
        return currentContacts.filter(function (currentContact) {
          return currentContact.id !== contact.id;
        });
      });

      showToast("Contact supprimé.", "success");
    } catch {
      showToast("Impossible de supprimer le contact.", "error");
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Contacts
          </h1>

          <p className="text-base-content/70">
            Retrouvez les contacts liés à vos candidatures.
          </p>
        </div>

        <button
          className="btn btn-primary text-white"
          type="button"
          onClick={openCreateModal}
          disabled={loading}
        >
          <Plus className="h-5 w-5" />
          Nouveau contact
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
              placeholder="Rechercher un contact, une entreprise, un email..."
            />
          </label>

          <p className="text-sm text-base-content/60">
            {displayedContacts.length} contact(s) affiché(s) sur{" "}
            {contacts.length}
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      {!loading && contacts.length === 0 && (
        <div className="mt-6 rounded-2xl bg-base-100 p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">
            Aucun contact pour le moment
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Créez votre premier contact pour garder les informations utiles à
            portée de main.
          </p>
        </div>
      )}

      {!loading && contacts.length > 0 && displayedContacts.length === 0 && (
        <div className="mt-6 rounded-2xl bg-base-100 p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">
            Aucun résultat
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Modifiez votre recherche pour afficher des contacts.
          </p>
        </div>
      )}

      {!loading && displayedContacts.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayedContacts.map(function (contact) {
            return (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEditContact={openEditModal}
                onDeleteContact={handleDeleteContact}
              />
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <ContactModal
          key={getContactModalKey(selectedContact)}
          contact={selectedContact}
          isOpen={isModalOpen}
          submitting={submitting}
          onClose={closeModal}
          onSubmitContact={handleSubmitContact}
        />
      )}
    </section>
  );
}

export default ContactsPage;
