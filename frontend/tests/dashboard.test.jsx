import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  MemoryRouter,
} from "react-router-dom";

import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import DashboardPage from "../src/pages/DashboardPage";

import {
  getApplicationCompany,
  getApplicationCreatedAt,
  getApplicationDashboardLink,
  getApplicationFollowUpAt,
  getApplicationInterviewAt,
  getApplicationPosition,
  getApplicationSentAt,
  getApplicationStatus,
  getApplicationTitle,
  getDailyObjectiveSummary,
  getDashboardDailyGoal,
  getDashboardDisplayName,
  getLatestApplications,
  getUpcomingFollowUps,
  getUpcomingInterviews,
  formatDashboardDate,
} from "../src/utils/dashboard/dashboardHome.utils";

import {
  getApplicationHasContact,
  getApplicationHasDocument,
  getApplicationHasInterview,
  getApplicationHasNotes,
  getApplicationHasTag,
  getApplicationIsFinal,
  getApplicationsFromLastDays,
  getBarHeight,
  getCompanyRows,
  getContractTypeRows,
  getDateKey,
  getFunnelRows,
  getMaxCount,
  getMonthKey,
  getMonthLabelFromKey,
  getPercent,
  getPercentLabel,
  getProgressWidth,
  getStatisticsSummary,
  getStatusRows,
  getTrackingQualityRows,
} from "../src/utils/statistics/statistics.utils";

import {
  JOB_BOARD_LINKS,
} from "../src/constants/jobBoards.constants";

import {
  TEST_APPLICATION,
  TEST_CONTACT,
  TEST_DOCUMENT,
  TEST_TAG,
  TEST_USER,
} from "./helpers/test-data";

const mocks = vi.hoisted(function () {
  return {
    listApplications: vi.fn(),
    getUserProfile: vi.fn(),
    useAuth: vi.fn(),
    useToast: vi.fn(),
    showToast: vi.fn(),
  };
});

vi.mock("../src/api/applications.api", function () {
  return {
    listApplications: mocks.listApplications,
  };
});

vi.mock("../src/api/profile.api", function () {
  return {
    getUserProfile: mocks.getUserProfile,
  };
});

vi.mock("../src/hooks/useAuth", function () {
  return {
    useAuth: mocks.useAuth,
  };
});

vi.mock("../src/hooks/useToast", function () {
  return {
    useToast: mocks.useToast,
  };
});

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

beforeEach(function () {
  vi.useRealTimers();

  mocks.listApplications.mockReset();
  mocks.getUserProfile.mockReset();
  mocks.useAuth.mockReset();
  mocks.useToast.mockReset();
  mocks.showToast.mockReset();

  mocks.useAuth.mockReturnValue({
    user: TEST_USER,
  });

  mocks.useToast.mockReturnValue({
    showToast: mocks.showToast,
  });
});

