import { afterEach, describe, expect, it } from "vitest";
import githubService from "../services/githubService";

describe("githubService", function () {
  const originalGithubToken = process.env.GITHUB_TOKEN;

  afterEach(function () {
    process.env.GITHUB_TOKEN = originalGithubToken;
  });

  it("returns false when a GitHub token is not configured", function () {
    delete process.env.GITHUB_TOKEN;

    expect(githubService.hasGithubToken()).toBe(false);
  });

  it("returns true when a GitHub token is configured", function () {
    process.env.GITHUB_TOKEN = "fake-token";

    expect(githubService.hasGithubToken()).toBe(true);
  });
});
