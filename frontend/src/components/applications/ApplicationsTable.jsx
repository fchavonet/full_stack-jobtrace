import { Eye, Trash2 } from "lucide-react";

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

function ApplicationsTable({
  applications,
  onOpenApplication,
  onDeleteApplication,
}) {
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
        <table className="table table-zebra">
          <thead>
            <tr>
              <th className="text-center">
                Entreprise
              </th>

              <th className="text-center">
                Poste
              </th>

              <th className="text-center">
                Type de contrat
              </th>

              <th className="text-center">
                Statut
              </th>

              <th className="text-center">
                Date d’envoi
              </th>

              <th className="text-center">
                Date de relance
              </th>

              <th className="text-center">
                Date d’entretien
              </th>

              <th className="text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {applications.map(function (application) {
              return (
                <tr key={application.id} className="hover">
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
