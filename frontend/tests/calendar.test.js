import {
  describe,
  expect,
  test,
} from "vitest";

import {
  addMonths,
  buildCalendarDays,
  buildCalendarEvents,
  CALENDAR_WEEK_DAYS,
  formatCalendarMonth,
  getCalendarEventClassName,
  getCalendarEventLabel,
  getCalendarEventSortValue,
  getDateOnly,
  getIsoDate,
  getStartOfMonth,
  groupCalendarEventsByDate,
} from "../src/utils/calendar/calendar.utils";

describe("Calendar date utilities", function () {
  test("CALENDAR_WEEK_DAYS - Should contain seven French days", function () {
    expect(
      CALENDAR_WEEK_DAYS,
    ).toEqual([
      "Lun.",
      "Mar.",
      "Mer.",
      "Jeu.",
      "Ven.",
      "Sam.",
      "Dim.",
    ]);
  });

  test("getStartOfMonth - Should return first day", function () {
    expect(
      getStartOfMonth(
        new Date(2026, 6, 12),
      ),
    ).toEqual(
      new Date(2026, 6, 1),
    );
  });

  test("addMonths - Should add one month", function () {
    expect(
      addMonths(
        new Date(2026, 6, 12),
        1,
      ),
    ).toEqual(
      new Date(2026, 7, 1),
    );
  });

  test("addMonths - Should support previous month", function () {
    expect(
      addMonths(
        new Date(2026, 0, 12),
        -1,
      ),
    ).toEqual(
      new Date(2025, 11, 1),
    );
  });

  test("addMonths - Should support year rollover", function () {
    expect(
      addMonths(
        new Date(2026, 11, 12),
        1,
      ),
    ).toEqual(
      new Date(2027, 0, 1),
    );
  });

  test("getIsoDate - Should return ISO date", function () {
    expect(
      getIsoDate(
        new Date(2026, 6, 12),
      ),
    ).toBe("2026-07-12");
  });

  test("getIsoDate - Should pad month and day", function () {
    expect(
      getIsoDate(
        new Date(2026, 0, 2),
      ),
    ).toBe("2026-01-02");
  });

  test("getDateOnly - Should return first ten characters", function () {
    expect(
      getDateOnly(
        "2026-07-12T10:00:00.000Z",
      ),
    ).toBe("2026-07-12");
  });

  test("getDateOnly - Should support Date-compatible string conversion", function () {
    expect(
      getDateOnly(20260712),
    ).toBe("20260712");
  });

  test("getDateOnly - Should return empty value", function () {
    expect(
      getDateOnly(null),
    ).toBe("");

    expect(
      getDateOnly(""),
    ).toBe("");
  });

  test("formatCalendarMonth - Should format French month", function () {
    expect(
      formatCalendarMonth(
        new Date(2026, 6, 1),
      ),
    ).toBe("Juillet 2026");
  });

  test("buildCalendarDays - Should return six weeks", function () {
    const days = buildCalendarDays(
      new Date(2026, 6, 1),
    );

    expect(days).toHaveLength(42);
  });

  test("buildCalendarDays - Should start on Monday", function () {
    const days = buildCalendarDays(
      new Date(2026, 6, 1),
    );

    expect(
      days[0].getDay(),
    ).toBe(1);
  });

  test("buildCalendarDays - Should include previous month days", function () {
    const days = buildCalendarDays(
      new Date(2026, 6, 1),
    );

    expect(
      getIsoDate(days[0]),
    ).toBe("2026-06-29");
  });

  test("buildCalendarDays - Should include next month days", function () {
    const days = buildCalendarDays(
      new Date(2026, 6, 1),
    );

    expect(
      getIsoDate(days[41]),
    ).toBe("2026-08-09");
  });

  test("buildCalendarDays - Should handle month starting Sunday", function () {
    const days = buildCalendarDays(
      new Date(2026, 10, 1),
    );

    expect(
      days[0].getDay(),
    ).toBe(1);

    expect(
      getIsoDate(days[0]),
    ).toBe("2026-10-26");
  });
});

