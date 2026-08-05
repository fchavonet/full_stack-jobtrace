import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { PlusCircle } from "lucide-react";

import { JOB_BOARD_LINKS } from "../constants/jobBoards.constants";

import { listApplications } from "../api/applications.api";
import { getUserProfile } from "../api/profile.api";

import { ItemCard, MetricCard, ProgressItemCard, SectionCard } from "../components/ui/Cards";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";

import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

import { getApplicationStatusBadgeClassName, getApplicationStatusLabel } from "../utils/applications/display.utils";
import { getListFromResponse } from "../utils/common/apiResponse.utils";
import * as dashboardHome from "../utils/dashboard/dashboardHome.utils";
import { getProfileFromResponse } from "../utils/profile/profile.utils";
import { getPercentLabel, getProgressWidth, getStatisticsSummary } from "../utils/statistics/statistics.utils";

// Header
function DashboardHeader() {
  return (
    <PageHeader
      title="Tableau de bord"
      description="Gardez une vue d’ensemble sur votre recherche d’emploi."
      actions={
        <Link className="btn btn-primary w-full md:w-auto flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer" to="/dashboard/applications?new=1">
          <PlusCircle className="w-5 h-5" />
          Nouvelle candidature
        </Link>
      }
    />
  );
}

// Welcome section
function getDashboardThemeLabel(theme) {
  if (theme === "dark") {
    return "Sombre";
  }

  return "Clair";
}

function getDashboardDailyGoal(profile) {
  if (profile.dailyGoal) {
    return String(profile.dailyGoal);
  }

  return "5";
}

function getDashboardFollowUpDelay(profile) {
  if (profile.followUpDelayDays) {
    return profile.followUpDelayDays + " jour(s)";
  }

  return "15 jour(s)";
}

function WelcomeSettingItem({ label, value, field }) {
  return (
    <ItemCard
      as={Link}
      interactive
      title={label}
      subtitle={value}
      to={"/dashboard/settings?section=preferences&field=" + field}
    />
  );
}

function WelcomeCard({ displayName, profile }) {
  return (
    <article className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-lg font-semibold text-primary">
        Bienvenue
      </h2>

      <p className="text-2xl md:text-4xl font-black text-base-content break-words">
        {displayName}
      </p>

      <p className="mt-1 text-sm text-base-content/60">
        Vos réglages actuels pour organiser votre suivi.
      </p>

      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <WelcomeSettingItem
          label="Thème"
          value={getDashboardThemeLabel(profile.theme)}
          field="theme"
        />

        <WelcomeSettingItem
          label="Objectif quotidien"
          value={getDashboardDailyGoal(profile) + " candidature(s)"}
          field="dailyGoal"
        />

        <WelcomeSettingItem
          label="Délai de relance"
          value={getDashboardFollowUpDelay(profile)}
          field="followUpDelayDays"
        />
      </div>
    </article>
  );
}

// Daily objective section
function ObjectiveCompactCard({ objective }) {
  return (
    <SectionCard
      className="h-full flex flex-col"
      contentClassName="flex-1 flex flex-col"
      title="Objectif journalier"
      description="Votre progression en cours."
    >
      <Link className="h-full flex flex-col" to="/dashboard/achievements">
        <ProgressItemCard
          className="h-full flex flex-col justify-between hover:bg-base-300 cursor-pointer"
          title="Progression du jour"
          subtitle={objective.remaining + " candidature(s) restante(s)"}
          value={objective.completedToday + " / " + objective.dailyGoal}
          valueClassName="text-2xl md:text-4xl"
          progressWidth={getProgressWidth(
            objective.completedToday,
            objective.dailyGoal
          )}
        />
      </Link>
    </SectionCard>
  );
}

// Follow-up actions section
function EmptyListMessage({ label }) {
  return (
    <ItemCard>
      <p className="text-sm text-base-content/60">
        {label}
      </p>
    </ItemCard>
  );
}

function getTodoBadgeClassName(type) {
  if (type === "interview") {
    return getApplicationStatusBadgeClassName("interview");
  }

  return "badge badge-warning text-warning-content";
}

function getTodoBadgeLabel(type) {
  if (type === "interview") {
    return "Entretien";
  }

  return "À relancer";
}

function getTodoDateClassName(type) {
  if (type === "interview") {
    return "text-xs font-semibold text-primary";
  }

  return "text-xs font-semibold text-warning";
}

function TodoEntry({ entry, dateGetter, type }) {
  const application = entry.application;

  return (
    <ItemCard
      as={Link}
      interactive
      title={dashboardHome.getApplicationCompany(application)}
      subtitle={dashboardHome.getApplicationPosition(application)}
      to={dashboardHome.getApplicationDashboardLink(application)}

      rightElement={
        <div className="shrink-0 flex flex-col justify-center items-end gap-1">
          <span className={getTodoBadgeClassName(type)}>
            {getTodoBadgeLabel(type)}
          </span>

          <span className={getTodoDateClassName(type)}>
            {dashboardHome.formatDashboardDate(dateGetter(application))}
          </span>
        </div>
      }
    />
  );
}

