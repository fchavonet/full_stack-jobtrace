import {
  Award,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Flag,
  Layers3,
  MapPinned,
  PieChart,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { listApplications } from "../api/applications.api";
import { useToast } from "../hooks/useToast";
import { getListFromResponse } from "../utils/common/apiResponse.utils";
import {
  getBarHeight,
  getContractTypeRows,
  getFunnelRows,
  getMaxCount,
  getMonthRows,
  getPercentLabel,
  getProgressWidth,
  getStatisticsSummary,
  getTrackingQualityRows,
} from "../utils/statistics/statistics.utils";

import ApplicationsLocationMap from "../components/statistics/ApplicationsLocationMap";

function StatCard({ icon, label, value, helper }) {
  return (
    <div className="h-full min-w-0 rounded-2xl bg-base-100 p-5 shadow-sm">
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

function EmptyStatisticsState() {
  return (
    <div className="mt-6 rounded-2xl bg-base-100 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <BarChart3 className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-xl font-bold">
        Aucune statistique disponible
      </h2>

      <p className="mt-2 text-sm text-base-content/60">
        Les statistiques apparaîtront dès que vous aurez créé vos premières candidatures.
      </p>
    </div>
  );
}

function getDonutStrokeClassName(index) {
  const classes = [
    "stroke-primary",
    "stroke-secondary",
    "stroke-accent",
    "stroke-info",
    "stroke-warning",
    "stroke-success",
    "stroke-error",
  ];

  if (classes[index]) {
    return classes[index];
  }

  return "stroke-base-content";
}

function getDonutDotClassName(index) {
  const classes = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-info",
    "bg-warning",
    "bg-success",
    "bg-error",
  ];

  if (classes[index]) {
    return classes[index];
  }

  return "bg-base-content";
}

function getDonutSegments(rows, total) {
  let previousPercent = 0;

  return rows.map(function (row, index) {
    let percentForChart = 0;

    if (total > 0) {
      percentForChart = (row.count / total) * 100;
    }

    const segment = {
      ...row,
      index,
      percentForChart,
      offset: previousPercent,
    };

    previousPercent += percentForChart;

    return segment;
  });
}

function getDonutDashArray(segment) {
  const remaining = 100 - segment.percentForChart;

  return segment.percentForChart + " " + remaining;
}

function ContractTypeDonutCard({ rows, total }) {
  const segments = getDonutSegments(rows, total);

  return (
    <div className="h-full min-w-0 rounded-2xl bg-base-100 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <PieChart className="h-6 w-6 text-primary" />

        <h2 className="text-xl font-bold">
          Types de contrat
        </h2>
      </div>

      <p className="mt-2 text-sm text-base-content/60">
        Répartition des candidatures selon le type de contrat ciblé.
      </p>

      {rows.length === 0 && (
        <p className="mt-6 text-sm text-base-content/60">
          Aucun type de contrat renseigné.
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="relative mx-auto h-56 w-56">
            <svg className="h-full w-full" viewBox="0 0 40 40">
              <circle
                className="stroke-base-200"
                cx="20"
                cy="20"
                r="16"
                fill="none"
                strokeWidth="8"
              />

              {segments.map(function (segment) {
                return (
                  <circle
                    className={getDonutStrokeClassName(segment.index)}
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    pathLength="100"
                    strokeWidth="8"
                    strokeDasharray={getDonutDashArray(segment)}
                    strokeDashoffset={-segment.offset}
                    strokeLinecap="butt"
                    transform="rotate(-90 20 20)"
                    key={segment.key}
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-4xl font-black">
                {total}
              </p>

              <p className="text-xs text-base-content/60">
                candidatures
              </p>
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            {segments.map(function (segment) {
              return (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-base-200 p-3" key={segment.key}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={"h-3 w-3 shrink-0 rounded-full " + getDonutDotClassName(segment.index)} />

                    <span className="truncate font-medium">
                      {segment.label}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold">
                      {segment.count}
                    </p>

                    <p className="text-xs text-base-content/50">
                      {getPercentLabel(segment.count, total)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TrackingQualityCard({ rows }) {
  return (
    <div className="h-full min-w-0 rounded-2xl bg-base-100 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-6 w-6 text-primary" />

        <h2 className="text-xl font-bold">
          Qualité du suivi
        </h2>
      </div>

      <p className="mt-2 text-sm text-base-content/60">
        Ces indicateurs montrent si les candidatures sont suffisamment documentées.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map(function (row) {
          return (
            <div className="min-w-0 rounded-2xl border border-base-300 p-4" key={row.key}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-base-content/60">
                    {row.label}
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {row.percent} %
                  </p>
                </div>

                <span className="badge badge-primary text-white">
                  {row.count}
                </span>
              </div>

              <progress
                className="progress progress-secondary mt-4 h-2 w-full"
                value={row.percent}
                max="100"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FunnelCard({ rows, total }) {
  return (
    <div className="h-full min-w-0 rounded-2xl bg-base-100 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Target className="h-6 w-6 text-primary" />

        <h2 className="text-xl font-bold">
          Tunnel de suivi
        </h2>
      </div>

      <p className="mt-2 text-sm text-base-content/60">
        Une lecture simple du passage entre candidature, relance, entretien et réussite.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map(function (row) {
          return (
            <div className="min-w-0 rounded-2xl border border-base-300 bg-base-100 p-4" key={row.key}>
              <p className="text-sm text-base-content/60">
                {row.label}
              </p>

              <p className="mt-2 text-3xl font-black">
                {row.count}
              </p>

              <p className="mt-1 text-xs text-base-content/50">
                {getPercentLabel(row.count, total)}
              </p>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-base-200">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: getProgressWidth(row.count, total) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyActivityCard({ rows }) {
  const maxCount = getMaxCount(rows);

  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl bg-base-100 p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />

            <h2 className="text-xl font-bold">
              Suivi sur 6 mois
            </h2>
          </div>

          <p className="mt-2 text-sm text-base-content/60">
            Volume mensuel basé sur la date d’envoi des candidatures.
          </p>
        </div>

        <span className="badge badge-primary shrink-0 text-white">
          6 derniers mois
        </span>
      </div>

      <div className="mt-8 flex min-h-72 flex-1 items-stretch gap-4 overflow-x-auto pb-2">
        {rows.map(function (row) {
          return (
            <div className="flex min-w-24 flex-1 flex-col justify-end gap-3" key={row.key}>
              <div className="flex flex-1 items-end rounded-2xl bg-base-200 p-1">
                <div
                  className="w-full rounded-xl bg-primary"
                  style={{ height: getBarHeight(row.count, maxCount) }}
                />
              </div>

              <div className="text-center">
                <p className="text-lg font-black">
                  {row.count}
                </p>

                <p className="text-xs text-base-content/50">
                  {row.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MapFutureCard() {
  return (
    <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <MapPinned className="h-6 w-6 text-primary" />

        <h2 className="text-xl font-bold">
          Carte des candidatures
        </h2>
      </div>

      <p className="mt-2 text-sm text-base-content/60">
        À faire dans un commit séparé : afficher les villes où vous avez postulé.
      </p>
    </div>
  );
}

function StatisticsPage() {
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadStatisticsData() {
      try {
        const applicationsResponse = await listApplications();

        setApplications(getListFromResponse(applicationsResponse, "applications"));
      } catch {
        showToast("Impossible de charger les statistiques.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadStatisticsData();
  }, [showToast]);

  const summary = useMemo(function () {
    return getStatisticsSummary(applications);
  }, [applications]);

  const contractTypeRows = useMemo(function () {
    return getContractTypeRows(applications);
  }, [applications]);

  const monthRows = useMemo(function () {
    return getMonthRows(applications, 6);
  }, [applications]);

  const qualityRows = useMemo(function () {
    return getTrackingQualityRows(summary);
  }, [summary]);

  const funnelRows = useMemo(function () {
    return getFunnelRows(summary);
  }, [summary]);

  if (loading) {
    return (
      <section>
        <h1 className="text-4xl font-bold">
          Statistiques
        </h1>

        <div className="mt-6 rounded-2xl bg-base-100 p-6 shadow-sm">
          <span className="loading loading-spinner loading-md" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <div>
        <h1 className="text-4xl font-bold">
          Statistiques
        </h1>

        <p className="text-base-content/70">
          Analysez le volume, la progression et la qualité de suivi de vos candidatures.
        </p>
      </div>

      {applications.length === 0 && (
        <EmptyStatisticsState />
      )}

      {applications.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Layers3 className="h-6 w-6" />}
              label="Total candidatures"
              value={summary.total}
              helper={summary.active + " candidature(s) active(s)"}
            />

            <StatCard
              icon={<Award className="h-6 w-6" />}
              label="Total entretiens"
              value={summary.interviews}
              helper={summary.interviewRate + " % du total"}
            />

            <StatCard
              icon={<Flag className="h-6 w-6" />}
              label="Total refusées"
              value={summary.rejected}
              helper={getPercentLabel(summary.rejected, summary.total) + " du total"}
            />

            <StatCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              label="Total acceptées"
              value={summary.accepted}
              helper={summary.successRate + " % de réussite"}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <ContractTypeDonutCard rows={contractTypeRows} total={summary.total} />

            <TrackingQualityCard rows={qualityRows} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <FunnelCard rows={funnelRows} total={summary.total} />

            <MonthlyActivityCard rows={monthRows} />
          </div>

          <div className="mt-6">
            <ApplicationsLocationMap applications={applications} />
          </div>
        </>
      )}
    </section>
  );
}

export default StatisticsPage;
