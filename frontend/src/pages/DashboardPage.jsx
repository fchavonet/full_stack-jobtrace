import {
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listApplications } from "../api/applications.api";
import { getUserProfile } from "../api/profile.api";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  getApplicationStatusBadgeClassName,
  getApplicationStatusLabel,
} from "../utils/applications/display.utils";
import { getListFromResponse } from "../utils/common/apiResponse.utils";
import {
  JOB_SEARCH_LINKS,
  formatDashboardDate,
  getApplicationCompany,
  getApplicationDashboardLink,
  getApplicationFollowUpAt,
  getApplicationInterviewAt,
  getApplicationPosition,
  getApplicationSentAt,
  getApplicationStatus,
  getApplicationTitle,
  getDailyObjectiveSummary,
  getDashboardDisplayName,
  getLatestApplications,
  getUpcomingFollowUps,
  getUpcomingInterviews,
} from "../utils/dashboard/dashboardHome.utils";
import { getProfileFromResponse } from "../utils/profile/profile.utils";
import {
  getPercentLabel,
  getProgressWidth,
  getStatisticsSummary,
} from "../utils/statistics/statistics.utils";

function DashboardHeader() {
  const actions = (
    <Link className="btn btn-primary w-full md:w-auto flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer" to="/dashboard/applications?new=1">
      <PlusCircle className="w-5 h-5" />
      Nouvelle candidature
    </Link>
  );

  return (
    <PageHeader
      title="Tableau de bord"
      description="Retrouvez vos candidatures, vos prochaines échéances et vos indicateurs principaux."
      actions={actions}
    />
  );
}

function DashboardStatCard({ label, value, helper }) {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-base-content">
            {label}
          </h2>

          <p className="mt-1 text-xs text-base-content/60">
            {helper}
          </p>
        </div>

        <p className="shrink-0 text-3xl font-black text-base-content">
          {value}
        </p>
      </div>
    </div>
  );
}

function WelcomeCard({ displayName }) {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        Bienvenue
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
        Suivez votre recherche d’emploi en un coup d’œil depuis votre espace personnel.
      </p>

      <p className="mt-6 text-3xl md:text-4xl font-black text-base-content break-words">
        {displayName}
      </p>
    </div>
  );
}

function ObjectiveCompactCard({ objective }) {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-base-content">
            Objectif du jour
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Suivez votre rythme de candidature quotidien.
          </p>
        </div>

        <Link className="btn btn-outline btn-sm shrink-0 cursor-pointer" to="/dashboard/achievements">
          Voir
        </Link>
      </div>

      <div className="w-full mt-6">
        <p className="text-4xl font-black text-base-content">
          {objective.completedToday} / {objective.dailyGoal}
        </p>

        <p className="mt-1 text-sm text-base-content/60">
          {objective.remaining} candidature(s) restante(s)
        </p>

        <div className="w-full h-4 mt-4 rounded-full bg-base-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: getProgressWidth(objective.completedToday, objective.dailyGoal) }}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyListMessage({ label }) {
  return (
    <div className="w-full min-w-0 p-4 rounded-xl bg-base-200">
      <p className="text-sm text-base-content/60">
        {label}
      </p>
    </div>
  );
}

function TodoEntry({ entry, dateGetter }) {
  const application = entry.application;

  return (
    <Link
      className="w-full min-w-0 p-4 flex flex-row justify-between items-center gap-4 rounded-xl bg-base-200 hover:bg-base-300 cursor-pointer"
      to={getApplicationDashboardLink(application)}
    >
      <div className="min-w-0">
        <h4 className="font-semibold text-base-content truncate">
          {getApplicationCompany(application)}
        </h4>

        <p className="mt-1 text-sm text-base-content/60 truncate">
          {getApplicationPosition(application)}
        </p>
      </div>

      <span className="shrink-0 px-4 py-2 text-sm font-bold text-primary rounded-full bg-primary/10">
        {formatDashboardDate(dateGetter(application))}
      </span>
    </Link>
  );
}

function TodoColumn({ title, entries, emptyLabel, dateGetter }) {
  return (
    <div className="w-full min-w-0">
      <h3 className="text-base font-bold text-base-content">
        {title}
      </h3>

      <div className="w-full mt-4 flex flex-col justify-start items-stretch gap-2">
        {entries.length === 0 && (
          <EmptyListMessage label={emptyLabel} />
        )}

        {entries.length > 0 && entries.map(function (entry) {
          return (
            <TodoEntry
              dateGetter={dateGetter}
              entry={entry}
              key={entry.application.id}
            />
          );
        })}
      </div>
    </div>
  );
}

