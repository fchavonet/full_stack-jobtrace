import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  listAchievements,
} from "../src/api/achievements.api";

import {
  apiRequest,
} from "../src/api/client";

import {
  buildLastThirtyDaysActivity,
  countApplicationsForDate,
  getApplicationCreatedAt,
  getApplicationsCountFromActivity,
  getBestDayCount,
  getDateKey,
  getObjectiveProgress,
  getObjectiveProgressLabel,
  getReachedDaysCount,
  getSafeDailyGoal,
  normalizeAchievement,
  normalizeAchievements,
} from "../src/utils/achievements/objective.utils";

vi.mock("../src/api/client", function () {
  return {
    apiRequest: vi.fn(),
  };
});

beforeEach(function () {
  apiRequest.mockReset();
  vi.useRealTimers();
});

describe("Achievements API", function () {
  test("GET /achievements - Should list achievements", async function () {
    const response = {
      success: true,
      data: {
        achievements: [],
      },
    };

    apiRequest.mockResolvedValue(response);

    const result = await listAchievements();

    expect(apiRequest).toHaveBeenCalledWith(
      "/achievements",
      {
        method: "GET",
        authenticated: true,
      },
    );

    expect(result).toEqual(response);
  });

  test("GET /achievements - Should propagate API error", async function () {
    const apiError = {
      success: false,
      message: "Authentication required.",
    };

    apiRequest.mockRejectedValue(apiError);

    await expect(
      listAchievements(),
    ).rejects.toEqual(apiError);
  });
});

