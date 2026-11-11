import { createRequire } from "node:module";
import { vi } from "vitest";

const database = createRequire(import.meta.url)("../../db/pool");

export function mockUserDatabase() {
  return vi.spyOn(database, "query").mockImplementation(async (_text, values) => ({
    rows: [{ id: "00000000-0000-4000-8000-000000000001", github_id: String(values[1]), github_login: values[2], display_name: values[3] }],
  }));
}
