import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Award,
  Bell,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  FileText,
  Goal,
  Link as LinkIcon,
  LockKeyhole,
  Tag,
  Target,
  Trophy,
  User,
} from "lucide-react";

import { listAchievements } from "../api/achievements.api";
import { listApplications } from "../api/applications.api";
import { getUserProfile } from "../api/profile.api";
import { ItemCard, MetricCard, SectionCard } from "../components/ui/Cards";
import IconBox from "../components/ui/IconBox";
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
} from "../utils/achievements/objective.utils";
import { getListFromResponse } from "../utils/common/apiResponse.utils";
import { formatDate } from "../utils/common/format.utils";
import { getProfileFromResponse } from "../utils/profile/profile.utils";

function getActivityBarClassName(day) {
  let className = "w-full rounded-t-lg bg-primary/40";

  if (day.reached) {
    className = "w-full rounded-t-lg bg-success";
  }

  if (day.count === 0) {
    className = "w-full rounded-t-lg bg-base-300";
  }

  return className;
}

function getActivityBarHeight(day) {
  if (day.progress === 0) {
    return "8px";
  }

  return Math.max(day.progress, 12) + "%";
}

function getAchievementId(achievement) {
  if (achievement.id) {
    return achievement.id;
  }

  if (achievement.slug) {
    return achievement.slug;
  }

  if (achievement.key) {
    return achievement.key;
  }

  return achievement.name;
}

function getAchievementSlug(achievement) {
  if (achievement.slug) {
    return achievement.slug;
  }

  if (achievement.key) {
    return achievement.key;
  }

  return "";
}

function getAchievementName(achievement) {
  if (achievement.name) {
    return achievement.name;
  }

  if (achievement.title) {
    return achievement.title;
  }

  return "Badge";
}

function getAchievementDescription(achievement) {
  if (achievement.description) {
    return achievement.description;
  }

  return "Badge lié à votre activité.";
}

function getAchievementUnlocked(achievement) {
  if (achievement.unlocked === true) {
    return true;
  }

  if (achievement.isUnlocked === true) {
    return true;
  }

  if (achievement.unlockedAt) {
    return true;
  }

  if (achievement.unlocked_at) {
    return true;
  }

  return false;
}

function getAchievementUnlockedAt(achievement) {
  if (achievement.unlockedAt) {
    return achievement.unlockedAt;
  }

  if (achievement.unlocked_at) {
    return achievement.unlocked_at;
  }

  return "";
}

function getAchievementIconKey(achievement) {
  if (achievement.icon) {
    return achievement.icon;
  }

  const slug = getAchievementSlug(achievement);

  if (slug === "first-application") {
    return "briefcase";
  }

  if (slug === "first-follow-up") {
    return "bell";
  }

  if (slug === "first-tag") {
    return "tag";
  }

  if (slug === "first-contact") {
    return "user";
  }

  if (slug === "first-document") {
    return "file";
  }

  if (slug === "first-interview") {
    return "calendar-check";
  }

  if (slug === "first-daily-goal") {
    return "goal";
  }

  if (slug === "first-monthly-goal") {
    return "calendar";
  }

  if (slug === "ten-applications") {
    return "target";
  }

  if (slug === "fifty-applications") {
    return "trophy";
  }

  return "award";
}

function getAchievementIcon(icon) {
  if (icon === "briefcase") {
    return Briefcase;
  }

  if (icon === "bell") {
    return Bell;
  }

  if (icon === "tag") {
    return Tag;
  }

  if (icon === "user") {
    return User;
  }

  if (icon === "file") {
    return FileText;
  }

  if (icon === "link") {
    return LinkIcon;
  }

  if (icon === "calendar-check") {
    return CalendarCheck;
  }

  if (icon === "goal") {
    return Goal;
  }

  if (icon === "calendar") {
    return CalendarDays;
  }

  if (icon === "target") {
    return Target;
  }

  if (icon === "trophy") {
    return Trophy;
  }

  return Award;
}

function getAchievementStatusIconClassName(
  achievement
) {
  if (achievement.unlocked) {
    return "w-9 h-9 shrink-0 flex justify-center items-center rounded-full bg-success/10 text-success";
  }

  return "w-9 h-9 shrink-0 flex justify-center items-center rounded-full bg-warning/10 text-warning";
}

function getAchievementStatusTitle(
  achievement
) {
  if (achievement.unlocked) {
    return "Objectif débloqué";
  }

  return "Objectif à débloquer";
}

function AchievementStatusIcon({
  achievement,
}) {
  let StatusIcon = LockKeyhole;

  if (achievement.unlocked) {
    StatusIcon = Award;
  }

  return (
    <span
      className={getAchievementStatusIconClassName(
        achievement
      )}
      title={getAchievementStatusTitle(
        achievement
      )}
      aria-label={getAchievementStatusTitle(
        achievement
      )}
    >
      <StatusIcon
        className="w-5 h-5"
        strokeWidth={2}
      />
    </span>
  );
}

function getAchievementDateLabel(achievement) {
  if (achievement.unlockedAt) {
    return "Débloqué le " + formatDate(achievement.unlockedAt);
  }

  return "Continuez votre suivi pour le débloquer.";
}

