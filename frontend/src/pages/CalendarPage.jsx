import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  BellRing,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Send,
} from "lucide-react";

import { listApplications } from "../api/applications.api";
import Badge from "../components/ui/Badge";
import { ItemCard, SectionCard } from "../components/ui/Cards";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../hooks/useToast";
import {
  addMonths,
  buildCalendarDays,
  buildCalendarEvents,
  CALENDAR_WEEK_DAYS,
  formatCalendarMonth,
  getCalendarEventLabel,
  getCalendarEventSortValue,
  getIsoDate,
  getStartOfMonth,
  groupCalendarEventsByDate,
} from "../utils/calendar/calendar.utils";
import { downloadCalendarEventsAsIcs } from "../utils/calendar/calendarExport.utils";
import { getListFromResponse } from "../utils/common/apiResponse.utils";

const AGENDA_DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function getCalendarDayClassName(isCurrentMonth) {
  let className = "min-h-32 p-2 border-r border-b border-base-300 bg-base-100";

  if (!isCurrentMonth) {
    className = className + " text-base-content/40 bg-base-200";
  }

  return className;
}

function getDayNumberClassName(isToday) {
  if (isToday) {
    return "w-8 h-8 flex flex-row justify-center items-center text-sm font-bold text-primary-content rounded-full bg-primary";
  }

  return "text-sm font-semibold text-base-content";
}

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return year + "-" + month;
}

function getEventDotClassName(type) {
  if (type === "sent") {
    return "w-3 h-3 shrink-0 rounded-full bg-primary";
  }

  if (type === "follow_up") {
    return "w-3 h-3 shrink-0 rounded-full bg-warning";
  }

  if (type === "interview") {
    return "w-3 h-3 shrink-0 rounded-full bg-success";
  }

  return "w-3 h-3 shrink-0 rounded-full bg-base-300";
}

function getLegendDotClassName(
  type,
  isVisible
) {
  if (!isVisible) {
    return "w-3 h-3 shrink-0 rounded-full bg-base-300";
  }

  return getEventDotClassName(type);
}

function getLegendButtonClassName(isVisible) {
  let className =
    "btn btn-ghost btn-xs h-auto min-h-0 px-2 py-1 flex flex-row justify-center items-center gap-2 cursor-pointer";

  if (!isVisible) {
    className =
      className
      + " text-base-content/40";
  }

  return className;
}

function getLegendAriaLabel(
  label,
  isVisible
) {
  if (isVisible) {
    return "Masquer les événements " + label;
  }

  return "Afficher les événements " + label;
}

function getCalendarEventBadgeColor(type) {
  if (type === "sent") {
    return "primary";
  }

  if (type === "follow_up") {
    return "warning";
  }

  if (type === "interview") {
    return "success";
  }

  return "base";
}

function getCalendarEventBadgeIcon(type) {
  if (type === "sent") {
    return Send;
  }

  if (type === "follow_up") {
    return BellRing;
  }

  if (type === "interview") {
    return CalendarCheck;
  }

  return null;
}