describe("Dashboard display utilities", function () {
  test("getDashboardDisplayName - Should return full profile name", function () {
    expect(
      getDashboardDisplayName(
        {
          firstName: "  Fabien  ",
          lastName: "  Chavonet  ",
        },
        TEST_USER,
      ),
    ).toBe("Fabien Chavonet");
  });

  test("getDashboardDisplayName - Should support snake case profile", function () {
    expect(
      getDashboardDisplayName(
        {
          first_name: "Dick",
          last_name: "Grayson",
        },
        TEST_USER,
      ),
    ).toBe("Dick Grayson");
  });

  test("getDashboardDisplayName - Should return profile email", function () {
    expect(
      getDashboardDisplayName(
        {
          email: "profile@jobtrace.test",
        },
        TEST_USER,
      ),
    ).toBe("profile@jobtrace.test");
  });

  test("getDashboardDisplayName - Should return authenticated user email", function () {
    expect(
      getDashboardDisplayName(
        {},
        {
          email: "user@jobtrace.test",
        },
      ),
    ).toBe("user@jobtrace.test");
  });

  test("getDashboardDisplayName - Should return fallback", function () {
    expect(
      getDashboardDisplayName(
        {},
        {},
      ),
    ).toBe("Utilisateur");
  });

  test("getDashboardDailyGoal - Should return camel case goal", function () {
    expect(
      getDashboardDailyGoal({
        dailyGoal: 8,
      }),
    ).toBe(8);
  });

  test("getDashboardDailyGoal - Should return snake case goal", function () {
    expect(
      getDashboardDailyGoal({
        daily_goal: "10",
      }),
    ).toBe(10);
  });

  test("getDashboardDailyGoal - Should return default goal", function () {
    expect(
      getDashboardDailyGoal({}),
    ).toBe(5);

    expect(
      getDashboardDailyGoal({
        dailyGoal: 0,
      }),
    ).toBe(5);

    expect(
      getDashboardDailyGoal({
        dailyGoal: "invalid",
      }),
    ).toBe(5);
  });

  test("getApplicationStatus - Should return application status", function () {
    expect(
      getApplicationStatus({
        status: "interview",
      }),
    ).toBe("interview");
  });

  test("getApplicationStatus - Should return sent by default", function () {
    expect(
      getApplicationStatus(null),
    ).toBe("sent");

    expect(
      getApplicationStatus({}),
    ).toBe("sent");
  });

  test("getApplicationCreatedAt - Should support both formats", function () {
    expect(
      getApplicationCreatedAt({
        createdAt: "2026-07-12",
      }),
    ).toBe("2026-07-12");

    expect(
      getApplicationCreatedAt({
        created_at: "2026-07-11",
      }),
    ).toBe("2026-07-11");
  });

  test("getApplicationSentAt - Should support both formats", function () {
    expect(
      getApplicationSentAt({
        sentAt: "2026-07-12",
      }),
    ).toBe("2026-07-12");

    expect(
      getApplicationSentAt({
        sent_at: "2026-07-11",
      }),
    ).toBe("2026-07-11");
  });

  test("getApplicationFollowUpAt - Should support both formats", function () {
    expect(
      getApplicationFollowUpAt({
        followUpAt: "2026-07-12",
      }),
    ).toBe("2026-07-12");

    expect(
      getApplicationFollowUpAt({
        follow_up_at: "2026-07-11",
      }),
    ).toBe("2026-07-11");
  });

  test("getApplicationInterviewAt - Should support both formats", function () {
    expect(
      getApplicationInterviewAt({
        interviewAt: "2026-07-12",
      }),
    ).toBe("2026-07-12");

    expect(
      getApplicationInterviewAt({
        interview_at: "2026-07-11",
      }),
    ).toBe("2026-07-11");
  });

  test("getApplicationTitle - Should combine company and position", function () {
    expect(
      getApplicationTitle({
        company: "Apple",
        position: "Développeur",
      }),
    ).toBe("Apple - Développeur");
  });

  test("getApplicationTitle - Should return partial title", function () {
    expect(
      getApplicationTitle({
        company: "Apple",
      }),
    ).toBe("Apple");

    expect(
      getApplicationTitle({
        position: "Développeur",
      }),
    ).toBe("Développeur");
  });

  test("getApplicationTitle - Should return fallback", function () {
    expect(
      getApplicationTitle(null),
    ).toBe("Candidature");

    expect(
      getApplicationTitle({}),
    ).toBe("Candidature");
  });

  test("getApplicationCompany - Should return company or fallback", function () {
    expect(
      getApplicationCompany({
        company: "Apple",
      }),
    ).toBe("Apple");

    expect(
      getApplicationCompany({}),
    ).toBe("Entreprise non renseignée");
  });

  test("getApplicationPosition - Should return position or fallback", function () {
    expect(
      getApplicationPosition({
        position: "Développeur",
      }),
    ).toBe("Développeur");

    expect(
      getApplicationPosition({}),
    ).toBe("Poste non renseigné");
  });

  test("getApplicationDashboardLink - Should build application link", function () {
    expect(
      getApplicationDashboardLink({
        id: "application-id",
      }),
    ).toBe(
      "/dashboard/applications?application=application-id",
    );
  });

  test("getApplicationDashboardLink - Should return applications page", function () {
    expect(
      getApplicationDashboardLink({}),
    ).toBe("/dashboard/applications");
  });

  test("formatDashboardDate - Should format valid date", function () {
    const result = formatDashboardDate(
      "2026-07-12T12:00:00.000Z",
    );

    expect(result).toMatch(/12/);
    expect(result.toLowerCase()).toMatch(/juil/);
  });

  test("formatDashboardDate - Should return fallback", function () {
    expect(
      formatDashboardDate(null),
    ).toBe("-");

    expect(
      formatDashboardDate("invalid-date"),
    ).toBe("-");
  });
});

