import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Trash2 } from "lucide-react";

function getStatusLabel(status) {
  if (status === "sent") {
    return "Envoyée";
  }

  if (status === "follow_up") {
    return "À relancer";
  }

  if (status === "interview") {
    return "Entretien";
  }

  if (status === "rejected") {
    return "Refusée";
  }

  if (status === "accepted") {
    return "Acceptée";
  }

  return "Inconnu";
}

function getStatusSortValue(status) {
  if (status === "sent") {
    return 1;
  }

  if (status === "follow_up") {
    return 2;
  }

  if (status === "interview") {
    return 3;
  }

  if (status === "accepted") {
    return 4;
  }

  if (status === "rejected") {
    return 5;
  }

  return 99;
}

function getStatusBadgeClassName(status) {
  let className = "badge badge-outline";

  if (status === "sent") {
    className = "badge badge-info";
  }

  if (status === "follow_up") {
    className = "badge badge-warning";
  }

  if (status === "interview") {
    className = "badge badge-primary text-white";
  }

  if (status === "rejected") {
    className = "badge badge-error";
  }

  if (status === "accepted") {
    className = "badge badge-success";
  }

  return className;
}

function getContractTypeLabel(contractType) {
  if (contractType === "permanent") {
    return "CDI";
  }

  if (contractType === "fixed_term") {
    return "CDD";
  }

  if (contractType === "apprenticeship") {
    return "Alternance";
  }

  if (contractType === "internship") {
    return "Stage";
  }

  if (contractType === "freelance") {
    return "Freelance";
  }

  if (contractType === "other") {
    return "Autre";
  }

  return "Non renseigné";
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

function getDateTimestamp(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getTime();
}

function getTextSortValue(value) {
  return String(value || "").toLowerCase().trim();
}

function getSortableValue(application, sortKey) {
  if (sortKey === "company") {
    return getTextSortValue(application.company);
  }

  if (sortKey === "position") {
    return getTextSortValue(application.position);
  }

  if (sortKey === "contractType") {
    return getTextSortValue(getContractTypeLabel(application.contractType));
  }

  if (sortKey === "status") {
    return getStatusSortValue(application.status);
  }

  if (sortKey === "sentAt") {
    return getDateTimestamp(application.sentAt);
  }

  if (sortKey === "followUpAt") {
    return getDateTimestamp(application.followUpAt);
  }

  if (sortKey === "interviewAt") {
    return getDateTimestamp(application.interviewAt);
  }

  return "";
}

function compareSortableValues(firstValue, secondValue, direction) {
  if (firstValue === null && secondValue === null) {
    return 0;
  }

  if (firstValue === null) {
    return 1;
  }

  if (secondValue === null) {
    return -1;
  }

  let result = 0;

  if (typeof firstValue === "number" && typeof secondValue === "number") {
    if (firstValue < secondValue) {
      result = -1;
    }

    if (firstValue > secondValue) {
      result = 1;
    }
  } else {
    result = String(firstValue).localeCompare(String(secondValue), "fr-FR");
  }

  if (direction === "desc") {
    result = result * -1;
  }

  return result;
}

function getSortedApplications(applications, sortConfig) {
  if (!sortConfig.key) {
    return applications;
  }

  const sortedApplications = [...applications];

  sortedApplications.sort(function (firstApplication, secondApplication) {
    const firstValue = getSortableValue(firstApplication, sortConfig.key);
    const secondValue = getSortableValue(secondApplication, sortConfig.key);

    return compareSortableValues(firstValue, secondValue, sortConfig.direction);
  });

  return sortedApplications;
}

function getNextSortDirection(currentSortConfig, sortKey) {
  if (currentSortConfig.key === sortKey && currentSortConfig.direction === "asc") {
    return "desc";
  }

  return "asc";
}

function SortIcon({ sortConfig, sortKey }) {
  if (sortConfig.key !== sortKey) {
    return <ChevronsUpDown className="h-4 w-4 text-base-content/40" />;
  }

  if (sortConfig.direction === "desc") {
    return <ChevronDown className="h-4 w-4" />;
  }

  return <ChevronUp className="h-4 w-4" />;
}

function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
}) {
  return (
    <th className="text-center">
      <button
        className="btn btn-ghost btn-xs mx-auto gap-1 font-semibold"
        type="button"
        onClick={function () { onSort(sortKey); }}
      >
        {label}
        <SortIcon sortConfig={sortConfig} sortKey={sortKey} />
      </button>
    </th>
  );
}

function ApplicationsTable({
  applications,
  onOpenApplication,
  onDeleteApplication,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const sortedApplications = useMemo(function () {
    return getSortedApplications(applications, sortConfig);
  }, [applications, sortConfig]);

  function handleSort(sortKey) {
    setSortConfig(function (currentSortConfig) {
      return {
        key: sortKey,
        direction: getNextSortDirection(currentSortConfig, sortKey),
      };
    });
  }

  if (applications.length === 0) {
    return (
      <div className="mt-6 rounded-2xl bg-base-100 p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold">
          Aucune candidature pour le moment
        </h2>

        <p className="mt-1 text-sm text-base-content/60">
          Créez votre première candidature pour commencer à organiser votre recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl bg-base-100 shadow-sm">
      <div className="border-b border-base-300 p-4 sm:p-6">
        <h2 className="text-lg font-semibold">
          Candidatures enregistrées
        </h2>

        <p className="text-sm text-base-content/60">
          Ouvrez une candidature pour consulter ou modifier ses détails.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <SortableHeader
                label="Entreprise"
                sortKey="company"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableHeader
                label="Poste"
                sortKey="position"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableHeader
                label="Type de contrat"
                sortKey="contractType"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableHeader
                label="Statut"
                sortKey="status"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableHeader
                label="Date d’envoi"
                sortKey="sentAt"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableHeader
                label="Date de relance"
                sortKey="followUpAt"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <SortableHeader
                label="Date d’entretien"
                sortKey="interviewAt"
                sortConfig={sortConfig}
                onSort={handleSort}
              />

              <th className="text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedApplications.map(function (application) {
              return (
                <tr
                  key={application.id}
                  className="border-b border-base-200 last:border-b-0 hover:bg-base-200/50"
                >
                  <td className="text-center align-middle">
                    <button
                      className="link link-hover font-semibold"
                      type="button"
                      onClick={function () { onOpenApplication(application); }}
                    >
                      {application.company}
                    </button>
                  </td>

                  <td className="text-center align-middle">
                    {application.position}
                  </td>

                  <td className="text-center align-middle">
                    {getContractTypeLabel(application.contractType)}
                  </td>

                  <td className="text-center align-middle">
                    <span className={getStatusBadgeClassName(application.status)}>
                      {getStatusLabel(application.status)}
                    </span>
                  </td>

                  <td className="text-center align-middle">
                    {formatDate(application.sentAt)}
                  </td>

                  <td className="text-center align-middle">
                    {formatDate(application.followUpAt)}
                  </td>

                  <td className="text-center align-middle">
                    {formatDate(application.interviewAt)}
                  </td>

                  <td className="text-center align-middle">
                    <div className="flex justify-center gap-2">
                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        type="button"
                        onClick={function () { onOpenApplication(application); }}
                        aria-label="Voir la candidature"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        className="btn btn-ghost btn-sm btn-square text-error"
                        type="button"
                        onClick={function () { onDeleteApplication(application); }}
                        aria-label="Supprimer la candidature"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicationsTable;
