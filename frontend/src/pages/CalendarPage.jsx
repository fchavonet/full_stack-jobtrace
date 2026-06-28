import { Bell, CalendarDays, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { listApplications } from "../api/applications.api";
import { useToast } from "../hooks/useToast";
import {
  addMonths,
  buildCalendarDays,
  buildCalendarEvents,
  CALENDAR_WEEK_DAYS,
  formatCalendarMonth,
  getCalendarEventClassName,
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

function CalendarEventIcon({ type }) {
  if (type === "sent") {
    return <Mail className="h-3.5 w-3.5 shrink-0" />;
  }

  if (type === "follow_up") {
    return <Bell className="h-3.5 w-3.5 shrink-0" />;
  }

  return <CalendarDays className="h-3.5 w-3.5 shrink-0" />;
}

function getCalendarDayClassName(isCurrentMonth) {
  let className = "min-h-32 border-r border-b border-base-300 bg-base-100 p-2";

  if (!isCurrentMonth) {
    className = className + " bg-base-200/60 text-base-content/40";
  }

  return className;
}

function getDayNumberClassName(isToday) {
  if (isToday) {
    return "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content";
  }

  return "text-sm font-semibold";
}

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return year + "-" + month;
}

function formatAgendaDate(dateValue) {
  const date = new Date(dateValue + "T00:00:00");
  const label = AGENDA_DATE_FORMATTER.format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
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

        return getCalendarEventSortValue(firstEvent.type) - getCalendarEventSortValue(secondEvent.type);
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
    <section>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Calendrier
          </h1>

          <p className="text-base-content/70">
            Visualisez les dates d’envoi, de relance et d’entretien de vos candidatures.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 xl:justify-end">
          <button
            className="btn btn-outline btn-sm w-12 sm:w-auto"
            type="button"
            aria-label="Mois précédent"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Mois précédent
            </span>
          </button>

          <button
            className="btn btn-primary btn-sm text-white"
            type="button"
            onClick={goToCurrentMonth}
          >
            Aujourd’hui
          </button>

          <button
            className="btn btn-outline btn-sm w-12 sm:w-auto"
            type="button"
            aria-label="Mois suivant"
            onClick={goToNextMonth}
          >
            <span className="hidden sm:inline">
              Mois suivant
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-info">
            <span className="h-3 w-3 rounded-full bg-info" />
            Candidature envoyée
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-warning">
            <span className="h-3 w-3 rounded-full bg-warning" />
            Relance prévue
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="h-3 w-3 rounded-full bg-primary" />
            Entretien prévu
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-4">
          <h2 className="text-2xl font-bold">
            {formatCalendarMonth(currentMonth)}
          </h2>

          {loading && (
            <span className="loading loading-spinner loading-sm" />
          )}
        </div>

        <div className="md:hidden">
          {currentMonthEvents.length === 0 && !loading && (
            <div className="p-6 text-center">
              <h3 className="font-semibold">
                Aucun événement ce mois-ci
              </h3>

              <p className="mt-1 text-sm text-base-content/60">
                Les dates d’envoi, de relance et d’entretien apparaîtront ici.
              </p>
            </div>
          )}

          {currentMonthEvents.length > 0 && (
            <div className="divide-y divide-base-300">
              {currentMonthEvents.map(function (event) {
                return (
                  <button
                    className="flex w-full items-start gap-3 p-4 text-left hover:bg-base-200"
                    key={event.id}
                    type="button"
                    onClick={function () { openApplication(event.applicationId); }}
                  >
                    <div className={"mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full " + getCalendarEventClassName(event.type)}>
                      <CalendarEventIcon type={event.type} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-base-content/70">
                        {formatAgendaDate(event.date)}
                      </p>

                      <p className="mt-1 font-bold">
                        {getCalendarEventLabel(event.type)}
                      </p>

                      <p className="truncate text-sm">
                        {event.label}
                      </p>

                      <p className="truncate text-xs text-base-content/60">
                        {event.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-7 border-b border-base-300 bg-base-200 text-xs font-bold uppercase text-base-content/70">
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
                  <div className="mb-2 flex justify-center">
                    <span className={getDayNumberClassName(isToday)}>
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {dayEvents.map(function (event) {
                      return (
                        <button
                          className={"flex w-full items-center gap-1 truncate rounded-md px-2 py-1 text-left text-xs font-medium " + getCalendarEventClassName(event.type)}
                          key={event.id}
                          type="button"
                          title={getCalendarEventLabel(event.type) + " - " + event.label + " - " + event.subtitle}
                          onClick={function () { openApplication(event.applicationId); }}
                        >
                          <CalendarEventIcon type={event.type} />

                          <span className="shrink-0">
                            {getCalendarEventLabel(event.type)}
                          </span>

                          <span className="truncate opacity-90">
                            {event.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="alert mt-6 border border-base-300 bg-base-100">
        <CalendarDays className="h-5 w-5" />
        <span>
          Un clic sur un événement ouvre la table des candidatures avec uniquement la candidature concernée.
        </span>
      </div>
    </section>
  );
}

export default CalendarPage;