describe("Dashboard objective utilities", function () {
  test("getDailyObjectiveSummary - Should count today's applications", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T12:00:00.000Z"),
    );

    const applications = [
      {
        createdAt: "2026-07-12T08:00:00.000Z",
      },
      {
        createdAt: "2026-07-12T10:00:00.000Z",
      },
      {
        createdAt: "2026-07-11T10:00:00.000Z",
      },
    ];

    expect(
      getDailyObjectiveSummary(
        applications,
        {
          dailyGoal: 5,
        },
      ),
    ).toEqual({
      dailyGoal: 5,
      completedToday: 2,
      progress: 40,
      remaining: 3,
    });
  });

  test("getDailyObjectiveSummary - Should cap progress at one hundred", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T12:00:00.000Z"),
    );

    const applications = [
      {
        createdAt: "2026-07-12T08:00:00.000Z",
      },
      {
        createdAt: "2026-07-12T09:00:00.000Z",
      },
      {
        createdAt: "2026-07-12T10:00:00.000Z",
      },
    ];

    expect(
      getDailyObjectiveSummary(
        applications,
        {
          dailyGoal: 2,
        },
      ),
    ).toEqual({
      dailyGoal: 2,
      completedToday: 3,
      progress: 100,
      remaining: 0,
    });
  });

  test("getDailyObjectiveSummary - Should use default goal", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T12:00:00.000Z"),
    );

    expect(
      getDailyObjectiveSummary(
        [],
        {},
      ),
    ).toEqual({
      dailyGoal: 5,
      completedToday: 0,
      progress: 0,
      remaining: 5,
    });
  });
});

describe("Dashboard application lists", function () {
  const applications = [
    {
      id: "first",
      status: "sent",
      createdAt: "2026-07-10T10:00:00.000Z",
      followUpAt: "2026-07-15T10:00:00.000Z",
      interviewAt: "",
    },
    {
      id: "second",
      status: "interview",
      createdAt: "2026-07-12T10:00:00.000Z",
      followUpAt: "",
      interviewAt: "2026-07-14T10:00:00.000Z",
    },
    {
      id: "third",
      status: "accepted",
      createdAt: "2026-07-11T10:00:00.000Z",
      followUpAt: "2026-07-13T10:00:00.000Z",
      interviewAt: "2026-07-13T10:00:00.000Z",
    },
    {
      id: "fourth",
      status: "sent",
      createdAt: "invalid-date",
      followUpAt: "invalid-date",
      interviewAt: "",
    },
  ];

  test("getUpcomingFollowUps - Should return upcoming non-final entries", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    const result = getUpcomingFollowUps(
      applications,
      5,
    );

    expect(
      result.map(function (entry) {
        return entry.application.id;
      }),
    ).toEqual([
      "first",
    ]);
  });

  test("getUpcomingInterviews - Should return upcoming interviews", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    const result = getUpcomingInterviews(
      applications,
      5,
    );

    expect(
      result.map(function (entry) {
        return entry.application.id;
      }),
    ).toEqual([
      "second",
    ]);
  });

  test("getUpcomingFollowUps - Should respect limit", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T10:00:00.000Z"),
    );

    const result = getUpcomingFollowUps(
      [
        {
          id: "first",
          status: "sent",
          followUpAt: "2026-07-13",
        },
        {
          id: "second",
          status: "sent",
          followUpAt: "2026-07-14",
        },
      ],
      1,
    );

    expect(result).toHaveLength(1);
    expect(result[0].application.id).toBe("first");
  });

  test("getLatestApplications - Should sort newest first", function () {
    const result = getLatestApplications(
      applications,
      3,
    );

    expect(
      result.map(function (application) {
        return application.id;
      }),
    ).toEqual([
      "second",
      "third",
      "first",
    ]);
  });

  test("getLatestApplications - Should not mutate source array", function () {
    const source = applications.slice();

    getLatestApplications(
      source,
      2,
    );

    expect(source).toEqual(applications);
  });
});

