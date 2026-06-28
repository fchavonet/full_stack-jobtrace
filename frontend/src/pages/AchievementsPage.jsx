import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listAchievements } from "../api/achievements.api";
import { listApplications } from "../api/applications.api";
import { getUserProfile } from "../api/profile.api";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../hooks/useToast";
import {
  buildLastThirtyDaysActivity,
  countApplicationsForDate,
  getApplicationsCountFromActivity,
  getBestDayCount,
  getObjectiveProgress,
  getObjectiveProgressLabel,
  getReachedDaysCount,
  getSafeDailyGoal,
  normalizeAchievements,
} from "../utils/achievements/objective.utils";
import { getListFromResponse } from "../utils/common/apiResponse.utils";
import { formatDate } from "../utils/common/format.utils";
import { getProfileFromResponse } from "../utils/profile/profile.utils";

function getActivityBarClassName(day) {
  let className = "w-full rounded-t-md bg-primary/40";

  if (day.reached) {
    className = "w-full rounded-t-md bg-success";
  }

  if (day.count === 0) {
    className = "w-full rounded-t-md bg-base-300";
  }

  return className;
}

function getActivityBarHeight(day) {
  if (day.progress === 0) {
    return "8px";
  }

  return Math.max(day.progress, 12) + "%";
}

function getAchievementCardClassName(achievement) {
  let className = "w-full min-w-0 p-4 rounded-xl bg-base-200";

  if (!achievement.unlocked) {
    className = className + " opacity-70";
  }

  return className;
}

function getAchievementStatusLabel(achievement) {
  if (achievement.unlocked) {
    return "Débloqué";
  }

  return "À débloquer";
}

function getAchievementStatusClassName(achievement) {
  if (achievement.unlocked) {
    return "badge badge-success text-success-content";
  }

  return "badge badge-ghost";
}

function SummaryCard({ label, value, helper }) {
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

        <p className="shrink-0 text-2xl font-black text-base-content">
          {value}
        </p>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  return (
    <div className={getAchievementCardClassName(achievement)}>
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h3 className="font-bold text-base-content">
            {achievement.name}
          </h3>

          <p className="mt-1 text-sm text-base-content/60">
            {achievement.description}
          </p>

          {achievement.unlockedAt && (
            <p className="mt-4 text-xs text-base-content/50">
              Débloqué le {formatDate(achievement.unlockedAt)}
            </p>
          )}
        </div>

        <span className={getAchievementStatusClassName(achievement)}>
          {getAchievementStatusLabel(achievement)}
        </span>
      </div>
    </div>
  );
}

function DailyObjectiveCard({
  todayApplicationsCount,
  dailyGoal,
  todayProgress,
}) {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-base-content">
            Objectif du jour
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            {todayApplicationsCount} candidature(s) créée(s) sur {dailyGoal} attendue(s).
          </p>

          <p className="mt-4 text-sm text-base-content/60">
            L’objectif quotidien se règle dans les{" "}
            <Link className="link link-primary cursor-pointer" to="/dashboard/settings">
              paramètres
            </Link>
            .
          </p>
        </div>

        <div className="w-full md:w-auto text-left md:text-right">
          <p className="text-5xl font-black text-primary">
            {todayProgress}%
          </p>

          <p className="mt-1 text-sm text-base-content/60">
            {getObjectiveProgressLabel(todayApplicationsCount, dailyGoal)}
          </p>
        </div>
      </div>

      <progress
        className="progress progress-primary w-full h-4 mt-6"
        value={todayProgress}
        max="100"
      />
    </div>
  );
}

function ActivityCard({ activity }) {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        Activité des 30 derniers jours
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
        Chaque barre représente les candidatures créées sur une journée.
      </p>

      <div className="w-full h-44 mt-6 pb-2 flex flex-row justify-start items-end gap-1 overflow-x-auto">
        {activity.map(function (day) {
          return (
            <div
              className="h-full min-w-8 flex flex-col justify-end items-center gap-2"
              key={day.date}
              title={formatDate(day.date) + " - " + day.count + " candidature(s)"}
            >
              <div className="w-full h-full flex flex-row justify-center items-end rounded-t-md bg-base-200">
                <div
                  className={getActivityBarClassName(day)}
                  style={{ height: getActivityBarHeight(day) }}
                />
              </div>

              <span className="text-xs text-base-content/50">
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AchievementsCard({ achievements }) {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        Badges de progression
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
        Les badges indiquent les étapes importantes atteintes dans votre suivi de candidatures.
      </p>

      <div className="w-full mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {achievements.map(function (achievement) {
          return (
            <AchievementCard achievement={achievement} key={achievement.id} />
          );
        })}
      </div>
    </div>
  );
}

function AchievementsPage() {
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadObjectivesData() {
      try {
        const [applicationsResponse, profileResponse] = await Promise.all([
          listApplications(),
          getUserProfile(),
        ]);

        const profile = getProfileFromResponse(profileResponse);
        const profileDailyGoal = getSafeDailyGoal(profile.dailyGoal);

        setApplications(getListFromResponse(applicationsResponse, "applications"));
        setDailyGoal(profileDailyGoal);

        try {
          const achievementsResponse = await listAchievements();
          setAchievements(getListFromResponse(achievementsResponse, "achievements"));
        } catch {
          setAchievements([]);
        }
      } catch {
        showToast("Impossible de charger les objectifs.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadObjectivesData();
  }, [showToast]);

  const todayApplicationsCount = useMemo(function () {
    return countApplicationsForDate(applications, new Date());
  }, [applications]);

  const todayProgress = useMemo(function () {
    return getObjectiveProgress(todayApplicationsCount, dailyGoal);
  }, [todayApplicationsCount, dailyGoal]);

  const activity = useMemo(function () {
    return buildLastThirtyDaysActivity(applications, dailyGoal);
  }, [applications, dailyGoal]);

  const reachedDaysCount = useMemo(function () {
    return getReachedDaysCount(activity);
  }, [activity]);

  const monthlyApplicationsCount = useMemo(function () {
    return getApplicationsCountFromActivity(activity);
  }, [activity]);

  const bestDayCount = useMemo(function () {
    return getBestDayCount(activity);
  }, [activity]);

  const displayedAchievements = useMemo(function () {
    return normalizeAchievements(
      achievements,
      applications.length,
      reachedDaysCount,
    );
  }, [achievements, applications.length, reachedDaysCount]);

  if (loading) {
    return (
      <section>
        <PageHeader title="Objectifs" />

        <LoadingCard />
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <PageHeader
        title="Objectifs"
        description="Suivez votre rythme de candidature et vos badges de progression."
      />

      <DailyObjectiveCard
        dailyGoal={dailyGoal}
        todayApplicationsCount={todayApplicationsCount}
        todayProgress={todayProgress}
      />

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Objectif atteint"
          value={reachedDaysCount + " jours"}
          helper="Sur les 30 derniers jours."
        />

        <SummaryCard
          label="Candidatures sur 30 jours"
          value={monthlyApplicationsCount}
          helper="Total des créations récentes."
        />

        <SummaryCard
          label="Meilleur jour"
          value={bestDayCount}
          helper="Meilleur volume quotidien récent."
        />
      </div>

      <ActivityCard activity={activity} />

      <AchievementsCard achievements={displayedAchievements} />
    </section>
  );
}

export default AchievementsPage;
