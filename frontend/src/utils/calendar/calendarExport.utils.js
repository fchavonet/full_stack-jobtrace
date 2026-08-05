function getCalendarExportEventLabel(type) {
  if (type === "sent") {
    return "Candidature";
  }

  if (type === "follow_up") {
    return "Relance";
  }

  if (type === "interview") {
    return "Entretien";
  }

  return "Événement";
}

function escapeCalendarText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatCalendarExportDate(dateValue) {
  return String(dateValue).replace(/-/g, "");
}

function getNextCalendarExportDate(dateValue) {
  const date =
    new Date(dateValue + "T00:00:00");

  date.setDate(date.getDate() + 1);

  const year =
    String(date.getFullYear());

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return year + month + day;
}

function getCalendarExportTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function getCalendarExportMonthKey(currentMonth) {
  const year =
    currentMonth.getFullYear();

  const month =
    String(currentMonth.getMonth() + 1)
      .padStart(2, "0");

  return year + "-" + month;
}

function getCalendarExportMonthLabel(currentMonth) {
  const formatter =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        month: "long",
        year: "numeric",
      }
    );

  const label =
    formatter.format(currentMonth);

  return (
    label.charAt(0).toUpperCase()
    + label.slice(1)
  );
}

function foldCalendarLine(line) {
  const foldedLines = [];
  let remainingLine = line;

  while (remainingLine.length > 72) {
    foldedLines.push(
      remainingLine.slice(0, 72)
    );

    remainingLine =
      " "
      + remainingLine.slice(72);
  }

  foldedLines.push(remainingLine);

  return foldedLines.join("\r\n");
}

function buildCalendarEventLines(
  event,
  timestamp
) {
  const eventTypeLabel =
    getCalendarExportEventLabel(
      event.type
    );

  const summary =
    eventTypeLabel
    + " - "
    + event.label;

  const description =
    "Poste : "
    + event.subtitle
    + "\nType : "
    + eventTypeLabel
    + "\nSource : JobTrace";

  return [
    "BEGIN:VEVENT",
    "UID:"
      + event.id
      + "-"
      + event.date
      + "@jobtrace.fr",
    "DTSTAMP:" + timestamp,
    "DTSTART;VALUE=DATE:"
      + formatCalendarExportDate(
        event.date
      ),
    "DTEND;VALUE=DATE:"
      + getNextCalendarExportDate(
        event.date
      ),
    "SUMMARY:"
      + escapeCalendarText(summary),
    "DESCRIPTION:"
      + escapeCalendarText(
        description
      ),
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ];
}

export function buildCalendarIcsContent(
  events,
  currentMonth
) {
  const timestamp =
    getCalendarExportTimestamp();

  const calendarName =
    "JobTrace - "
    + getCalendarExportMonthLabel(
      currentMonth
    );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JobTrace//Calendrier//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:"
      + escapeCalendarText(
        calendarName
      ),
  ];

  events.forEach(function (event) {
    const eventLines =
      buildCalendarEventLines(
        event,
        timestamp
      );

    lines.push(...eventLines);
  });

  lines.push("END:VCALENDAR");

  return (
    lines
      .map(foldCalendarLine)
      .join("\r\n")
    + "\r\n"
  );
}

export function downloadCalendarEventsAsIcs(
  events,
  currentMonth
) {
  if (events.length === 0) {
    return false;
  }

  const calendarContent =
    buildCalendarIcsContent(
      events,
      currentMonth
    );

  const calendarBlob =
    new Blob(
      [calendarContent],
      {
        type:
          "text/calendar;charset=utf-8",
      }
    );

  const objectUrl =
    URL.createObjectURL(
      calendarBlob
    );

  const downloadLink =
    document.createElement("a");

  downloadLink.href = objectUrl;
  downloadLink.download =
    "jobtrace-calendrier-"
    + getCalendarExportMonthKey(
      currentMonth
    )
    + ".ics";

  downloadLink.style.display =
    "none";

  document.body.appendChild(
    downloadLink
  );

  downloadLink.click();
  downloadLink.remove();

  window.setTimeout(
    function () {
      URL.revokeObjectURL(
        objectUrl
      );
    },
    0
  );

  return true;
}