describe("Statistics basic utilities", function () {
  test("getPercent - Should calculate percentage", function () {
    expect(
      getPercent(2, 5),
    ).toBe(40);
  });

  test("getPercent - Should return zero without total", function () {
    expect(
      getPercent(2, 0),
    ).toBe(0);
  });

  test("getPercentLabel - Should return percentage label", function () {
    expect(
      getPercentLabel(1, 4),
    ).toBe("25 %");
  });

  test("getProgressWidth - Should calculate progress width", function () {
    expect(
      getProgressWidth(5, 10),
    ).toBe("50%");
  });

  test("getProgressWidth - Should enforce minimum visible width", function () {
    expect(
      getProgressWidth(1, 100),
    ).toBe("8%");
  });

  test("getProgressWidth - Should return zero width", function () {
    expect(
      getProgressWidth(0, 10),
    ).toBe("0%");

    expect(
      getProgressWidth(1, 0),
    ).toBe("0%");
  });

  test("getBarHeight - Should calculate bar height", function () {
    expect(
      getBarHeight(5, 10),
    ).toBe("50%");
  });

  test("getBarHeight - Should enforce minimum height", function () {
    expect(
      getBarHeight(1, 100),
    ).toBe("12%");
  });

  test("getBarHeight - Should return pixel fallback", function () {
    expect(
      getBarHeight(0, 10),
    ).toBe("8px");

    expect(
      getBarHeight(1, 0),
    ).toBe("8px");
  });

  test("getMaxCount - Should return highest count", function () {
    expect(
      getMaxCount([
        {
          count: 2,
        },
        {
          count: 7,
        },
        {
          count: 4,
        },
      ]),
    ).toBe(7);
  });

  test("getMaxCount - Should return zero for empty rows", function () {
    expect(
      getMaxCount([]),
    ).toBe(0);
  });
});

