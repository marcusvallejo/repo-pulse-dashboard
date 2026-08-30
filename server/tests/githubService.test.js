import { describe, expect, it } from "vitest";
import githubService from "../services/githubService";

describe("githubService", function () {
  it("checks whether a GitHub token is configured", function () {
    expect(githubService.hasGithubToken()).toEqual(expect.any(Boolean));
  });
});