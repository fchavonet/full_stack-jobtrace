import { useEffect, useMemo, useState } from "react";

import { listApplications } from "../api/applications.api";
import ApplicationsLocationMap from "../components/statistics/ApplicationsLocationMap";
import {
  ItemCard,
  MetricCard,
  ProgressItemCard,
  SectionCard,
} from "../components/ui/Cards";
import LoadingCard from "../components/ui/LoadingCard";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../hooks/useToast";
import { getListFromResponse } from "../utils/common/apiResponse.utils";
import {
  getBarHeight,
  getContractTypeRows,
  getMaxCount,
  getMonthRows,
  getPercentLabel,
  getProgressWidth,
  getStatisticsSummary,
  getTrackingQualityRows,
} from "../utils/statistics/statistics.utils";

function EmptyStatisticsState() {
  return (
    <SectionCard
      title="Aucune statistique disponible"
      description="Les statistiques apparaîtront dès que vous aurez créé vos premières candidatures."
      centered
    />
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

function getInterviewDonutStrokeClassName(index) {
  if (index === 0) {
    return "stroke-primary";
  }

  return "stroke-base-300";
}

function getInterviewDonutDotClassName(index) {
  if (index === 0) {
    return "bg-primary";
  }

  return "bg-base-300";
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

function getOtherApplicationsCount(summary) {
  const otherCount = summary.total - summary.interviews;

  if (otherCount < 0) {
    return 0;
  }

  return otherCount;
}

function getInterviewRateRows(summary) {
  return [
    {
      key: "interviews",
      label: "Entretiens obtenus",
      count: summary.interviews,
    },
    {
      key: "others",
      label: "Autres statuts",
      count: getOtherApplicationsCount(summary),
    },
  ];
}

function getDetailedFunnelRows(summary) {
  return [
    {
      key: "total",
      label: "Candidatures enregistrées",
      count: summary.total,
    },
    {
      key: "active",
      label: "Candidatures actives",
      count: summary.active,
    },
    {
      key: "followUps",
      label: "Relances planifiées",
      count: summary.followUps,
    },
    {
      key: "interviews",
      label: "Entretiens obtenus",
      count: summary.interviews,
    },
    {
      key: "accepted",
      label: "Candidatures acceptées",
      count: summary.accepted,
    },
    {
      key: "rejected",
      label: "Candidatures refusées",
      count: summary.rejected,
    },
  ];
}

function ContractTypeLegendItem({ segment, total }) {
  return (
    <ItemCard>
      <div className="w-full min-w-0 flex flex-row justify-between items-center gap-4">
        <div className="min-w-0 flex flex-row justify-start items-center gap-2">
          <span
            className={
              "w-4 h-4 shrink-0 rounded-full "
              + getDonutDotClassName(segment.index)
            }
          />

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
    </ItemCard>
  );
}

function ContractTypeDonut({ segments, total }) {
  return (
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
  );
}

function ContractTypeDonutCard({ rows, total }) {
  const segments = getDonutSegments(rows, total);

  return (
    <SectionCard
      title="Types de contrat"
      description="Répartition des candidatures selon le type de contrat ciblé."
    >
      <div className="w-full grid grid-cols-1 xl:grid-cols-[16rem_1fr] justify-center items-center gap-6">
        <ContractTypeDonut segments={segments} total={total} />

        <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2">
          {segments.map(function (segment) {
            return (
              <ContractTypeLegendItem
                segment={segment}
                total={total}
                key={segment.key}
              />
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

function TrackingQualityItem({ row }) {
  return (
    <ProgressItemCard
      title={row.label}
      subtitle={row.percent + " % des candidatures"}
      value={row.count}
      progressWidth={row.percent + "%"}
    />
  );
}

function TrackingQualityCard({ rows }) {
  return (
    <SectionCard
      title="Qualité du suivi"
      description="Ces indicateurs montrent si les candidatures sont suffisamment documentées."
      className="h-full"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map(function (row) {
          return (
            <TrackingQualityItem row={row} key={row.key} />
          );
        })}
      </div>
    </SectionCard>
  );
}

function InterviewRateLegendItem({ segment, total }) {
  return (
    <ItemCard>
      <div className="w-full min-w-0 flex flex-row justify-between items-center gap-4">
        <div className="min-w-0 flex flex-row justify-start items-center gap-2">
          <span
            className={
              "w-4 h-4 shrink-0 rounded-full "
              + getInterviewDonutDotClassName(segment.index)
            }
          />

          <h3 className="text-sm font-semibold text-base-content truncate">
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
    </ItemCard>
  );
}

function InterviewRateDonut({ segments, rate }) {
  return (
    <div className="relative w-48 h-48 mx-auto">
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
              className={getInterviewDonutStrokeClassName(segment.index)}
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
          {rate} %
        </p>

        <p className="text-xs text-base-content/60">
          entretien
        </p>
      </div>
    </div>
  );
}

function InterviewRateDonutCard({ summary }) {
  const rows = getInterviewRateRows(summary);
  const segments = getDonutSegments(rows, summary.total);

  return (
    <SectionCard
      title="Taux d’entretien"
      description="Part des candidatures ayant obtenu un entretien."
      className="h-full"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-[12rem_1fr] xl:grid-cols-1 2xl:grid-cols-[12rem_1fr] justify-center items-center gap-6">
        <InterviewRateDonut
          segments={segments}
          rate={summary.interviewRate}
        />

        <div className="w-full min-w-0 flex flex-col justify-start items-stretch gap-2">
          {segments.map(function (segment) {
            return (
              <InterviewRateLegendItem
                segment={segment}
                total={summary.total}
                key={segment.key}
              />
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

function FunnelItem({ row, total }) {
  return (
    <ProgressItemCard
      title={row.label}
      subtitle={getPercentLabel(row.count, total)}
      value={row.count}
      progressWidth={getProgressWidth(row.count, total)}
    />
  );
}

function FunnelCard({ rows, total }) {
  return (
    <SectionCard
      title="Tunnel de suivi"
      description="Une lecture simple du passage entre candidature, relance, entretien et réussite."
      className="h-full flex flex-col"
      contentClassName="flex-1 flex flex-col"
    >
      <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map(function (row) {
          return (
            <FunnelItem row={row} total={total} key={row.key} />
          );
        })}
      </div>
    </SectionCard>
  );
}

function MonthlyActivityBar({ row, maxCount }) {
  return (
    <div className="min-w-0 h-full flex flex-col justify-start items-stretch gap-2">
      <div className="w-full min-h-32 md:min-h-44 xl:min-h-0 flex-1 p-2 flex flex-row justify-center items-end rounded-xl bg-base-200 overflow-hidden">
        <div
          className="w-full rounded-lg bg-primary"
          style={{ height: getBarHeight(row.count, maxCount) }}
        />
      </div>

      <div className="shrink-0 text-center">
        <p className="text-base font-black text-base-content">
          {row.count}
        </p>

        <p className="text-xs text-base-content/60 truncate">
          {row.label}
        </p>
      </div>
    </div>
  );
}

function MonthlyActivityCard({ rows }) {
  const maxCount = getMaxCount(rows);

  return (
    <SectionCard
      title="Suivi sur 6 mois"
      description="Volume mensuel basé sur la date d’envoi des candidatures."
      className="h-full flex flex-col"
      contentClassName="flex-1 flex flex-col"
    >
      <div className="w-full min-h-0 flex-1 grid grid-cols-3 md:grid-cols-6 gap-4">
        {rows.map(function (row) {
          return (
            <MonthlyActivityBar
              row={row}
              maxCount={maxCount}
              key={row.key}
            />
          );
        })}
      </div>
    </SectionCard>
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

        setApplications(
          getListFromResponse(applicationsResponse, "applications")
        );
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
    return getDetailedFunnelRows(summary);
  }, [summary]);

  if (loading) {
    return (
      <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
        <PageHeader
          title="Statistiques"
          description="Analysez le volume, la progression et la qualité de suivi de vos candidatures."
        />

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
            <MetricCard
              label="Total candidatures"
              value={summary.total}
              helper={summary.active + " candidature(s) active(s)"}
            />

            <MetricCard
              label="Total entretiens"
              value={summary.interviews}
              helper={summary.interviewRate + " % du total"}
            />

            <MetricCard
              label="Total refusées"
              value={summary.rejected}
              helper={
                getPercentLabel(summary.rejected, summary.total) + " du total"
              }
            />

            <MetricCard
              label="Total acceptées"
              value={summary.accepted}
              helper={summary.successRate + " % de réussite"}
            />
          </div>

          <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FunnelCard rows={funnelRows} total={summary.total} />


            <InterviewRateDonutCard summary={summary} />
          </div>

          <ContractTypeDonutCard
            rows={contractTypeRows}
            total={summary.total}
          />

          <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TrackingQualityCard rows={qualityRows} />

            <MonthlyActivityCard rows={monthRows} />
          </div>

          <ApplicationsLocationMap applications={applications} />
        </>
      )}
    </section>
  );
}

export default StatisticsPage;