describe("Statistics application utilities", function () {
  test("getApplicationIsFinal - Should identify final statuses", function () {
    expect(
      getApplicationIsFinal({
        status: "accepted",
      }),
    ).toBe(true);

    expect(
      getApplicationIsFinal({
        status: "rejected",
      }),
    ).toBe(true);

    expect(
      getApplicationIsFinal({
        status: "sent",
      }),
    ).toBe(false);
  });

  test("getApplicationHasInterview - Should detect interview status", function () {
    expect(
      getApplicationHasInterview({
        status: "interview",
      }),
    ).toBe(true);
  });

  test("getApplicationHasInterview - Should detect interview date", function () {
    expect(
      getApplicationHasInterview({
        status: "sent",
        interviewAt: "2026-07-15",
      }),
    ).toBe(true);
  });

  test("getApplicationHasContact - Should detect contacts", function () {
    expect(
      getApplicationHasContact({
        contacts: [
          TEST_CONTACT,
        ],
      }),
    ).toBe(true);

    expect(
      getApplicationHasContact({
        contacts: [],
      }),
    ).toBe(false);
  });

  test("getApplicationHasDocument - Should detect documents", function () {
    expect(
      getApplicationHasDocument({
        documents: [
          TEST_DOCUMENT,
        ],
      }),
    ).toBe(true);

    expect(
      getApplicationHasDocument({
        documents: [],
      }),
    ).toBe(false);
  });

  test("getApplicationHasTag - Should detect tags", function () {
    expect(
      getApplicationHasTag({
        tags: [
          TEST_TAG,
        ],
      }),
    ).toBe(true);

    expect(
      getApplicationHasTag({
        tags: [],
      }),
    ).toBe(false);
  });

  test("getApplicationHasNotes - Should detect notes", function () {
    expect(
      getApplicationHasNotes({
        notes: "Entretien prévu.",
      }),
    ).toBe(true);

    expect(
      getApplicationHasNotes({
        notes: "   ",
      }),
    ).toBe(false);
  });

  test("getDateKey - Should return date key", function () {
    expect(
      getDateKey(
        "2026-07-12T12:00:00.000Z",
      ),
    ).toBe("2026-07-12");
  });

  test("getDateKey - Should reject invalid date", function () {
    expect(
      getDateKey("invalid-date"),
    ).toBe("");
  });

  test("getMonthKey - Should return month key", function () {
    expect(
      getMonthKey(
        "2026-07-12T12:00:00.000Z",
      ),
    ).toBe("2026-07");
  });

  test("getMonthLabelFromKey - Should return formatted label", function () {
    const result = getMonthLabelFromKey(
      "2026-07",
    );

    expect(result).toMatch(/Juil/);
    expect(result).toMatch(/2026/);
  });

  test("getMonthLabelFromKey - Should return fallback", function () {
    expect(
      getMonthLabelFromKey("invalid"),
    ).toBe("Non daté");
  });
});

