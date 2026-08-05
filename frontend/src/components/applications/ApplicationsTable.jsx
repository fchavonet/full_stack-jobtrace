import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Trash2 } from "lucide-react";

import { APPLICATION_STATUS_OPTIONS } from "../../constants/application.constants";
import Badge from "../ui/Badge";
import { SectionCard } from "../ui/Cards";
import Pagination from "../ui/Pagination";
import Search from "../ui/Search";
import { getApplicationContractTypeLabel, getApplicationStatusLabel } from "../../utils/applications/display.utils";
import { getApplicationFollowUpAt, getApplicationInterviewAt, getFilteredApplications, getFollowUpDisplay, getNextSortDirection, getSortedApplications } from "../../utils/applications/table.utils";
import { formatDate } from "../../utils/common/format.utils";

const statusFilters = [
  {
    value: "all",
    label: "Toutes",
  },
  ...APPLICATION_STATUS_OPTIONS,
];

const APPLICATIONS_PER_PAGE = 50;

function getApplicationStatusBadgeColor(status) {
  if (status === "sent") {
    return "info";
  }

  if (status === "follow_up") {
    return "warning";
  }

  if (status === "interview") {
    return "primary";
  }

  if (status === "rejected") {
    return "error";
  }

  if (status === "accepted") {
    return "success";
  }

  return "base";
}

function getFollowUpBadgeColor(followUpDisplay) {
  if (!followUpDisplay) {
    return "base";
  }

  if (followUpDisplay.className.includes("badge-error")) {
    return "error";
  }

  if (followUpDisplay.className.includes("badge-warning")) {
    return "warning";
  }

  if (followUpDisplay.className.includes("badge-info")) {
    return "info";
  }

  return "base";
}

