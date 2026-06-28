import { useEffect, useMemo, useState } from "react";

import { listApplications } from "../api/applications.api";
import ApplicationsLocationMap from "../components/statistics/ApplicationsLocationMap";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";
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

function StatCard({ label, value, helper }) {
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

function EmptyStatisticsState() {
  return (
    <div className="w-full min-w-0 p-4 md:p-6 text-center rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        Aucune statistique disponible
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
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
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-base-content">
            Types de contrat
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Répartition des candidatures selon le type de contrat ciblé.
          </p>
        </div>

        <span className="badge badge-primary shrink-0 text-primary-content">
          {total}
        </span>
      </div>

      {rows.length === 0 && (
        <div className="w-full mt-6 p-4 text-center rounded-xl bg-base-200">
          <p className="text-sm text-base-content/60">
            Aucun type de contrat renseigné.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="w-full mt-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] justify-center items-center gap-6">
          <div className="relative w-56 h-56 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 40 40">
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

            <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col justify-center items-center text-center">
              <p className="text-4xl font-black text-base-content">
                {total}
              </p>

              <p className="text-xs text-base-content/60">
                candidatures
              </p>
            </div>
          </div>

          <div className="w-full min-w-0 flex flex-col justify-start items-stretch gap-2">
            {segments.map(function (segment) {
              return (
                <div className="w-full min-w-0 p-4 flex flex-row justify-between items-center gap-4 rounded-xl bg-base-200" key={segment.key}>
                  <div className="min-w-0 flex flex-row justify-start items-center gap-2">
                    <span className={"w-3 h-3 shrink-0 rounded-full " + getDonutDotClassName(segment.index)} />

                    <h3 className="font-semibold text-base-content truncate">
                      {segment.label}
                    </h3>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-base-content">
                      {segment.count}
                    </p>

                    <p className="text-xs text-base-content/60">
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
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        Qualité du suivi
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
        Ces indicateurs montrent si les candidatures sont suffisamment documentées.
      </p>

      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map(function (row) {
          return (
            <div className="w-full min-w-0 p-4 rounded-xl bg-base-200" key={row.key}>
              <div className="w-full flex flex-row justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-base-content">
                    {row.label}
                  </h3>

                  <p className="mt-1 text-xs text-base-content/60">
                    {row.percent} % des candidatures
                  </p>
                </div>

                <span className="badge badge-primary shrink-0 text-primary-content">
                  {row.count}
                </span>
              </div>

              <progress
                className="progress progress-primary w-full h-2 mt-4"
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
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">
        Tunnel de suivi
      </h2>

      <p className="mt-1 text-sm text-base-content/60">
        Une lecture simple du passage entre candidature, relance, entretien et réussite.
      </p>

      <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map(function (row) {
          return (
            <div className="w-full min-w-0 p-4 rounded-xl bg-base-200" key={row.key}>
              <div className="w-full flex flex-row justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-base-content">
                    {row.label}
                  </h3>

                  <p className="mt-1 text-xs text-base-content/60">
                    {getPercentLabel(row.count, total)}
                  </p>
                </div>

                <p className="shrink-0 text-2xl font-black text-base-content">
                  {row.count}
                </p>
              </div>

              <div className="w-full h-4 mt-4 rounded-full bg-base-100 overflow-hidden">
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
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-base-content">
            Suivi sur 6 mois
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Volume mensuel basé sur la date d’envoi des candidatures.
          </p>
        </div>

        <span className="badge badge-primary shrink-0 text-primary-content">
          6 mois
        </span>
      </div>

      <div className="w-full mt-6 grid grid-cols-3 md:grid-cols-6 gap-4">
        {rows.map(function (row) {
          return (
            <div className="min-w-0 flex flex-col justify-start items-stretch gap-2" key={row.key}>
              <div className="w-full h-40 md:h-52 p-1 flex flex-row justify-center items-end rounded-xl bg-base-200 overflow-hidden">
                <div
                  className="w-full rounded-lg bg-primary"
                  style={{ height: getBarHeight(row.count, maxCount) }}
                />
              </div>

              <div className="text-center">
                <p className="text-base font-black text-base-content">
                  {row.count}
                </p>

                <p className="text-xs text-base-content/60 truncate">
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
        <PageHeader title="Statistiques" />

        <LoadingCard />
      </section>
    );
  }

  return (
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <PageHeader
        title="Statistiques"
        description="Analysez le volume, la progression et la qualité de suivi de vos candidatures."
      />

      {applications.length === 0 && (
        <EmptyStatisticsState />
      )}

      {applications.length > 0 && (
        <>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total candidatures"
              value={summary.total}
              helper={summary.active + " candidature(s) active(s)"}
            />

            <StatCard
              label="Total entretiens"
              value={summary.interviews}
              helper={summary.interviewRate + " % du total"}
            />

            <StatCard
              label="Total refusées"
              value={summary.rejected}
              helper={getPercentLabel(summary.rejected, summary.total) + " du total"}
            />

            <StatCard
              label="Total acceptées"
              value={summary.accepted}
              helper={summary.successRate + " % de réussite"}
            />
          </div>

          <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ContractTypeDonutCard rows={contractTypeRows} total={summary.total} />

            <TrackingQualityCard rows={qualityRows} />
          </div>

          <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FunnelCard rows={funnelRows} total={summary.total} />

            <MonthlyActivityCard rows={monthRows} />
          </div>

          <ApplicationsLocationMap applications={applications} />
        </>
      )}
    </section>
  );
}

export default StatisticsPage;