function TodoCard({ followUps, interviews }) {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        À faire
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
        Les prochaines actions à traiter sur vos candidatures.
      </p>

      <div className="w-full mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodoColumn
          dateGetter={getApplicationFollowUpAt}
          emptyLabel="Aucune relance prévue."
          entries={followUps}
          title="Prochaines relances"
        />

        <TodoColumn
          dateGetter={getApplicationInterviewAt}
          emptyLabel="Aucun entretien prévu."
          entries={interviews}
          title="Prochains entretiens"
        />
      </div>
    </div>
  );
}

function LatestApplicationRow({ application }) {
  const status = getApplicationStatus(application);

  return (
    <Link
      className="w-full min-w-0 p-4 flex flex-row justify-between items-center gap-4 rounded-xl bg-base-200 hover:bg-base-300 cursor-pointer"
      to={getApplicationDashboardLink(application)}
    >
      <div className="min-w-0">
        <h4 className="font-semibold text-base-content truncate">
          {getApplicationTitle(application)}
        </h4>

        <p className="mt-1 text-sm text-base-content/60 truncate">
          Envoyée le {formatDashboardDate(getApplicationSentAt(application))}
        </p>
      </div>

      <span className={getApplicationStatusBadgeClassName(status)}>
        {getApplicationStatusLabel(status)}
      </span>
    </Link>
  );
}

function LatestApplicationsCard({ applications }) {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        Dernières candidatures
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
        Les cinq candidatures les plus récemment ajoutées.
      </p>

      <div className="w-full mt-6 flex flex-col justify-start items-stretch gap-2">
        {applications.length === 0 && (
          <EmptyListMessage label="Aucune candidature récente." />
        )}

        {applications.length > 0 && applications.map(function (application) {
          return (
            <LatestApplicationRow
              application={application}
              key={application.id}
            />
          );
        })}
      </div>
    </div>
  );
}

function JobLinksCard() {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        Sites emploi utiles
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
        Accès rapide aux principales plateformes de recherche d’emploi en France.
      </p>

      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {JOB_SEARCH_LINKS.map(function (link) {
          return (
            <a
              className="w-full min-w-0 p-4 flex flex-row justify-between items-center gap-4 rounded-xl bg-base-200 hover:bg-base-300 cursor-pointer"
              href={link.url}
              key={link.key}
              rel="noreferrer"
              target="_blank"
            >
              <div className="min-w-0">
                <h3 className="font-bold text-base-content truncate">
                  {link.label}
                </h3>

                <p className="mt-1 text-xs text-base-content/60 truncate">
                  {link.description}
                </p>
              </div>

              <ExternalLink className="w-4 h-4 shrink-0 text-primary" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadDashboardData() {
      try {
        const applicationsResponse = await listApplications();
        setApplications(getListFromResponse(applicationsResponse, "applications"));
      } catch {
        showToast("Impossible de charger les candidatures du tableau de bord.", "error");
      }

      try {
        const profileResponse = await getUserProfile();
        setProfile(getProfileFromResponse(profileResponse) || {});
      } catch {
        setProfile({});
      }

      setLoading(false);
    }

    loadDashboardData();
  }, [showToast]);

  const summary = useMemo(function () {
    return getStatisticsSummary(applications);
  }, [applications]);

  const objective = useMemo(function () {
    return getDailyObjectiveSummary(applications, profile);
  }, [applications, profile]);

  const followUps = useMemo(function () {
    return getUpcomingFollowUps(applications, 5);
  }, [applications]);

  const interviews = useMemo(function () {
    return getUpcomingInterviews(applications, 5);
  }, [applications]);

  const latestApplications = useMemo(function () {
    return getLatestApplications(applications, 5);
  }, [applications]);

  const displayName = useMemo(function () {
    return getDashboardDisplayName(profile, user);
  }, [profile, user]);

  if (loading) {
    return (
      <section>
        <DashboardHeader />

        <LoadingCard />
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <DashboardHeader />

      <div className="w-full grid grid-cols-1 xl:grid-cols-[1.6fr_0.9fr] gap-6">
        <WelcomeCard displayName={displayName} />

        <ObjectiveCompactCard objective={objective} />
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardStatCard
          helper={summary.active + " candidature(s) active(s)"}
          label="Total candidatures"
          value={summary.total}
        />

        <DashboardStatCard
          helper={summary.interviewRate + " % du total"}
          label="Total entretiens"
          value={summary.interviews}
        />

        <DashboardStatCard
          helper={getPercentLabel(summary.rejected, summary.total) + " du total"}
          label="Total refusées"
          value={summary.rejected}
        />

        <DashboardStatCard
          helper={summary.successRate + " % de réussite"}
          label="Total acceptées"
          value={summary.accepted}
        />
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <TodoCard
          followUps={followUps}
          interviews={interviews}
        />

        <LatestApplicationsCard applications={latestApplications} />
      </div>

      <JobLinksCard />
    </section>
  );
}

export default DashboardPage;