function FollowUpCell({ application }) {
  const followUpAt = getApplicationFollowUpAt(application);

  if (!followUpAt) {
    return (
      <span className="block truncate text-base-content/40">
        -
      </span>
    );
  }

  const followUpDisplay = getFollowUpDisplay(followUpAt);

  if (!followUpDisplay) {
    return (
      <span className="block truncate text-base-content/40">
        -
      </span>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-1">
      <span className="block truncate">
        {formatDate(followUpAt)}
      </span>

      <Badge
        label={followUpDisplay.label}
        color={getFollowUpBadgeColor(followUpDisplay)}
        className="w-18 px-0 text-[8px]"
      />
    </div>
  );
}

function InterviewCell({ application }) {
  const interviewAt = getApplicationInterviewAt(application);

  if (!interviewAt) {
    return (
      <span className="block truncate text-base-content/40">
        -
      </span>
    );
  }

  return (
    <span className="block truncate">
      {formatDate(interviewAt)}
    </span>
  );
}

function getStatusFilterButtonClassName(currentStatusFilter, statusFilterValue) {
  let className = "btn btn-sm cursor-pointer";

  if (currentStatusFilter === statusFilterValue) {
    className = "btn btn-sm btn-primary text-primary-content cursor-pointer";
  }

  return className;
}

function SortIcon({ sortConfig, sortKey }) {
  if (sortConfig.key !== sortKey) {
    return <ChevronsUpDown className="w-4 h-4 text-base-content/40" />;
  }

  if (sortConfig.direction === "desc") {
    return <ChevronDown className="w-4 h-4" />;
  }

  return <ChevronUp className="w-4 h-4" />;
}

function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
}) {
  return (
    <th className="text-center">
      <button className="btn btn-ghost btn-xs w-full mx-auto px-1 flex flex-row justify-center items-center gap-1 font-semibold cursor-pointer" type="button" onClick={function () { onSort(sortKey); }}>
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

  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedApplications = useMemo(function () {
    const filteredApplications =
      getFilteredApplications(
        applications,
        searchValue,
        statusFilter
      );

    return getSortedApplications(
      filteredApplications,
      sortConfig
    );
  }, [
    applications,
    searchValue,
    statusFilter,
    sortConfig,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAndSortedApplications.length
      / APPLICATIONS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const displayedApplications = useMemo(function () {
    const startIndex =
      (safeCurrentPage - 1)
      * APPLICATIONS_PER_PAGE;

    const endIndex =
      startIndex
      + APPLICATIONS_PER_PAGE;

    return filteredAndSortedApplications.slice(
      startIndex,
      endIndex
    );
  }, [
    safeCurrentPage,
    filteredAndSortedApplications,
  ]);

  function handleSearchChange(event) {
    setSearchValue(event.target.value);
    setCurrentPage(1);
  }

  function handleStatusFilterChange(nextStatusFilter) {
    setStatusFilter(nextStatusFilter);
    setCurrentPage(1);
  }

  function handleSort(sortKey) {
    setCurrentPage(1);

    setSortConfig(function (currentSortConfig) {
      return {
        key: sortKey,
        direction: getNextSortDirection(currentSortConfig, sortKey),
      };
    });
  }

  function handlePageChange(nextPage) {
    setCurrentPage(nextPage);
  }

  if (applications.length === 0) {
    return (
      <SectionCard className="text-center">
        <h2 className="text-lg font-semibold text-base-content">
          Aucune candidature pour le moment
        </h2>

        <p className="mt-2 text-sm text-base-content/60">
          Créez votre première candidature pour commencer à organiser votre recherche.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <Search
        title="Candidatures enregistrées"
        description="Ouvrez une candidature pour consulter ou modifier ses détails."
        resultLabel={filteredAndSortedApplications.length + " / " + applications.length}
        value={searchValue}
        onChange={handleSearchChange}
        placeholder="Rechercher une entreprise, un poste, une ville..."
      />

      <SectionCard>
        <div className="flex flex-row flex-wrap justify-center sm:justify-start items-center gap-2">
          {statusFilters.map(function (statusFilterOption) {
            return (
              <button className={getStatusFilterButtonClassName(statusFilter, statusFilterOption.value)} type="button" key={statusFilterOption.value} onClick={function () { handleStatusFilterChange(statusFilterOption.value); }}>
                {statusFilterOption.label}
              </button>
            );
          })}
        </div>

        {filteredAndSortedApplications.length === 0 && (
          <div className="w-full mt-6 p-4 text-center rounded-xl bg-base-200">
            <h3 className="font-semibold text-base-content">
              Aucun résultat
            </h3>

            <p className="mt-2 text-sm text-base-content/60">
              Modifiez la recherche ou le filtre pour afficher des candidatures.
            </p>
          </div>
        )}

        {filteredAndSortedApplications.length > 0 && (
          <div className="w-full mt-6 overflow-x-auto">
            <table className="table table-fixed min-w-[1024px]">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
              </colgroup>

              <thead>
                <tr>
                  <SortableHeader label="Entreprise" sortKey="company" sortConfig={sortConfig} onSort={handleSort} />

                  <SortableHeader label="Poste" sortKey="position" sortConfig={sortConfig} onSort={handleSort} />

                  <SortableHeader label="Type de contrat" sortKey="contractType" sortConfig={sortConfig} onSort={handleSort} />

                  <SortableHeader label="Statut" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />

                  <SortableHeader label="Envoi" sortKey="sentAt" sortConfig={sortConfig} onSort={handleSort} />

                  <SortableHeader label="Relance" sortKey="followUpAt" sortConfig={sortConfig} onSort={handleSort} />

                  <SortableHeader label="Entretien" sortKey="interviewAt" sortConfig={sortConfig} onSort={handleSort} />

                  <th className="text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayedApplications.map(function (application) {
                  return (
                    <tr className="border-b border-base-200 last:border-b-0 hover:bg-base-200/50" key={application.id}>
                      <td className="text-center align-middle">
                        <button className="link link-hover w-full block truncate font-semibold cursor-pointer" type="button" onClick={function () { onOpenApplication(application); }}>
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
                          {getApplicationContractTypeLabel(application.contractType)}
                        </span>
                      </td>

                      <td className="text-center align-middle">
                        <Badge
                          label={getApplicationStatusLabel(application.status)}
                          color={getApplicationStatusBadgeColor(application.status)}
                          className="w-20 mx-auto"
                        />
                      </td>

                      <td className="text-center align-middle">
                        <span className="block truncate">
                          {formatDate(application.sentAt)}
                        </span>
                      </td>

                      <td className="text-center align-middle">
                        <FollowUpCell application={application} />
                      </td>

                      <td className="text-center align-middle">
                        <InterviewCell application={application} />
                      </td>

                      <td className="text-center align-middle">
                        <div className="flex flex-row justify-center items-center gap-2">
                          <button className="btn btn-ghost btn-sm btn-square cursor-pointer" type="button" onClick={function () { onOpenApplication(application); }} aria-label="Voir la candidature">
                            <Eye className="w-4 h-4" />
                          </button>

                          <button className="btn btn-ghost btn-sm btn-square text-error cursor-pointer" type="button" onClick={function () { onDeleteApplication(application); }} aria-label="Supprimer la candidature">
                            <Trash2 className="w-4 h-4" />
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

        {filteredAndSortedApplications.length > APPLICATIONS_PER_PAGE && (
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </SectionCard>
    </div>
  );
}

export default ApplicationsTable;