describe("Statistics aggregation utilities", function () {
  const applications = [
    {
      ...TEST_APPLICATION,
      id: "accepted",
      company: "Apple",
      status: "accepted",
      createdAt: "2026-07-12T10:00:00.000Z",
      followUpAt: "",
      interviewAt: "",
      contacts: [
        TEST_CONTACT,
      ],
      documents: [
        TEST_DOCUMENT,
      ],
      tags: [
        TEST_TAG,
      ],
      notes: "Candidature acceptée.",
    },
    {
      ...TEST_APPLICATION,
      id: "rejected",
      company: "Apple",
      status: "rejected",
      createdAt: "2026-07-11T10:00:00.000Z",
      followUpAt: "",
      interviewAt: "",
      contacts: [],
      documents: [],
      tags: [],
      notes: "",
    },
    {
      ...TEST_APPLICATION,
      id: "interview",
      company: "Tesla",
      status: "interview",
      createdAt: "2026-07-10T10:00:00.000Z",
      followUpAt: "2026-07-15",
      interviewAt: "2026-07-20",
      contacts: [],
      documents: [],
      tags: [],
      notes: "",
    },
    {
      ...TEST_APPLICATION,
      id: "sent",
      company: "",
      status: "sent",
      createdAt: "2026-07-09T10:00:00.000Z",
      followUpAt: "2026-07-16",
      interviewAt: "",
      contacts: [],
      documents: [],
      tags: [],
      notes: "",
    },
  ];

  test("getStatisticsSummary - Should calculate dashboard totals", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T12:00:00.000Z"),
    );

    expect(
      getStatisticsSummary(applications),
    ).toEqual({
      total: 4,
      active: 2,
      accepted: 1,
      rejected: 1,
      interviews: 1,
      followUps: 2,
      withContacts: 1,
      withDocuments: 1,
      withTags: 1,
      withNotes: 1,
      recentCount: 4,
      successRate: 25,
      interviewRate: 25,
    });
  });

  test("getApplicationsFromLastDays - Should keep recent applications", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T12:00:00.000Z"),
    );

    const result = getApplicationsFromLastDays(
      applications,
      2,
    );

    expect(
      result.map(function (application) {
        return application.id;
      }),
    ).toEqual([
      "accepted",
      "rejected",
    ]);
  });

  test("getStatusRows - Should return populated statuses", function () {
    const rows = getStatusRows(applications);

    expect(
      rows.map(function (row) {
        return row.key;
      }),
    ).toEqual([
      "sent",
      "interview",
      "rejected",
      "accepted",
    ]);
  });

  test("getContractTypeRows - Should include every contract option", function () {
    const rows = getContractTypeRows(applications);

    expect(rows.length).toBeGreaterThan(0);

    expect(
      rows.reduce(function (total, row) {
        return total + row.count;
      }, 0),
    ).toBe(applications.length);
  });

  test("getCompanyRows - Should aggregate and sort companies", function () {
    expect(
      getCompanyRows(applications),
    ).toEqual([
      {
        key: "Apple",
        label: "Apple",
        count: 2,
      },
      {
        key: "Tesla",
        label: "Tesla",
        count: 1,
      },
      {
        key: "Non renseigné",
        label: "Non renseigné",
        count: 1,
      },
    ]);
  });

  test("getTrackingQualityRows - Should build quality rows", function () {
    const summary = getStatisticsSummary(
      applications,
    );

    expect(
      getTrackingQualityRows(summary),
    ).toEqual([
      {
        key: "tags",
        label: "Avec tag",
        count: 1,
        percent: 25,
      },
      {
        key: "contacts",
        label: "Avec contact lié",
        count: 1,
        percent: 25,
      },
      {
        key: "documents",
        label: "Avec document lié",
        count: 1,
        percent: 25,
      },
      {
        key: "notes",
        label: "Avec notes",
        count: 1,
        percent: 25,
      },
    ]);
  });

  test("getFunnelRows - Should build funnel rows", function () {
    const summary = getStatisticsSummary(
      applications,
    );

    expect(
      getFunnelRows(summary),
    ).toEqual([
      {
        key: "total",
        label: "Candidatures enregistrées",
        count: 4,
        percent: 100,
      },
      {
        key: "followUps",
        label: "Relances planifiées",
        count: 2,
        percent: 50,
      },
      {
        key: "interviews",
        label: "Entretiens obtenus",
        count: 1,
        percent: 25,
      },
      {
        key: "accepted",
        label: "Candidatures acceptées",
        count: 1,
        percent: 25,
      },
    ]);
  });
});

test("DashboardPage - Should display loading state", function () {
  mocks.listApplications.mockReturnValue(
    new Promise(function () { }),
  );

  mocks.getUserProfile.mockReturnValue(
    new Promise(function () { }),
  );

  const {
    container,
  } = renderDashboard();

  expect(
    screen.getByRole(
      "heading",
      {
        name: "Tableau de bord",
      },
    ),
  ).toBeInTheDocument();

  expect(
    container.querySelector(".loading-spinner"),
  ).toBeInTheDocument();
});