describe("Achievement objective utilities", function () {
  test("getSafeDailyGoal - Should return rounded goal", function () {
    expect(
      getSafeDailyGoal(5.4),
    ).toBe(5);

    expect(
      getSafeDailyGoal(5.6),
    ).toBe(6);

    expect(
      getSafeDailyGoal("7"),
    ).toBe(7);
  });

  test("getSafeDailyGoal - Should return default goal", function () {
    expect(
      getSafeDailyGoal(null),
    ).toBe(5);

    expect(
      getSafeDailyGoal(0),
    ).toBe(5);

    expect(
      getSafeDailyGoal(-1),
    ).toBe(5);

    expect(
      getSafeDailyGoal("invalid"),
    ).toBe(5);
  });

  test("getDateKey - Should return local date key", function () {
    expect(
      getDateKey(
        new Date(2026, 6, 12),
      ),
    ).toBe("2026-07-12");
  });

  test("getDateKey - Should reject invalid date", function () {
    expect(
      getDateKey("invalid-date"),
    ).toBe("");
  });

  test("getApplicationCreatedAt - Should support camel case", function () {
    expect(
      getApplicationCreatedAt({
        createdAt: "2026-07-12",
      }),
    ).toBe("2026-07-12");
  });

  test("getApplicationCreatedAt - Should support snake case", function () {
    expect(
      getApplicationCreatedAt({
        created_at: "2026-07-11",
      }),
    ).toBe("2026-07-11");
  });

  test("getApplicationCreatedAt - Should return empty value", function () {
    expect(
      getApplicationCreatedAt({}),
    ).toBe("");

    expect(
      getApplicationCreatedAt(null),
    ).toBe("");
  });

  test("countApplicationsForDate - Should count matching applications", function () {
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
      countApplicationsForDate(
        applications,
        new Date(2026, 6, 12),
      ),
    ).toBe(2);
  });

  test("countApplicationsForDate - Should return zero without match", function () {
    expect(
      countApplicationsForDate(
        [],
        new Date(2026, 6, 12),
      ),
    ).toBe(0);
  });

  test("getObjectiveProgress - Should calculate progress", function () {
    expect(
      getObjectiveProgress(2, 5),
    ).toBe(40);
  });

  test("getObjectiveProgress - Should round progress", function () {
    expect(
      getObjectiveProgress(1, 3),
    ).toBe(33);
  });

  test("getObjectiveProgress - Should cap progress", function () {
    expect(
      getObjectiveProgress(10, 5),
    ).toBe(100);
  });

  test("getObjectiveProgressLabel - Should return achieved label", function () {
    expect(
      getObjectiveProgressLabel(5, 5),
    ).toBe("Objectif atteint");
  });

  test("getObjectiveProgressLabel - Should return singular remaining label", function () {
    expect(
      getObjectiveProgressLabel(4, 5),
    ).toBe(
      "Encore 1 candidature pour atteindre votre objectif.",
    );
  });

  test("getObjectiveProgressLabel - Should return plural remaining label", function () {
    expect(
      getObjectiveProgressLabel(2, 5),
    ).toBe(
      "Encore 3 candidatures pour atteindre votre objectif.",
    );
  });

  test("buildLastThirtyDaysActivity - Should build thirty days", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-12T12:00:00.000Z"),
    );

    const activity = buildLastThirtyDaysActivity(
      [
        {
          createdAt: "2026-07-12T08:00:00.000Z",
        },
      ],
      1,
    );

    expect(activity).toHaveLength(30);

    expect(
      activity[29],
    ).toEqual({
      date: "2026-07-12",
      day: 12,
      count: 1,
      progress: 100,
      reached: true,
    });
  });

  test("buildLastThirtyDaysActivity - Should start twenty-nine days earlier", function () {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date("2026-07-30T12:00:00.000Z"),
    );

    const activity = buildLastThirtyDaysActivity(
      [],
      5,
    );

    expect(
      activity[0].date,
    ).toBe("2026-07-01");

    expect(
      activity[29].date,
    ).toBe("2026-07-30");
  });

  test("getReachedDaysCount - Should count reached days", function () {
    expect(
      getReachedDaysCount([
        {
          reached: true,
        },
        {
          reached: false,
        },
        {
          reached: true,
        },
      ]),
    ).toBe(2);
  });

  test("getApplicationsCountFromActivity - Should sum applications", function () {
    expect(
      getApplicationsCountFromActivity([
        {
          count: 2,
        },
        {
          count: 3,
        },
      ]),
    ).toBe(5);
  });

  test("getBestDayCount - Should return highest count", function () {
    expect(
      getBestDayCount([
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

  test("getBestDayCount - Should return zero for empty activity", function () {
    expect(
      getBestDayCount([]),
    ).toBe(0);
  });

  test("normalizeAchievement - Should normalize explicit achievement", function () {
    expect(
      normalizeAchievement(
        {
          id: "achievement-id",
          key: "first_application",
          name: "Premier pas",
          description: "Créer une candidature.",
          unlocked: true,
          unlockedAt: "2026-07-12",
        },
        0,
        0,
      ),
    ).toEqual({
      id: "achievement-id",
      key: "first_application",
      name: "Premier pas",
      description: "Créer une candidature.",
      unlocked: true,
      unlockedAt: "2026-07-12",
    });
  });

  test("normalizeAchievement - Should support alternate properties", function () {
    expect(
      normalizeAchievement(
        {
          key: "custom",
          title: "Badge personnalisé",
          isUnlocked: true,
          unlocked_at: "2026-07-12",
        },
        0,
        0,
      ),
    ).toEqual({
      id: "custom",
      key: "custom",
      name: "Badge personnalisé",
      description: "Achievement lié à votre activité.",
      unlocked: true,
      unlockedAt: "2026-07-12",
    });
  });

  test("normalizeAchievement - Should use fallbacks", function () {
    expect(
      normalizeAchievement(
        {},
        0,
        0,
      ),
    ).toEqual({
      id: "achievement",
      key: "",
      name: "Badge",
      description: "Achievement lié à votre activité.",
      unlocked: false,
      unlockedAt: "",
    });
  });

  test("normalizeAchievement - Should compute first application", function () {
    expect(
      normalizeAchievement(
        {
          key: "first_application",
        },
        1,
        0,
      ).unlocked,
    ).toBe(true);
  });

  test("normalizeAchievement - Should compute ten applications", function () {
    expect(
      normalizeAchievement(
        {
          key: "ten_applications",
        },
        10,
        0,
      ).unlocked,
    ).toBe(true);
  });

  test("normalizeAchievement - Should compute fifty applications", function () {
    expect(
      normalizeAchievement(
        {
          key: "fifty_applications",
        },
        50,
        0,
      ).unlocked,
    ).toBe(true);
  });

  test("normalizeAchievement - Should compute reached daily goals", function () {
    expect(
      normalizeAchievement(
        {
          key: "five_daily_goals",
        },
        0,
        5,
      ).unlocked,
    ).toBe(true);
  });

  test("normalizeAchievement - Should preserve locked unknown achievement", function () {
    expect(
      normalizeAchievement(
        {
          key: "unknown",
        },
        100,
        100,
      ).unlocked,
    ).toBe(false);
  });

  test("normalizeAchievements - Should normalize provided achievements", function () {
    const achievements = normalizeAchievements(
      [
        {
          key: "first_application",
          name: "Premier pas",
        },
      ],
      1,
      0,
    );

    expect(achievements).toHaveLength(1);

    expect(
      achievements[0].unlocked,
    ).toBe(true);
  });

  test("normalizeAchievements - Should return default achievements", function () {
    const achievements = normalizeAchievements(
      [],
      10,
      5,
    );

    expect(achievements).toHaveLength(4);

    expect(
      achievements.map(function (achievement) {
        return achievement.key;
      }),
    ).toEqual([
      "first_application",
      "ten_applications",
      "fifty_applications",
      "five_daily_goals",
    ]);
  });

  test("normalizeAchievements - Should use defaults for invalid value", function () {
    expect(
      normalizeAchievements(
        null,
        0,
        0,
      ),
    ).toHaveLength(4);
  });
});
