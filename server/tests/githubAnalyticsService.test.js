import { describe, expect, it } from "vitest";
import githubAnalyticsService from "../services/githubAnalyticsService";

describe("githubAnalyticsService", function () {
  it("calculates repository activity metrics", function () {
    const currentDate = new Date("2026-09-07T12:00:00Z");
    const openPullRequests = [
      { created_at: "2026-08-20T12:00:00Z" },
      { created_at: "2026-09-05T12:00:00Z" },
    ];
    const closedPullRequests = [
      {
        created_at: "2026-09-01T12:00:00Z",
        merged_at: "2026-09-03T12:00:00Z",
      },
      {
        created_at: "2026-08-25T12:00:00Z",
        merged_at: "2026-09-04T12:00:00Z",
      },
      {
        created_at: "2026-07-01T12:00:00Z",
        merged_at: "2026-08-01T12:00:00Z",
      },
    ];
    const commits = ["one", "two", "three"].map((sha) => ({
      sha,
      commit: { committer: { date: "2026-09-07T10:00:00Z" } },
    }));

    const analytics = githubAnalyticsService.buildRepositoryAnalytics(
      openPullRequests,
      closedPullRequests,
      commits,
      currentDate
    );

    expect(analytics).toEqual({
      openPullRequests: 2,
      stalePullRequests: 1,
      commitsLast30Days: 3,
      averageMergeTimeDays: 6,
      windowDays: 30,
      staleAfterDays: 7,
      dailyCommits: expect.any(Array),
      commitActivityMayBeIncomplete: false,
      commitFetchLimit: 100,
      healthScore: 75,
      recommendations: [
        {
          priority: "high",
          title: "Review stale pull requests",
          message: "1 pull request has been open longer than 7 days.",
        },
        {
          priority: "medium",
          title: "Reduce pull request merge time",
          message: "Pull requests take an average of 6 days to merge.",
        },
        {
          priority: "medium",
          title: "Increase repository activity",
          message: "Only 3 commits were made during the last 30 days.",
        },
      ],
    });
  });

  it("fills 30 UTC days, groups timezone offsets, and excludes invalid or out-of-window dates", function () {
    const commits = [
      "2026-08-09T00:00:00Z",
      "2026-09-06T23:30:00-01:00",
      "2026-09-07T11:00:00Z",
      "2026-08-08T23:59:59Z",
      "2026-09-07T13:00:00Z",
      "invalid",
    ].map((date) => ({ commit: { committer: { date } } }));
    commits.push({ sha: "missing-date" });
    const days = githubAnalyticsService.buildDailyCommits(
      commits, new Date("2026-09-07T12:00:00Z")
    );

    expect(days).toHaveLength(30);
    expect(days[0]).toEqual({ date: "2026-08-09", count: 1 });
    expect(days[1]).toEqual({ date: "2026-08-10", count: 0 });
    expect(days[29]).toEqual({ date: "2026-09-07", count: 2 });
    expect(days.reduce((total, day) => total + day.count, 0)).toBe(3);
  });

  it("keeps zero days across leap day and year boundaries", function () {
    const leapDays = githubAnalyticsService.buildDailyCommits([], new Date("2024-03-01T12:00:00Z"));
    expect(leapDays).toContainEqual({ date: "2024-02-29", count: 0 });
    const yearDays = githubAnalyticsService.buildDailyCommits([], new Date("2026-01-02T12:00:00Z"));
    expect(yearDays[0]).toEqual({ date: "2025-12-04", count: 0 });
    expect(yearDays[29]).toEqual({ date: "2026-01-02", count: 0 });
  });

  it("marks activity as potentially incomplete when the fetch limit is reached", function () {
    const commits = Array.from({ length: 100 }, () => ({
      commit: { committer: { date: "2026-09-07T10:00:00Z" } },
    }));
    const analytics = githubAnalyticsService.buildRepositoryAnalytics(
      [], [], commits, new Date("2026-09-07T12:00:00Z")
    );
    expect(analytics.commitActivityMayBeIncomplete).toBe(true);
    expect(analytics.commitsLast30Days).toBe(100);
    expect(analytics.dailyCommits[29].count).toBe(100);
  });

  it("deducts points for stale pull requests", function () {
    const scoreWithTwoStalePullRequests =
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 2,
      });

    const scoreWithManyStalePullRequests =
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 20,
      });

    expect(scoreWithTwoStalePullRequests).toBe(90);
    expect(scoreWithManyStalePullRequests).toBe(70);
  });

  it("deducts points for slow merge times", function () {
    expect(
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 0,
        averageMergeTimeDays: 3,
      })
    ).toBe(100);

    expect(
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 0,
        averageMergeTimeDays: 5,
      })
    ).toBe(90);

    expect(
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 0,
        averageMergeTimeDays: 8,
      })
    ).toBe(80);

    expect(
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 0,
        averageMergeTimeDays: null,
      })
    ).toBe(100);
  });

  it("deducts points for low commit activity", function () {
    expect(
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 0,
        averageMergeTimeDays: null,
        commitsLast30Days: 0,
      })
    ).toBe(80);

    expect(
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 0,
        averageMergeTimeDays: null,
        commitsLast30Days: 3,
      })
    ).toBe(90);

    expect(
      githubAnalyticsService.calculateHealthScore({
        stalePullRequests: 0,
        averageMergeTimeDays: null,
        commitsLast30Days: 10,
      })
    ).toBe(100);
  });

  it("combines all health score penalties", function () {
    const score = githubAnalyticsService.calculateHealthScore({
      openPullRequests: 25,
      stalePullRequests: 2,
      commitsLast30Days: 0,
      averageMergeTimeDays: 8,
    });

    expect(score).toBe(40);
  });

  it("recommends reviewing stale pull requests", function () {
    const recommendations = githubAnalyticsService.buildRecommendations({
      stalePullRequests: 2,
      staleAfterDays: 7,
    });

    expect(recommendations).toEqual([
      {
        priority: "high",
        title: "Review stale pull requests",
        message: "2 pull requests have been open longer than 7 days.",
      },
    ]);
  });

  it("recommends reducing slow merge times", function () {
    const mediumPriorityRecommendations =
      githubAnalyticsService.buildRecommendations({
        stalePullRequests: 0,
        averageMergeTimeDays: 5,
      });

    const highPriorityRecommendations =
      githubAnalyticsService.buildRecommendations({
        stalePullRequests: 0,
        averageMergeTimeDays: 8,
      });

    expect(mediumPriorityRecommendations).toEqual([
      {
        priority: "medium",
        title: "Reduce pull request merge time",
        message: "Pull requests take an average of 5 days to merge.",
      },
    ]);

    expect(highPriorityRecommendations).toEqual([
      {
        priority: "high",
        title: "Reduce pull request merge time",
        message: "Pull requests take an average of 8 days to merge.",
      },
    ]);
  });

  it("recommends increasing low repository activity", function () {
    const noCommitRecommendations =
      githubAnalyticsService.buildRecommendations({
        stalePullRequests: 0,
        averageMergeTimeDays: null,
        commitsLast30Days: 0,
        windowDays: 30,
      });

    const lowCommitRecommendations =
      githubAnalyticsService.buildRecommendations({
        stalePullRequests: 0,
        averageMergeTimeDays: null,
        commitsLast30Days: 3,
        windowDays: 30,
      });

    expect(noCommitRecommendations).toEqual([
      {
        priority: "high",
        title: "Increase repository activity",
        message: "No commits were made during the last 30 days.",
      },
    ]);

    expect(lowCommitRecommendations).toEqual([
      {
        priority: "medium",
        title: "Increase repository activity",
        message: "Only 3 commits were made during the last 30 days.",
      },
    ]);
  });

  it("recommends reducing a large pull request backlog", function () {
    const recommendationsAtLimit =
      githubAnalyticsService.buildRecommendations({
        openPullRequests: 20,
        stalePullRequests: 0,
        averageMergeTimeDays: null,
        commitsLast30Days: 10,
        windowDays: 30,
      });

    const recommendationsOverLimit =
      githubAnalyticsService.buildRecommendations({
        openPullRequests: 21,
        stalePullRequests: 0,
        averageMergeTimeDays: null,
        commitsLast30Days: 10,
        windowDays: 30,
      });

    expect(recommendationsAtLimit).toEqual([]);

    expect(recommendationsOverLimit).toEqual([
      {
        priority: "medium",
        title: "Reduce the pull request backlog",
        message: "21 pull requests are currently open.",
      },
    ]);
  });
});