test("DashboardPage - Should display loaded dashboard", async function () {
  const now = new Date();

  const todayAtEight = new Date(now);
  todayAtEight.setHours(8, 0, 0, 0);

  const yesterdayAtEight = new Date(todayAtEight);
  yesterdayAtEight.setDate(
    yesterdayAtEight.getDate() - 1,
  );

  const followUpDate = new Date(todayAtEight);
  followUpDate.setDate(
    followUpDate.getDate() + 3,
  );

  const interviewDate = new Date(todayAtEight);
  interviewDate.setDate(
    interviewDate.getDate() + 4,
  );

  const applications = [
    {
      ...TEST_APPLICATION,
      id: "application-one",
      company: "Apple",
      position: "Frontend Developer",
      status: "sent",
      createdAt: todayAtEight.toISOString(),
      sentAt: todayAtEight.toISOString(),
      followUpAt: followUpDate.toISOString(),
      interviewAt: "",
    },
    {
      ...TEST_APPLICATION,
      id: "application-two",
      company: "Tesla",
      position: "Full Stack Developer",
      status: "interview",
      createdAt: yesterdayAtEight.toISOString(),
      sentAt: yesterdayAtEight.toISOString(),
      followUpAt: "",
      interviewAt: interviewDate.toISOString(),
    },
  ];

  mocks.listApplications.mockResolvedValue({
    data: {
      applications,
    },
  });

  mocks.getUserProfile.mockResolvedValue({
    data: {
      user: {
        firstName: "Fabien",
        lastName: "Chavonet",
        theme: "dark",
        dailyGoal: 5,
        followUpDelayDays: 10,
      },
    },
  });

  renderDashboard();

  await waitFor(function () {
    expect(
      screen.getByText("Fabien Chavonet"),
    ).toBeInTheDocument();
  });

  expect(
    screen.getByText("Sombre"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("5 candidature(s)"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("10 jour(s)"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("1 / 5"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Apple"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Tesla"),
  ).toBeInTheDocument();

  expect(
    screen.getByRole(
      "link",
      {
        name: /Nouvelle candidature/,
      },
    ),
  ).toHaveAttribute(
    "href",
    "/dashboard/applications?new=1",
  );
});

test("DashboardPage - Should display empty lists", async function () {
  mocks.listApplications.mockResolvedValue({
    data: {
      applications: [],
    },
  });

  mocks.getUserProfile.mockResolvedValue({
    data: {
      user: {},
    },
  });

  renderDashboard();

  await waitFor(function () {
    expect(
      screen.getByText(
        "Aucune relance prévue.",
      ),
    ).toBeInTheDocument();
  });

  expect(
    screen.getByText(
      "Aucun entretien prévu.",
    ),
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      "Aucune candidature récente.",
    ),
  ).toBeInTheDocument();
});

test("DashboardPage - Should display application loading error", async function () {
  mocks.listApplications.mockRejectedValue(
    new Error("Applications unavailable."),
  );

  mocks.getUserProfile.mockResolvedValue({
    data: {
      user: {},
    },
  });

  renderDashboard();

  await waitFor(function () {
    expect(
      mocks.showToast,
    ).toHaveBeenCalledWith(
      "Impossible de charger les candidatures du tableau de bord.",
      "error",
    );
  });

  expect(
    screen.getByText(
      "Aucune candidature récente.",
    ),
  ).toBeInTheDocument();
});

test("DashboardPage - Should fallback when profile loading fails", async function () {
  mocks.listApplications.mockResolvedValue({
    data: {
      applications: [],
    },
  });

  mocks.getUserProfile.mockRejectedValue(
    new Error("Profile unavailable."),
  );

  mocks.useAuth.mockReturnValue({
    user: {
      email: "fabien@jobtrace.test",
    },
  });

  renderDashboard();

  await waitFor(function () {
    expect(
      screen.getByText(
        "fabien@jobtrace.test",
      ),
    ).toBeInTheDocument();
  });

  expect(
    screen.getByText("Clair"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("5 candidature(s)"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("15 jour(s)"),
  ).toBeInTheDocument();
});

test("DashboardPage - Should display every job board", async function () {
  mocks.listApplications.mockResolvedValue({
    data: {
      applications: [],
    },
  });

  mocks.getUserProfile.mockResolvedValue({
    data: {
      user: {},
    },
  });

  renderDashboard();

  await waitFor(function () {
    expect(
      screen.getByText(
        "Sites emploi utiles",
      ),
    ).toBeInTheDocument();
  });

  JOB_BOARD_LINKS.forEach(function (jobBoard) {
    expect(
      screen.getByRole(
        "link",
        {
          name: new RegExp(jobBoard.label),
        },
      ),
    ).toHaveAttribute(
      "href",
      jobBoard.url,
    );
  });
});