function formatAgendaDate(dateValue) {
  const date = new Date(dateValue + "T00:00:00");
  const label = AGENDA_DATE_FORMATTER.format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function CalendarLegendItem({
  label,
  type,
  isVisible,
  onToggle,
}) {
  return (
    <button
      className={getLegendButtonClassName(
        isVisible
      )}
      type="button"
      aria-label={getLegendAriaLabel(
        label,
        isVisible
      )}
      aria-pressed={isVisible}
      onClick={function () {
        onToggle(type);
      }}
    >
      <span
        className={getLegendDotClassName(
          type,
          isVisible
        )}
      />

      <span className="text-xs font-medium whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

function CalendarHeaderRightElement({
  loading,
  visibleEventTypes,
  onToggleEventType,
}) {
  return (
    <div className="flex flex-row flex-wrap justify-center sm:justify-end items-center gap-1">
      {loading && (
        <span className="loading loading-spinner loading-sm shrink-0" />
      )}

      <CalendarLegendItem
        label="Envoi"
        type="sent"
        isVisible={visibleEventTypes.sent}
        onToggle={onToggleEventType}
      />

      <CalendarLegendItem
        label="Relance"
        type="follow_up"
        isVisible={visibleEventTypes.follow_up}
        onToggle={onToggleEventType}
      />

      <CalendarLegendItem
        label="Entretien"
        type="interview"
        isVisible={visibleEventTypes.interview}
        onToggle={onToggleEventType}
      />
    </div>
  );
}

function CalendarEmptyAgenda() {
  return (
    <ItemCard className="text-center">
      <h3 className="font-semibold text-base-content">
        Aucun événement visible ce mois-ci
      </h3>

      <p className="mt-1 text-sm text-base-content/60">
        Les dates d’envoi, de relance et d’entretien apparaîtront ici.
      </p>
    </ItemCard>
  );
}

function CalendarMobileEventCard({ event, onOpenApplication }) {
  return (
    <ItemCard
      as="button"
      className="flex flex-row justify-between items-center gap-4 text-left"
      interactive={true}
      type="button"
      onClick={function () {
        onOpenApplication(event.applicationId);
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-base-content/60">
          {formatAgendaDate(event.date)}
        </p>

        <h3 className="mt-1 font-bold text-base-content truncate">
          {event.label}
        </h3>

        <p className="mt-1 text-sm text-base-content/60 truncate">
          {event.subtitle}
        </p>
      </div>

      <Badge
        color={getCalendarEventBadgeColor(event.type)}
        icon={getCalendarEventBadgeIcon(event.type)}
        label={getCalendarEventLabel(event.type)}
      />
    </ItemCard>
  );
}

function CalendarMobileAgenda({
  currentMonthEvents,
  loading,
  onOpenApplication,
}) {
  return (
    <div className="md:hidden">
      {currentMonthEvents.length === 0 && !loading && (
        <CalendarEmptyAgenda />
      )}

      {currentMonthEvents.length > 0 && (
        <div className="w-full flex flex-col justify-start items-stretch gap-2">
          {currentMonthEvents.map(function (event) {
            return (
              <CalendarMobileEventCard
                event={event}
                key={event.id}
                onOpenApplication={onOpenApplication}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarDesktopEventBadge({ event, onOpenApplication }) {
  return (
    <Badge
      className="w-full justify-start text-left"
      color={getCalendarEventBadgeColor(event.type)}
      icon={getCalendarEventBadgeIcon(event.type)}
      label={getCalendarEventLabel(event.type) + " " + event.label}
      title={getCalendarEventLabel(event.type) + " - " + event.label + " - " + event.subtitle}
      onClick={function () {
        onOpenApplication(event.applicationId);
      }}
    />
  );
}

function CalendarDesktopGrid({
  calendarDays,
  currentMonth,
  eventsByDate,
  todayIso,
  onOpenApplication,
}) {
  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-base-300">
      <div className="grid grid-cols-7 text-xs font-bold uppercase text-base-content/70 bg-base-200">
        {CALENDAR_WEEK_DAYS.map(function (day) {
          return (
            <div className="px-2 py-3 text-center" key={day}>
              {day}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map(function (day) {
          const dayIso = getIsoDate(day);
          const dayEvents = eventsByDate[dayIso] || [];
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = dayIso === todayIso;

          return (
            <div className={getCalendarDayClassName(isCurrentMonth)} key={dayIso}>
              <div className="mb-2 flex flex-row justify-center items-center">
                <span className={getDayNumberClassName(isToday)}>
                  {day.getDate()}
                </span>
              </div>

              <div className="w-full flex flex-col justify-start items-stretch gap-1">
                {dayEvents.map(function (event) {
                  return (
                    <CalendarDesktopEventBadge
                      event={event}
                      key={event.id}
                      onOpenApplication={onOpenApplication}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarInfoCard({
  eventCount,
  onExport,
}) {
  return (
    <SectionCard>
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="max-w-3xl text-sm text-base-content/60">
          Un clic sur un événement ouvre la candidature concernée.
          L’export reprend le mois affiché et les catégories visibles.
        </p>

        <button
          className="btn btn-ghost btn-sm self-end shrink-0 flex flex-row justify-center items-center gap-2 cursor-pointer"
          type="button"
          title="Télécharger un fichier calendrier au format .ics"
          onClick={onExport}
          disabled={eventCount === 0}
        >
          <Download className="w-4 h-4" />

          Exporter le mois
        </button>
      </div>
    </SectionCard>
  );
}

function CalendarPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(getStartOfMonth(new Date()));
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [
    visibleEventTypes,
    setVisibleEventTypes,
  ] = useState({
    sent: true,
    follow_up: true,
    interview: true,
  });

  useEffect(function () {
    async function loadApplications() {
      try {
        const response = await listApplications();
        setApplications(getListFromResponse(response, "applications"));
      } catch {
        showToast("Impossible de charger le calendrier.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [showToast]);

  const calendarDays = useMemo(function () {
    return buildCalendarDays(currentMonth);
  }, [currentMonth]);

  const events = useMemo(function () {
    return buildCalendarEvents(applications);
  }, [applications]);

  const visibleEvents = useMemo(function () {
    return events.filter(function (event) {
      return visibleEventTypes[event.type];
    });
  }, [
    events,
    visibleEventTypes,
  ]);

  const eventsByDate = useMemo(function () {
    return groupCalendarEventsByDate(
      visibleEvents
    );
  }, [visibleEvents]);

  const currentMonthEvents = useMemo(function () {
    const monthKey = getMonthKey(currentMonth);

    return visibleEvents
      .filter(function (event) {
        return event.date.startsWith(monthKey);
      })
      .sort(function (firstEvent, secondEvent) {
        if (firstEvent.date !== secondEvent.date) {
          return firstEvent.date.localeCompare(secondEvent.date);
        }

        return getCalendarEventSortValue(firstEvent.type)
          - getCalendarEventSortValue(secondEvent.type);
      });
  }, [visibleEvents, currentMonth]);

  const todayIso = getIsoDate(new Date());

  function goToPreviousMonth() {
    setCurrentMonth(addMonths(currentMonth, -1));
  }

  function goToCurrentMonth() {
    setCurrentMonth(getStartOfMonth(new Date()));
  }

  function goToNextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  function toggleEventType(eventType) {
    setVisibleEventTypes(
      function (currentVisibleEventTypes) {
        return {
          ...currentVisibleEventTypes,
          [eventType]:
            !currentVisibleEventTypes[
              eventType
            ],
        };
      }
    );
  }

  function exportCurrentMonthCalendar() {
    const exportStarted =
      downloadCalendarEventsAsIcs(
        currentMonthEvents,
        currentMonth
      );

    if (!exportStarted) {
      showToast(
        "Aucun événement visible à exporter.",
        "info"
      );

      return;
    }

    showToast(
      "Calendrier exporté au format .ics.",
      "success"
    );
  }

  function openApplication(applicationId) {
    navigate("/dashboard/applications?application=" + applicationId);
  }

  return (
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <PageHeader
        title="Calendrier"
        description="Visualisez les dates d’envoi, de relance et d’entretien de vos candidatures."
        actionsClassName="w-full md:w-auto grid grid-cols-[auto_minmax(0,1fr)_auto] md:flex md:flex-row justify-center md:justify-end items-center gap-2"
        actions={
          <>
            <button
              className="btn btn-square btn-outline shrink-0 flex flex-row justify-center items-center cursor-pointer"
              type="button"
              aria-label="Mois précédent"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              className="btn btn-primary w-full md:w-auto min-w-0 flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer"
              type="button"
              onClick={goToCurrentMonth}
            >
              Aujourd’hui
            </button>

            <button
              className="btn btn-square btn-outline shrink-0 flex flex-row justify-center items-center cursor-pointer"
              type="button"
              aria-label="Mois suivant"
              onClick={goToNextMonth}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        }
      />

      <SectionCard
        title={formatCalendarMonth(currentMonth)}
        description={currentMonthEvents.length + " événement(s) ce mois-ci."}
        headerClassName="w-full flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 text-center sm:text-left"
        rightElementClassName="w-full sm:w-auto self-center sm:self-start"
        rightElement={
          <CalendarHeaderRightElement
            loading={loading}
            visibleEventTypes={visibleEventTypes}
            onToggleEventType={toggleEventType}
          />
        }
      >
        <CalendarMobileAgenda
          currentMonthEvents={currentMonthEvents}
          loading={loading}
          onOpenApplication={openApplication}
        />

        <CalendarDesktopGrid
          calendarDays={calendarDays}
          currentMonth={currentMonth}
          eventsByDate={eventsByDate}
          todayIso={todayIso}
          onOpenApplication={openApplication}
        />
      </SectionCard>

      <CalendarInfoCard
        eventCount={currentMonthEvents.length}
        onExport={exportCurrentMonthCalendar}
      />
    </section>
  );
}

export default CalendarPage;
