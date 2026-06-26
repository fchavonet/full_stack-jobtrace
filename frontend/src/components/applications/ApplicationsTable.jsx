import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  Search,
  Trash2,
} from "lucide-react";

const statusFilters = [
  {
    value: "all",
    label: "Toutes",
  },
  {
    value: "sent",
    label: "Envoyées",
  },
  {
    value: "follow_up",
    label: "À relancer",
  },
  {
    value: "interview",
    label: "Entretien",
  },
  {
    value: "accepted",
    label: "Acceptées",
  },
  {
    value: "rejected",
    label: "Refusées",
  },
];

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

function normalizeValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getSearchableValue(application) {
  return normalizeValue(
    [
      application.company,
      application.position,
      application.location,
      getContractTypeLabel(application.contractType),
      getStatusLabel(application.status),
      formatDate(application.sentAt),
      formatDate(application.followUpAt),
      formatDate(application.interviewAt),
    ].join(" "),
  );
}

function getSortableValue(application, sortKey) {
  if (sortKey === "company") {
    return normalizeValue(application.company);
  }

  if (sortKey === "position") {
    return normalizeValue(application.position);
  }

  if (sortKey === "contractType") {
    return normalizeValue(getContractTypeLabel(application.contractType));
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

function getFilteredApplications(applications, searchValue, statusFilter) {
  const normalizedSearch = normalizeValue(searchValue);

  return applications.filter(function (application) {
    if (statusFilter !== "all" && application.status !== statusFilter) {
      return false;
    }

    if (normalizedSearch && !getSearchableValue(application).includes(normalizedSearch)) {
      return false;
    }

    return true;
  });
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

function getStatusFilterButtonClassName(currentStatusFilter, statusFilterValue) {
  let className = "btn btn-sm";

  if (currentStatusFilter === statusFilterValue) {
    className = "btn btn-sm btn-primary text-white";
  }

  return className;
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
        className="btn btn-ghost btn-xs mx-auto w-full justify-center gap-1 px-1 font-semibold"
        type="button"
        onClick={function () { onSort(sortKey); }}
      >
        <span className="truncate">
          {label}
        </span>

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
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const displayedApplications = useMemo(function () {
    const filteredApplications = getFilteredApplications(
      applications,
      searchValue,
      statusFilter,
    );

    return getSortedApplications(filteredApplications, sortConfig);
  }, [applications, searchValue, statusFilter, sortConfig]);

  function handleSearchChange(event) {
    setSearchValue(event.target.value);
  }

  function handleStatusFilterChange(nextStatusFilter) {
    setStatusFilter(nextStatusFilter);
  }

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Candidatures enregistrées
            </h2>

            <p className="text-sm text-base-content/60">
              Ouvrez une candidature pour consulter ou modifier ses détails.
            </p>
          </div>

          <p className="text-sm text-base-content/60">
            {displayedApplications.length} candidature(s) affichée(s) sur {applications.length}
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="input input-bordered flex w-full items-center gap-2">
            <Search className="h-4 w-4 text-base-content/40" />

            <input
              className="grow"
              type="search"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Rechercher une entreprise, un poste, une ville..."
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map(function (statusFilterOption) {
              return (
                <button
                  className={getStatusFilterButtonClassName(statusFilter, statusFilterOption.value)}
                  type="button"
                  key={statusFilterOption.value}
                  onClick={function () { handleStatusFilterChange(statusFilterOption.value); }}
                >
                  {statusFilterOption.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {displayedApplications.length === 0 && (
        <div className="p-6 text-center">
          <h3 className="font-semibold">
            Aucun résultat
          </h3>

          <p className="mt-1 text-sm text-base-content/60">
            Modifiez la recherche ou le filtre pour afficher des candidatures.
          </p>
        </div>
      )}

      {displayedApplications.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-fixed min-w-[1180px]">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[18%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[9%]" />
            </colgroup>
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
              {displayedApplications.map(function (application) {
                return (
                  <tr
                    key={application.id}
                    className="border-b border-base-200 last:border-b-0 hover:bg-base-200/50"
                  >
                    <td className="text-center align-middle">
                      <button
                        className="link link-hover block w-full truncate font-semibold"
                        type="button"
                        onClick={function () { onOpenApplication(application); }}
                      >
                        {application.company}
                      </button>
                    </td>

                    <td className="text-center align-middle">
                      <span className="block truncate">
                        {application.position}
                      </span>
                    </td>

                    <td className="text-center align-middle">
                      <span className="block truncate">
                        {getContractTypeLabel(application.contractType)}
                      </span>
                    </td>

                    <td className="text-center align-middle">
                      <span className={getStatusBadgeClassName(application.status)}>
                        {getStatusLabel(application.status)}
                      </span>
                    </td>

                    <td className="text-center align-middle">
                      <span className="block truncate">
                        {formatDate(application.sentAt)}
                      </span>
                    </td>

                    <td className="text-center align-middle">
                      <span className="block truncate">
                        {formatDate(application.followUpAt)}
                      </span>
                    </td>

                    <td className="text-center align-middle">
                      <span className="block truncate">
                        {formatDate(application.interviewAt)}
                      </span>
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
      )}
    </div>
  );
}

export default ApplicationsTable;