function getDisplayedAchievements(achievements) {
  if (!Array.isArray(achievements)) {
    return [];
  }

  return achievements.map(function (achievement) {
    const unlockedAt = getAchievementUnlockedAt(achievement);

    return {
      id: getAchievementId(achievement),
      slug: getAchievementSlug(achievement),
      name: getAchievementName(achievement),
      description: getAchievementDescription(achievement),
      icon: getAchievementIconKey(achievement),
      unlocked: getAchievementUnlocked(achievement),
      unlockedAt,
    };
  });
}

function DailyObjectiveContent({
  todayApplicationsCount,
  dailyGoal,
  todayProgress,
}) {
  return (
    <ItemCard>
      <div className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
        <div className="w-full min-w-0 flex flex-col md:flex-row justify-between items-stretch gap-6">
          <div className="min-w-0 pt-1 flex-1 self-stretch flex flex-row justify-start items-center">
            <div className="flex flex-row justify-start items-center gap-3">
              <IconBox
                icon={Goal}
                size={40}
                iconSize={18}
              />

              <p className="min-w-0 text-sm text-base-content/60">
                L’objectif quotidien se règle dans les{" "}
                <Link
                  className="link link-primary cursor-pointer"
                  to="/dashboard/settings?section=preferences&field=dailyGoal"
                >
                  paramètres
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="w-full md:w-96 shrink-0 self-stretch flex flex-col justify-center items-start md:items-end text-start md:text-right">
            <p className="text-5xl font-black text-primary">
              {todayProgress}%
            </p>

            <p className="mt-2 text-sm text-base-content/60 md:whitespace-nowrap">
              {getObjectiveProgressLabel(todayApplicationsCount, dailyGoal)}
            </p>
          </div>
        </div>

        <progress
          className="progress progress-primary w-full h-4"
          value={todayProgress}
          max="100"
        />
      </div>
    </ItemCard>
  );
}

function DailyObjectiveCard({
  todayApplicationsCount,
  dailyGoal,
  todayProgress,
}) {
  return (
    <SectionCard
      title="Objectif du jour"
      description={todayApplicationsCount + " candidature(s) créée(s) sur " + dailyGoal + " attendue(s)."}
    >
      <DailyObjectiveContent
        dailyGoal={dailyGoal}
        todayApplicationsCount={todayApplicationsCount}
        todayProgress={todayProgress}
      />
    </SectionCard>
  );
}

function ActivityCard({ activity }) {
  return (
    <SectionCard
      title="Activité des 30 derniers jours"
      description="Chaque barre représente les candidatures créées sur une journée."
    >
      <div className="w-full overflow-x-auto">
        <div className="w-max min-w-full md:w-full h-44 pb-2 grid grid-cols-[repeat(30,2rem)] md:grid-cols-[repeat(30,minmax(0,1fr))] gap-2">
          {activity.map(function (day) {
            return (
              <div
                className="h-full min-w-0 flex flex-col justify-end items-center gap-2"
                key={day.date}
                title={formatDate(day.date) + " - " + day.count + " candidature(s)"}
              >
                <div className="w-full h-full flex flex-row justify-center items-end rounded-t-lg bg-base-200">
                  <div
                    className={getActivityBarClassName(day)}
                    style={{ height: getActivityBarHeight(day) }}
                  />
                </div>

                <span className="text-xs text-base-content/50 whitespace-nowrap">
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

function getAchievementCardClassName(
  achievement
) {
  if (achievement.unlocked) {
    return "border-t-4 border-success";
  }

  return "border-t-4 border-warning";
}

function AchievementCard({ achievement }) {
  return (
    <ItemCard
      className={getAchievementCardClassName(
        achievement
      )}
    >
      <div className="w-full min-w-0 flex flex-row justify-between items-start gap-4">
        <div className="min-w-0 flex-1 flex flex-row justify-start items-start gap-4">
          <IconBox
            icon={getAchievementIcon(achievement.icon)}
            size={40}
            iconSize={18}
          />

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base-content">
              {achievement.name}
            </h3>

            <p className="mt-1 text-sm text-base-content/60">
              {achievement.description}
            </p>

            <p className="mt-4 text-xs text-base-content/50">
              {getAchievementDateLabel(achievement)}
            </p>
          </div>
        </div>

        <AchievementStatusIcon
          achievement={achievement}
        />
      </div>
    </ItemCard>
  );
}

function AchievementsCard({ achievements }) {
  return (
    <SectionCard
      title="Badges de progression"
      description="Les badges indiquent les étapes importantes atteintes dans votre suivi de candidatures."
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
        {achievements.map(function (achievement) {
          return (
            <AchievementCard achievement={achievement} key={achievement.id} />
          );
        })}
      </div>
    </SectionCard>
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
    return getDisplayedAchievements(achievements);
  }, [achievements]);

  if (loading) {
    return (
      <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
        <PageHeader
          title="Objectifs"
          description="Suivez votre rythme de candidature et vos badges de progression."
        />

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
        <MetricCard
          label="Objectif atteint"
          value={reachedDaysCount}
          helper="Jour(s) réussis sur les 30 derniers jours."
        />

        <MetricCard
          label="Candidatures sur 30 jours"
          value={monthlyApplicationsCount}
          helper="Total des créations récentes."
        />

        <MetricCard
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
