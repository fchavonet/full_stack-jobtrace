import {
  Award,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Flag,
  ListTodo,
  PlusCircle,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import PageHeader from "../components/ui/PageHeader";
import { listApplications } from "../api/applications.api";
import { getUserProfile } from "../api/profile.api";
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

function DashboardStatCard({ icon, label, value, helper }) {
  return (
    <div className="min-w-0 rounded-2xl bg-base-100 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-base-content/60">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black">
            {value}
          </p>

          <p className="mt-1 text-xs text-base-content/50">
            {helper}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

function WelcomeCard({ displayName }) {
  return (
    <div className="min-w-0 rounded-2xl bg-base-100 p-6 shadow-sm">
      <p className="text-sm font-medium text-primary">
        Bienvenue
      </p>

      <h2 className="mt-2 break-words text-3xl font-black lg:text-4xl">
        {displayName}
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-base-content/60">
        Suivez votre recherche d’emploi en un coup d’œil depuis votre espace personnel.
      </p>
    </div>
  );
}

function ObjectiveCompactCard({ objective }) {
  return (
    <div className="min-w-0 rounded-2xl bg-base-100 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />

            <h2 className="text-xl font-bold">
              Objectif du jour
            </h2>
          </div>

          <p className="mt-4 text-4xl font-black">
            {objective.completedToday} / {objective.dailyGoal}
          </p>

          <p className="mt-1 text-sm text-base-content/60">
            {objective.remaining} candidature(s) restante(s)
          </p>
        </div>

        <Link className="btn btn-sm btn-outline" to="/dashboard/achievements">
          Voir
        </Link>
      </div>

      <div className="mt-6 h-4 overflow-hidden rounded-full bg-base-200">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: getProgressWidth(objective.completedToday, objective.dailyGoal) }}
        />
      </div>
    </div>
  );
}

function EmptyListMessage({ label }) {
  return (
    <div className="rounded-2xl bg-base-200 p-4">
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
      className="flex min-w-0 items-center justify-between gap-4 rounded-2xl bg-base-200 p-4 hover:bg-base-300"
      to={getApplicationDashboardLink(application)}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold">
          {getApplicationCompany(application)}
        </p>

        <p className="mt-1 truncate text-sm text-base-content/50">
          {getApplicationPosition(application)}
        </p>
      </div>

      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
        {formatDashboardDate(dateGetter(application))}
      </span>
    </Link>
  );
}

function TodoColumn({ title, entries, emptyLabel, dateGetter }) {
  return (
    <div className="min-w-0">
      <h3 className="font-bold">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
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
    <div className="min-w-0 rounded-2xl bg-base-100 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <ListTodo className="h-6 w-6 text-primary" />

        <h2 className="text-xl font-bold">
          À faire
        </h2>
      </div>

      <p className="mt-2 text-sm text-base-content/60">
        Les prochaines actions à traiter sur vos candidatures.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
      className="flex min-w-0 items-center justify-between gap-4 rounded-2xl bg-base-200 p-4 hover:bg-base-300"
      to={getApplicationDashboardLink(application)}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold">
          {getApplicationTitle(application)}
        </p>

        <p className="mt-1 truncate text-sm text-base-content/50">
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
    <div className="min-w-0 rounded-2xl bg-base-100 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-6 w-6 text-primary" />

        <h2 className="text-xl font-bold">
          Dernières candidatures
        </h2>
      </div>

      <p className="mt-2 text-sm text-base-content/60">
        Les cinq candidatures les plus récemment ajoutées.
      </p>

      <div className="mt-6 space-y-3">
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
    <div className="rounded-2xl bg-base-100 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <BriefcaseBusiness className="h-6 w-6 text-primary" />

        <h2 className="text-xl font-bold">
          Sites emploi utiles
        </h2>
      </div>

      <p className="mt-2 text-sm text-base-content/60">
        Accès rapide aux principales plateformes de recherche d’emploi en France.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {JOB_SEARCH_LINKS.map(function (link) {
          return (
            <a
              className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-base-200 p-4 hover:bg-base-300"
              href={link.url}
              key={link.key}
              rel="noreferrer"
              target="_blank"
            >
              <div className="min-w-0">
                <p className="truncate font-bold">
                  {link.label}
                </p>

                <p className="mt-1 truncate text-xs text-base-content/50">
                  {link.description}
                </p>
              </div>

              <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
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

        <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
          <span className="loading loading-spinner loading-md" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <DashboardHeader />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <WelcomeCard displayName={displayName} />

        <ObjectiveCompactCard objective={objective} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          helper={summary.active + " candidature(s) active(s)"}
          icon={<BriefcaseBusiness className="h-6 w-6" />}
          label="Total candidatures"
          value={summary.total}
        />

        <DashboardStatCard
          helper={summary.interviewRate + " % du total"}
          icon={<Award className="h-6 w-6" />}
          label="Total entretiens"
          value={summary.interviews}
        />

        <DashboardStatCard
          helper={getPercentLabel(summary.rejected, summary.total) + " du total"}
          icon={<Flag className="h-6 w-6" />}
          label="Total refusées"
          value={summary.rejected}
        />

        <DashboardStatCard
          helper={summary.successRate + " % de réussite"}
          icon={<CheckCircle2 className="h-6 w-6" />}
          label="Total acceptées"
          value={summary.accepted}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
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
