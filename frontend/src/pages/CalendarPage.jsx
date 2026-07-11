import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellRing,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
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

function CalendarLegendItem({ label, type }) {
  return (
    <div className="flex flex-row justify-start items-center gap-2">
      <span className={getEventDotClassName(type)} />

      <span className="text-xs font-medium text-base-content/60 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function CalendarHeaderRightElement({ loading }) {
  return (
    <div className="hidden sm:flex flex-col sm:flex-row flex-wrap justify-center items-end sm:items-center gap-x-4 gap-y-2">
      {loading && (
        <span className="loading loading-spinner loading-sm shrink-0" />
      )}

      <CalendarLegendItem
        label="Envoi"
        type="sent"
      />

      <CalendarLegendItem
        label="Relance"
        type="follow_up"
      />

      <CalendarLegendItem
        label="Entretien"
        type="interview"
      />
    </div>
  );
}

function CalendarEmptyAgenda() {
  return (
    <ItemCard className="text-center">
      <h3 className="font-semibold text-base-content">
        Aucun événement ce mois-ci
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

function CalendarInfoCard() {
  return (
    <SectionCard>
      <p className="text-sm text-base-content/60">
        Un clic sur un événement ouvre la table des candidatures avec uniquement la candidature concernée.
      </p>
    </SectionCard>
  );
}

function CalendarPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(getStartOfMonth(new Date()));
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const eventsByDate = useMemo(function () {
    return groupCalendarEventsByDate(events);
  }, [events]);

  const currentMonthEvents = useMemo(function () {
    const monthKey = getMonthKey(currentMonth);

    return events
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
  }, [events, currentMonth]);

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
        rightElementClassName="self-center"
        rightElement={
          <CalendarHeaderRightElement loading={loading} />
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

      <CalendarInfoCard />
    </section>
  );
}

export default CalendarPage;
