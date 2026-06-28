import {
  Award,
  BarChart3,
  CheckCircle2,
  Lock,
  Settings,
  Target,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listAchievements } from "../api/achievements.api";
import { listApplications } from "../api/applications.api";
import { getUserProfile } from "../api/profile.api";
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
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";

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
  let className = "rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm";

  if (!achievement.unlocked) {
    className = className + " opacity-60";
  }

  return className;
}

function getAchievementIconClassName(achievement) {
  let className = "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-base-200 text-base-content/50";

  if (achievement.unlocked) {
    className = "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content";
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
    return "badge badge-success";
  }

  return "badge badge-ghost";
}

function SummaryCard({ icon, label, value, helper }) {
  return (
    <div className="rounded-2xl bg-base-100 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>

        <div>
          <p className="text-sm text-base-content/60">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>

          {helper && (
            <p className="mt-1 text-xs text-base-content/50">
              {helper}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  return (
    <div className={getAchievementCardClassName(achievement)}>
      <div className="flex items-start gap-4">
        <div className={getAchievementIconClassName(achievement)}>
          {achievement.unlocked && (
            <Trophy className="h-6 w-6" />
          )}

          {!achievement.unlocked && (
            <Lock className="h-6 w-6" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="font-bold">
              {achievement.name}
            </h3>

            <span className={getAchievementStatusClassName(achievement)}>
              {getAchievementStatusLabel(achievement)}
            </span>
          </div>

          <p className="mt-2 text-sm text-base-content/60">
            {achievement.description}
          </p>

          {achievement.unlockedAt && (
            <p className="mt-3 text-xs text-base-content/50">
              Débloqué le {formatDate(achievement.unlockedAt)}
            </p>
          )}
        </div>
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
    <section>
      <PageHeader
        title="Objectifs"
        description="Suivez votre rythme de candidature et vos badges de progression."
      />

      <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-6 w-6" />

              <h2 className="text-xl font-bold">
                Objectif du jour
              </h2>
            </div>

            <p className="mt-2 text-base-content/60">
              {todayApplicationsCount} candidature(s) créée(s) sur {dailyGoal} attendue(s).
            </p>

            <p className="mt-2 flex items-center gap-2 text-sm text-base-content/50">
              <Settings className="h-4 w-4" />

              <span>
                L’objectif quotidien se règle dans les{" "}
                <Link className="link link-primary" to="/dashboard/settings">
                  paramètres
                </Link>
                .
              </span>
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-5xl font-black text-primary">
              {todayProgress}%
            </p>

            <p className="text-sm text-base-content/60">
              {getObjectiveProgressLabel(todayApplicationsCount, dailyGoal)}
            </p>
          </div>
        </div>

        <progress
          className="progress progress-primary mt-6 h-4 w-full"
          value={todayProgress}
          max="100"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Objectif atteint"
          value={reachedDaysCount + " jours sur 30"}
          helper="Basé sur les candidatures créées dans JobTrace."
        />

        <SummaryCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Candidatures sur 30 jours"
          value={monthlyApplicationsCount}
          helper="Total des créations récentes."
        />

        <SummaryCard
          icon={<Award className="h-5 w-5" />}
          label="Meilleur jour"
          value={bestDayCount + " candidature(s)"}
          helper="Meilleur volume quotidien récent."
        />
      </div>

      <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold">
            Activité des 30 derniers jours
          </h2>

          <p className="text-sm text-base-content/60">
            Chaque barre représente les candidatures créées sur une journée.
          </p>
        </div>

        <div className="mt-6 flex h-44 items-end gap-1 overflow-x-auto pb-2">
          {activity.map(function (day) {
            return (
              <div
                className="flex h-full min-w-8 flex-col items-center justify-end gap-2"
                key={day.date}
                title={formatDate(day.date) + " - " + day.count + " candidature(s)"}
              >
                <div className="flex h-full w-full items-end rounded-t-md bg-base-200">
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

      <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />

          <h2 className="text-xl font-bold">
            Badges de progression
          </h2>
        </div>

        <p className="mt-2 text-sm text-base-content/60">
          Les badges indiquent les étapes importantes atteintes dans votre suivi de candidatures.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {displayedAchievements.map(function (achievement) {
            return (
              <AchievementCard achievement={achievement} key={achievement.id} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AchievementsPage;
