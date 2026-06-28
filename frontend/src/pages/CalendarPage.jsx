import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { listApplications } from "../api/applications.api";
import PageHeader from "../components/ui/PageHeader";
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
    return "w-3 h-3 shrink-0 rounded-full bg-info";
  }

  if (type === "follow_up") {
    return "w-3 h-3 shrink-0 rounded-full bg-warning";
  }

  if (type === "interview") {
    return "w-3 h-3 shrink-0 rounded-full bg-primary";
  }

  return "w-3 h-3 shrink-0 rounded-full bg-base-300";
}

function formatAgendaDate(dateValue) {
  const date = new Date(dateValue + "T00:00:00");
  const label = AGENDA_DATE_FORMATTER.format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function CalendarLegendCard({ label, helper, type }) {
  return (
    <div className="w-full min-w-0 p-4 flex flex-row justify-between items-start gap-4 rounded-2xl bg-base-100 shadow-sm">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-base-content">
          {label}
        </h2>

        <p className="mt-1 text-xs text-base-content/60">
          {helper}
        </p>
      </div>

      <span className={getEventDotClassName(type)} />
    </div>
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
    <section className="w-full min-w-0 flex flex-col justify-start items-stretch gap-6">
      <PageHeader
        title="Calendrier"
        description="Visualisez les dates d’envoi, de relance et d’entretien de vos candidatures."
        actionsClassName="w-full md:w-auto flex flex-row justify-center md:justify-end items-center gap-2"
        actions={
          <>
            <button className="btn btn-square btn-outline flex flex-row justify-center items-center cursor-pointer" type="button" aria-label="Mois précédent" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button className="btn btn-primary w-full md:w-auto flex flex-row justify-center items-center gap-2 text-primary-content cursor-pointer" type="button" onClick={goToCurrentMonth}>
              Aujourd’hui
            </button>

            <button className="btn btn-square btn-outline flex flex-row justify-center items-center cursor-pointer" type="button" aria-label="Mois suivant" onClick={goToNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        }
      />

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <CalendarLegendCard
          helper="Date d’envoi enregistrée."
          label="Candidature envoyée"
          type="sent"
        />

        <CalendarLegendCard
          helper="Date de relance prévue."
          label="Relance prévue"
          type="follow_up"
        />

        <CalendarLegendCard
          helper="Date d’entretien prévue."
          label="Entretien prévu"
          type="interview"
        />
      </div>

      <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
        <div className="w-full flex flex-row justify-between items-start gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-base-content">
              {formatCalendarMonth(currentMonth)}
            </h2>

            <p className="mt-1 text-sm text-base-content/60">
              {currentMonthEvents.length} événement(s) ce mois-ci.
            </p>
          </div>

          {loading && (
            <span className="loading loading-spinner loading-sm shrink-0" />
          )}
        </div>

        <div className="mt-6 md:hidden">
          {currentMonthEvents.length === 0 && !loading && (
            <div className="w-full p-4 text-center rounded-xl bg-base-200">
              <h3 className="font-semibold text-base-content">
                Aucun événement ce mois-ci
              </h3>

              <p className="mt-1 text-sm text-base-content/60">
                Les dates d’envoi, de relance et d’entretien apparaîtront ici.
              </p>
            </div>
          )}

          {currentMonthEvents.length > 0 && (
            <div className="w-full flex flex-col justify-start items-stretch gap-2">
              {currentMonthEvents.map(function (event) {
                return (
                  <button
                    className="w-full min-w-0 p-4 flex flex-row justify-between items-center gap-4 text-left rounded-xl bg-base-200 hover:bg-base-300 cursor-pointer"
                    key={event.id}
                    type="button"
                    onClick={function () { openApplication(event.applicationId); }}
                  >
                    <div className="min-w-0">
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

                    <span className={getCalendarEventClassName(event.type)}>
                      {getCalendarEventLabel(event.type)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden md:block mt-6 overflow-hidden rounded-xl border border-base-300">
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
                        <button
                          className={"w-full min-w-0 px-2 py-1 flex flex-row justify-start items-center gap-1 text-left text-xs font-medium rounded-md truncate cursor-pointer " + getCalendarEventClassName(event.type)}
                          key={event.id}
                          type="button"
                          title={getCalendarEventLabel(event.type) + " - " + event.label + " - " + event.subtitle}
                          onClick={function () { openApplication(event.applicationId); }}
                        >
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

      <div className="w-full min-w-0 p-4 rounded-2xl bg-base-100 shadow-sm">
        <p className="text-sm text-base-content/60">
          Un clic sur un événement ouvre la table des candidatures avec uniquement la candidature concernée.
        </p>
      </div>
    </section>
  );
}

export default CalendarPage;