function TodoColumn({ entries, emptyLabel, dateGetter, type }) {
  return (
    <div className="w-full min-w-0 flex flex-col justify-start items-stretch gap-2">
      {entries.length === 0 && (
        <EmptyListMessage label={emptyLabel} />
      )}

      {entries.length > 0 && entries.map(function (entry) {
        return (
          <TodoEntry
            key={entry.application.id}
            entry={entry}
            dateGetter={dateGetter}
            type={type}
          />
        );
      })}
    </div>
  );
}

function TodoCard({ followUps, interviews }) {
  return (
    <SectionCard
      title="À faire"
      description="Vos prochaines actions de suivi."
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
        <TodoColumn
          entries={followUps}
          emptyLabel="Aucune relance prévue."
          dateGetter={dashboardHome.getApplicationFollowUpAt}
          type="followUp"
        />

        <TodoColumn
          entries={interviews}
          emptyLabel="Aucun entretien prévu."
          dateGetter={dashboardHome.getApplicationInterviewAt}
          type="interview"
        />
      </div>
    </SectionCard>
  );
}

// Latest applications section
function LatestApplicationRow({ application }) {
  const status = dashboardHome.getApplicationStatus(application);

  return (
    <ItemCard
      as={Link}
      interactive
      title={dashboardHome.getApplicationTitle(application)}
      subtitle={"Envoyée le " + dashboardHome.formatDashboardDate(dashboardHome.getApplicationSentAt(application))}
      to={dashboardHome.getApplicationDashboardLink(application)}

      rightElement={
        <span className={getApplicationStatusBadgeClassName(status)}>
          {getApplicationStatusLabel(status)}
        </span>
      }
    />
  );
}

function LatestApplicationsCard({ applications }) {
  return (
    <SectionCard
      title="Dernières candidatures"
      description="Vos cinq dernières candidatures."
    >
      <div className="w-full flex flex-col justify-start items-stretch gap-2">
        {applications.length === 0 && (
          <EmptyListMessage label="Aucune candidature récente." />
        )}

        {applications.length > 0 && applications.map(function (application) {
          return (
            <LatestApplicationRow
              key={application.id}
              application={application}
            />
          );
        })}
      </div>
    </SectionCard>
  );
}

// Job boards section
function JobLinksCard() {
  return (
    <SectionCard
      title="Sites emploi utiles"
      description="Votre accès rapide aux principales plateformes de recherche d’emploi en France."
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        {JOB_BOARD_LINKS.map(function (link) {
          return (
            <ItemCard
              key={link.key}
              as="a"
              interactive
              title={link.label}
              subtitle={link.description}
              href={link.url}
              target="_blank"
              rel="noreferrer"

              rightElement={
                <span className="w-32 h-12 shrink-0 p-2 flex justify-center items-center rounded-xl bg-white ring-1 ring-black/10">
                  <img
                    className="max-h-8 w-auto max-w-full object-contain"
                    width="112"
                    height="40"
                    src={link.logo}
                    alt={"Logo " + link.label}
                    loading="lazy"
                    decoding="async"
                  />                </span>
              }
            />
          );
        })}
      </div>
    </SectionCard>
  );
}

// Page container
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
    return dashboardHome.getDailyObjectiveSummary(applications, profile);
  }, [applications, profile]);

  const followUps = useMemo(function () {
    return dashboardHome.getUpcomingFollowUps(applications, 5);
  }, [applications]);

  const interviews = useMemo(function () {
    return dashboardHome.getUpcomingInterviews(applications, 5);
  }, [applications]);

  const latestApplications = useMemo(function () {
    return dashboardHome.getLatestApplications(applications, 5);
  }, [applications]);

  const displayName = useMemo(function () {
    return dashboardHome.getDashboardDisplayName(profile, user);
  }, [profile, user]);

  if (loading) {
    return (
      <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
        <DashboardHeader />
        <LoadingCard />
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <DashboardHeader />

      <div className="w-full grid grid-cols-1 xl:grid-cols-[1.6fr_0.9fr] gap-6">
        <WelcomeCard
          displayName={displayName}
          profile={profile}
        />

        <ObjectiveCompactCard objective={objective} />
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total candidatures"
          value={summary.total}
          helper={summary.active + " candidature(s) active(s)"}
          accentClassName="border-info"
        />

        <MetricCard
          label="Total entretiens"
          value={summary.interviews}
          helper={summary.interviewRate + " % du total"}
          accentClassName="border-primary"
        />

        <MetricCard
          label="Total refusées"
          value={summary.rejected}
          helper={getPercentLabel(summary.rejected, summary.total) + " du total"}
          accentClassName="border-error"
        />

        <MetricCard
          label="Total acceptées"
          value={summary.accepted}
          helper={summary.successRate + " % de réussite"}
          accentClassName="border-success"
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
