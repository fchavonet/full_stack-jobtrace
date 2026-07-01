import { CirclePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from "../api/contacts.api";

import ContactCard from "../components/contacts/ContactCard";
import ContactModal from "../components/contacts/ContactModal";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";
import Search from "../components/ui/Search";
import { SectionCard } from "../components/ui/Cards";

import { useToast } from "../hooks/useToast";

import { getListFromResponse } from "../utils/common/apiResponse.utils";
import { getContactFromResponse, getContactModalKey, getFilteredContacts, } from "../utils/contacts/contact.utils";

function ContactsEmptyCard({ title, description }) {
  return (
    <SectionCard
      className="text-center"
      contentClassName="hidden"
      title={title}
      description={description}
    >
      <div />
    </SectionCard>
  );
}

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
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <PageHeader
        title="Contacts"
        description="Retrouvez les contacts liés à vos candidatures."
        actions={
          <button
            className="btn btn-primary w-full md:w-auto flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer"
            type="button"
            onClick={openCreateModal}
          >
            <CirclePlus className="w-5 h-5" />
            Nouveau contact
          </button>
        }
      />

      <Search
        title="Contacts enregistrés"
        description="Recherchez un contact, une entreprise, un poste ou une adresse email."
        resultLabel={displayedContacts.length + " / " + contacts.length}
        value={searchValue}
        onChange={handleSearchChange}
        placeholder="Rechercher un contact, une entreprise, un poste, un email..."
      />

      {loading && (
        <LoadingCard />
      )}

      {!loading && contacts.length === 0 && (
        <ContactsEmptyCard
          title="Aucun contact pour le moment"
          description="Créez votre premier contact pour garder les informations utiles à portée de main."
        />
      )}

      {!loading && contacts.length > 0 && displayedContacts.length === 0 && (
        <ContactsEmptyCard
          title="Aucun résultat"
          description="Modifiez votre recherche pour afficher des contacts."
        />
      )}

      {!loading && displayedContacts.length > 0 && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