describe("Calendar event utilities", function () {
  test("buildCalendarEvents - Should create sent event", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "sent",
        sentAt: "2026-07-01",
      },
    ]);

    expect(events).toEqual([
      {
        id: "application-id-sent",
        applicationId: "application-id",
        date: "2026-07-01",
        type: "sent",
        label: "Apple",
        subtitle: "Développeur",
      },
    ]);
  });

  test("buildCalendarEvents - Should create relevant follow-up", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "sent",
        sentAt: "2026-07-01",
        followUpAt: "2026-07-10",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
      "follow_up",
    ]);
  });

  test("buildCalendarEvents - Should create relevant interview", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "interview",
        sentAt: "2026-07-01",
        interviewAt: "2026-07-12",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
      "interview",
    ]);
  });

  test("buildCalendarEvents - Should ignore follow-up after interview", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "interview",
        sentAt: "2026-07-01",
        followUpAt: "2026-07-10",
        interviewAt: "2026-07-12",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
      "interview",
    ]);
  });

  test("buildCalendarEvents - Should ignore follow-up for interview status", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "interview",
        sentAt: "2026-07-01",
        followUpAt: "2026-07-10",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
    ]);
  });

  test("buildCalendarEvents - Should ignore final interview", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "accepted",
        sentAt: "2026-07-01",
        interviewAt: "2026-07-12",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
    ]);
  });

  test("buildCalendarEvents - Should ignore final follow-up", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "rejected",
        sentAt: "2026-07-01",
        followUpAt: "2026-07-12",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
    ]);
  });

  test("buildCalendarEvents - Should ignore dates before sent date", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "sent",
        sentAt: "2026-07-10",
        followUpAt: "2026-07-01",
        interviewAt: "2026-07-02",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
    ]);
  });

  test("buildCalendarEvents - Should accept same-day follow-up", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "sent",
        sentAt: "2026-07-10",
        followUpAt: "2026-07-10",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
      "follow_up",
    ]);
  });

  test("buildCalendarEvents - Should sort event types", function () {
    const events = buildCalendarEvents([
      {
        id: "application-id",
        company: "Apple",
        position: "Développeur",
        status: "sent",
        sentAt: "2026-07-01",
        followUpAt: "2026-07-10",
      },
      {
        id: "application-two",
        company: "Tesla",
        position: "Développeur",
        status: "interview",
        sentAt: "2026-07-02",
        interviewAt: "2026-07-12",
      },
    ]);

    expect(
      events.map(function (event) {
        return event.type;
      }),
    ).toEqual([
      "sent",
      "sent",
      "follow_up",
      "interview",
    ]);
  });

  test("buildCalendarEvents - Should return empty array", function () {
    expect(
      buildCalendarEvents([]),
    ).toEqual([]);
  });

  test("groupCalendarEventsByDate - Should group events", function () {
    const events = [
      {
        date: "2026-07-12",
        id: "first",
      },
      {
        date: "2026-07-12",
        id: "second",
      },
      {
        date: "2026-07-13",
        id: "third",
      },
    ];

    expect(
      groupCalendarEventsByDate(events),
    ).toEqual({
      "2026-07-12": [
        events[0],
        events[1],
      ],
      "2026-07-13": [
        events[2],
      ],
    });
  });

  test("groupCalendarEventsByDate - Should return empty object", function () {
    expect(
      groupCalendarEventsByDate([]),
    ).toEqual({});
  });

  test("getCalendarEventSortValue - Should return event order", function () {
    expect(
      getCalendarEventSortValue("sent"),
    ).toBe(1);

    expect(
      getCalendarEventSortValue("follow_up"),
    ).toBe(2);

    expect(
      getCalendarEventSortValue("interview"),
    ).toBe(3);

    expect(
      getCalendarEventSortValue("unknown"),
    ).toBe(99);
  });

  test("getCalendarEventLabel - Should return labels", function () {
    expect(
      getCalendarEventLabel("sent"),
    ).toBe("Candidature");

    expect(
      getCalendarEventLabel("follow_up"),
    ).toBe("Relance");

    expect(
      getCalendarEventLabel("interview"),
    ).toBe("Entretien");

    expect(
      getCalendarEventLabel("unknown"),
    ).toBe("Événement");
  });

  test("getCalendarEventClassName - Should return classes", function () {
    expect(
      getCalendarEventClassName("sent"),
    ).toBe(
      "bg-info text-info-content hover:bg-info/90",
    );

    expect(
      getCalendarEventClassName("follow_up"),
    ).toBe(
      "bg-warning text-warning-content hover:bg-warning/90",
    );

    expect(
      getCalendarEventClassName("interview"),
    ).toBe(
      "bg-primary text-primary-content hover:bg-primary/90",
    );

    expect(
      getCalendarEventClassName("unknown"),
    ).toBe(
      "bg-base-300 text-base-content hover:bg-base-300/90",
    );
  });
});