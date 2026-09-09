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
    const commits = [{ sha: "one" }, { sha: "two" }, { sha: "three" }];

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
    });
  });
});
