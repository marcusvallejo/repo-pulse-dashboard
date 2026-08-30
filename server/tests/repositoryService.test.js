import { describe, expect, it } from "vitest";
import repositoryService from "../services/repositoryService";

describe("repositoryService", function () {
  it("returns available repository ids", function () {
    expect(repositoryService.getAvailableRepositoryIds()).toEqual([
      "shopfront",
      "api-service",
      "mobile-app",
    ]);
  });

  it("returns a repository by id", function () {
    const repository = repositoryService.getRepositoryById("shopfront");

    expect(repository.metrics).toEqual(expect.any(Array));
    expect(repository.pullRequests).toEqual(expect.any(Array));
    expect(repository.activity).toEqual(expect.any(Array));
  });

  it("returns a repository summary", function () {
    expect(repositoryService.getRepositorySummary("shopfront")).toEqual({
      id: "shopfront",
      openPullRequests: "18",
      commits: "146",
      healthScore: "82",
    });
  });
});
