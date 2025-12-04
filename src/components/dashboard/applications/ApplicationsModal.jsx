import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { supabase } from "../../../lib/supabase";

const DEFAULT_FOLLOWUP_DELAY_DAYS = 15;

function ApplicationsModal() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState("new");
  const [editingId, setEditingId] = useState(null);

  // Core application fields.
  const [status, setStatus] = useState("Envoyée");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [contractType, setContractType] = useState("CDI");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [link, setLink] = useState("");

  // Date fields: submission, follow-up, interview.
  const [sentAt, setSentAt] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [interviewAt, setInterviewAt] = useState("");

  // Contact search state.
  const [contactQuery, setContactQuery] = useState("");
  const [contactId, setContactId] = useState(null);
  const [contactSuggestions, setContactSuggestions] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // Capitalizes the first letter of a string.
  function capitalizeFirst(str) {
    if (!str || typeof str !== "string") {
      return "";
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Normalizes a string (removes accents, lowercase).
  function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  // Resets all form fields to their default values.
  const resetForm = useCallback(function () {
    const today = new Date();
    const isoToday = today.toISOString().slice(0, 10);

    const followUp = new Date(today.getTime());
    followUp.setDate(followUp.getDate() + DEFAULT_FOLLOWUP_DELAY_DAYS);
    const isoFollowUp = followUp.toISOString().slice(0, 10);

    setStatus("Envoyée");
    setCompany("");
    setPosition("");
    setContractType("CDI");
    setLocation("");
    setSalary("");
    setLink("");

    setSentAt(isoToday);
    setFollowUpAt(isoFollowUp);
    setInterviewAt("");

    setContactQuery("");
    setContactId(null);
    setContactSuggestions([]);
    setContactsLoading(false);
  }, []);

  // Searches contacts in database and filters them client-side by name.
  async function fetchContacts(query) {
    if (!user) {
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setContactSuggestions([]);

      return;
    }

    setContactsLoading(true);

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setContactsLoading(false);

    if (error) {
      console.error("Erreur de chargement des contacts :", error);

      return;
    }

    const normQuery = normalize(trimmed);

    const filtered = data.filter(function (c) {
      const fn = c.first_name ? normalize(c.first_name) : "";
      const ln = c.last_name ? normalize(c.last_name) : "";
      const em = c.email ? normalize(c.email) : "";

      return (
        fn.includes(normQuery) ||
        ln.includes(normQuery) ||
        em.includes(normQuery)
      );
    });

    setContactSuggestions(filtered.slice(0, 5));
  }

  // Handles typing in the contact field and triggers search.
  function handleContactChange(event) {
    const value = event.target.value;
    setContactQuery(value);
    setContactId(null);
    fetchContacts(value);
  }

  // Applied when selecting a contact from suggestions.
  function handleSelectContact(contact) {
    let label = "";

    if (contact.first_name && contact.last_name) {
      label = capitalizeFirst(contact.first_name) + " " + capitalizeFirst(contact.last_name);
    } else if (contact.first_name) {
      label = capitalizeFirst(contact.first_name);
    } else {
      label = "";
    }

    setContactQuery(label);
    setContactId(contact.id);
    setContactSuggestions([]);

    if (!company && contact.company) {
      setCompany(contact.company);
    }
  }

  // Registers global functions for opening/closing the modal.
  useEffect(
    function () {
      // Open modal in "new" mode.
      window.openNewApplicationsModal = function () {
        setMode("new");
        setEditingId(null);
        resetForm();

        const modal = document.getElementById("applications-modal");

        if (modal) {
          modal.classList.add("modal-open");
        }
      };

      // Opens modal in "edit" mode.
      window.openEditApplicationsModal = function (application, contact) {
        setMode("edit");

        if (application?.id) {
          setEditingId(application.id);
        }
        else {
          setEditingId(null);
        }

        // Populate form fields if an application is provided.
        if (application) {
          if (application.status) {
            setStatus(application.status[0]);
          }

          if (application.company) {
            setCompany(application.company);
          }

          if (application.position) {
            setPosition(application.position);
          }

          if (application.contract_types && application.contract_types.length > 0) {
            setContractType(application.contract_types[0]);
          }

          if (application.location) {
            setLocation(application.location);
          }

          if (typeof application.salary === "number") {
            setSalary(String(application.salary));
          }

          if (application.link) {
            setLink(application.link);
          }

          if (application.sent_at) {
            setSentAt(application.sent_at.slice(0, 10));
          }

          if (application.follow_up_at) {
            setFollowUpAt(application.follow_up_at.slice(0, 10));
          }

          if (application.interview_at) {
            setInterviewAt(application.interview_at.slice(0, 10));
          }
        }

        // Pre-fill selected contact if provided.
        if (contact) {
          let label = "";
          if (contact.first_name && contact.last_name) {
            label = capitalizeFirst(contact.first_name) + " " + capitalizeFirst(contact.last_name);
          } else if (contact.first_name) {
            label = capitalizeFirst(contact.first_name);
          } else if (contact.email) {
            label = contact.email;
          }
          setContactQuery(label);
          setContactId(contact.id);
        } else {
          setContactQuery("");
          setContactId(null);
        }

        setContactSuggestions([]);

        const modal = document.getElementById("applications-modal");
        if (modal) modal.classList.add("modal-open");
      };

      // Close modal handler.
      window.closeApplicationsModal = function () {
        const modal = document.getElementById("applications-modal");

        if (modal) {
          modal.classList.remove("modal-open");
        }
      };

      // Cleanup on unmount.
      return function cleanup() {
        delete window.openNewApplicationsModal;
        delete window.openEditApplicationsModal;
        delete window.closeApplicationsModal;
      };
    },
    [resetForm]
  );

  // Ensures a contact exists.
  async function ensureContact() {
    if (contactId) {
      await supabase.from("contacts").update({ company }).eq("id", contactId);

      return contactId;
    }

    const trimmed = contactQuery.trim();

    if (trimmed.length === 0 || !user) {
      return null;
    }

    const parts = trimmed.split(" ");
    const first = parts[0];

    let last = "";

    if (parts.length > 1) {
      last = parts.slice(1).join(" ");
    }

    const payload = {
      user_id: user.id,
      first_name: first || null,
      last_name: last || null,
      company: company || null,
    };

    const { data, error } = await supabase
      .from("contacts")
      .insert(payload)
      .select()
      .single();

    if (error) {
      showToast("Erreur lors de l’enregistrement du contact.", "error");

      return null;
    }

    return data?.id || null;
  }

  // Handles application submission for both creation and editing.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      showToast("Utilisateur non connecté.", "error");

      return;
    }

    // Mandatory fields validation.
    const trimmedCompany = company.trim();
    const trimmedPosition = position.trim();
    const trimmedStatus = status.trim();

    if (!trimmedStatus) {
      showToast("Le statut est obligatoire.", "error");

      return;
    }

    if (!trimmedCompany) {
      showToast("L’entreprise est obligatoire.", "error");

      return;
    }

    if (!trimmedPosition) {
      showToast("Le poste est obligatoire.", "error");

      return;
    }

    if (!sentAt) {
      showToast("La date d’envoi est obligatoire.", "error");

      return;
    }

    // Ensures a valid contact_id (existing or newly created).
    const contactIdToUse = await ensureContact();

    // Application payload sent to database.
    const payload = {
      user_id: user.id,
      status: trimmedStatus ? [trimmedStatus] : [],
      company: trimmedCompany,
      position: trimmedPosition,
      contract_types: contractType ? [contractType] : [],
      location: location.trim() || null,
      salary: salary !== "" ? Number(salary) : null,
      contact_id: contactIdToUse,
      link: link.trim() || null,
      sent_at: sentAt || null,
      follow_up_at: followUpAt || null,
      interview_at: interviewAt || null,
    };

    let error = null;

    if (mode === "edit" && editingId) {
      const result = await supabase
        .from("applications")
        .update(payload)
        .eq("id", editingId);
      error = result.error;
    } else {
      const result = await supabase.from("applications").insert(payload);
      error = result.error;
    }

    if (error) {
      console.error("Erreur enregistrement candidature :", error);
      showToast("Erreur lors de l’enregistrement de la candidature.", "error");

      return;
    }

    showToast(mode === "edit" ? "Candidature mise à jour avec succès." : "Candidature créée avec succès.", "success");

    if (window.refreshApplicationsCount) {
      window.refreshApplicationsCount();
    }

    resetForm();
    window.closeApplicationsModal();
  }

  return (
    <div id="applications-modal" className="modal w-full p-0">
      <div className="modal-box p-4 w-full lg:w-auto h-full lg:h-auto rounded-none lg:rounded-2xl">
        <div className="flex flex-col justify-center items-center gap-4">
          <h3 className="flex flex-row justify-center items-center gap-2 text-xl font-semibold">
            {mode === "new" ? "Nouvelle candidature" : "Modifier la candidature"}
          </h3>

          <form className="w-full flex flex-col justify-center items-center gap-4" onSubmit={handleSubmit}>
            <fieldset className="fieldset w-full p-4 flex flex-col justify-center items-start gap-4 rounded-xl border border-base-300 bg-base-200">
              {/* STATUS */}
              <div className="w-full">
                <label className="label mb-1">Statut*</label>

                <select className="select w-full" value={status} onChange={function (event) { setStatus(event.target.value); }}>
                  <option value="Envoyée">Envoyée</option>
                  <option value="En relance">En relance</option>
                  <option value="Entretien">Entretien</option>
                  <option value="Refusée">Refusée</option>
                  <option value="Acceptée">Acceptée</option>
                </select>
              </div>

              <div className="w-full flex flex-col lg:flex-row gap-4">
                {/* COMPANY */}
                <div className="w-full">
                  <label className="label mb-1">Entreprise*</label>

                  <input
                    className="input validator w-full"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Entreprise..."
                    value={company}
                    onChange={function (event) { setCompany(event.target.value); }}
                  />
                </div>

                {/* POSITION */}
                <div className="w-full">
                  <label className="label mb-1">Poste*</label>

                  <input
                    className="input validator w-full"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Poste..."
                    value={position}
                    onChange={function (event) { setPosition(event.target.value); }} />
                </div>
              </div>

              <div className="w-full flex flex-col lg:flex-row gap-4">
                {/* CONTRACT TYPE */}
                <div className="w-full">
                  <label className="label mb-1">Type de contrat</label>

                  <select className="select w-full" value={contractType} onChange={function (event) { setContractType(event.target.value); }}>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                    <option value="CDD">CDD</option>
                    <option value="Intérimaire">Intérimaire</option>
                    <option value="CDI">CDI</option>
                  </select>
                </div>

                {/* SALARY */}
                <div className="w-full">
                  <label className="label mb-1">Salaire</label>

                  <input
                    className="input validator w-full"
                    type="number"
                    autoComplete="off"
                    placeholder="50000"
                    value={salary}
                    onChange={function (event) { setSalary(event.target.value); }}
                  />
                </div>
              </div>

              {/* LOCATION */}
              <div className="w-full">
                <label className="label mb-1">Localisation</label>

                <input
                  className="input validator w-full"
                  type="text"
                  autoComplete="off"
                  placeholder="Adresse..."
                  value={location}
                  onChange={function (event) { setLocation(event.target.value); }}
                />
              </div>

              {/* DATES */}
              <div className="w-full flex flex-col lg:flex-row gap-4">
                {/* SENT */}
                <div className="w-full">
                  <label className="label mb-1">Date d'envoi*</label>

                  <input
                    className="input validator w-full"
                    type="date"
                    value={sentAt}
                    onChange={function (event) { setSentAt(event.target.value); }}
                  />
                </div>

                {/* FOLLOW UP */}
                <div className="w-full">
                  <label className="label mb-1">Date de relance</label>

                  <input
                    className="input validator w-full"
                    type="date"
                    value={followUpAt}
                    onChange={function (event) { setFollowUpAt(event.target.value); }}
                  />
                </div>

                {/* INTERVIEW */}
                <div className="w-full">
                  <label className="label mb-1">Date d'entretien</label>

                  <input
                    className="input validator w-full"
                    type="date"
                    value={interviewAt}
                    onChange={function (event) { setInterviewAt(event.target.value); }}
                  />
                </div>
              </div>

              {/* CONTACT */}
              <div className="w-full">
                <label className="label mb-1">
                  Contact <span className="italic">(ex: Bruce Wayne)</span>
                </label>

                <div className="relative w-full">
                  <input
                    className="input validator w-full"
                    type="text"
                    autoComplete="off"
                    placeholder="Contact..."
                    value={contactQuery}
                    onChange={handleContactChange}
                  />

                  {contactsLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60">
                      ...
                    </span>
                  )}

                  {contactSuggestions.length > 0 && (
                    <ul className="menu w-full mt-2 absolute rounded-lg border border-base-300 bg-base-100 shadow-xl z-50">
                      {contactSuggestions.map(function (contact) {
                        let label = "";

                        if (contact.first_name && contact.last_name) {
                          label = capitalizeFirst(contact.first_name) + " " + capitalizeFirst(contact.last_name);
                        } else if (contact.first_name) {
                          label = capitalizeFirst(contact.first_name);
                        } else {
                          label = "";
                        }

                        if (contact.company) {
                          label = label + " (" + contact.company + ")";
                        }

                        return (
                          <li key={contact.id}>
                            <button className="w-full text-left" type="button" onClick={function () { handleSelectContact(contact); }}>
                              {label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* LINK */}
              <div className="w-full">
                <label className="label mb-1">
                  Lien vers l'offre ou fiche de poste
                </label>

                <input
                  className="input validator w-full"
                  type="text"
                  autoComplete="off"
                  placeholder="https://..."
                  value={link}
                  onChange={function (event) { setLink(event.target.value); }}
                />
              </div>
            </fieldset>

            <div className="w-full flex flex-row justify-center lg:justify-end items-center gap-2">
              <button className="btn btn-ghost border-none shadow-none" type="button" onClick={function () { resetForm(); window.closeApplicationsModal(); }}>
                Annuler
              </button>

              <button className="btn btn-primary text-white border-none shadow-none" type="submit">
                {mode === "new" ? "Enregistrer la candidature" : "Mettre à jour la candidature"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="modal-backdrop backdrop-blur-xs" onClick={function () { resetForm(); window.closeApplicationsModal(); }}></div>
    </div>
  );
}

export default ApplicationsModal;
