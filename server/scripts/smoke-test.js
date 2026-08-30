const BASE_URL = "http://localhost:4000";
const REQUEST_TIMEOUT_MS = 5000;

const checks = [
  {
    name: "root route",
    path: "/",
    expectedStatus: 200,
    validate: function (data) {
      return (
        data.service === "RepoPulse API" &&
        data.status === "running" &&
        Array.isArray(data.endpoints)
      );
    },
  },
  {
    name: "health route",
    path: "/api/health",
    expectedStatus: 200,
    validate: function (data) {
      return data.status === "ok";
    },
  },
  {
    name: "repository detail route",
    path: "/api/repositories/shopfront",
    expectedStatus: 200,
    validate: function (data) {
      return (
        Array.isArray(data.metrics) &&
        Array.isArray(data.pullRequests) &&
        Array.isArray(data.activity)
      );
    },
  },
  {
    name: "repository summary route",
    path: "/api/repositories/shopfront/summary",
    expectedStatus: 200,
    validate: function (data) {
      return (
        data.id === "shopfront" &&
        data.openPullRequests !== undefined &&
        data.commits !== undefined &&
        data.healthScore !== undefined
      );
    },
  },
  {
    name: "missing repository route",
    path: "/api/repositories/not-real",
    expectedStatus: 404,
    validate: function (data) {
      return (
        data.error === "Repository not found" &&
        Array.isArray(data.availableRepositories)
      );
    },
  },
];

async function checkEndpoint(check) {
  const response = await fetch(`${BASE_URL}${check.path}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status !== check.expectedStatus) {
    throw new Error(
      `${check.name} expected status ${check.expectedStatus} but received ${response.status}`
    );
  }

  const data = await response.json();

  if (!check.validate(data)) {
    throw new Error(`${check.name} returned unexpected data`);
  }

  console.log(`PASS ${check.name}`);
}

async function runSmokeTest() {
  console.log("Running RepoPulse API smoke test...");

  for (const check of checks) {
    await checkEndpoint(check);
  }

  console.log("All smoke tests passed.");
}

runSmokeTest().catch(function (error) {
  console.error("Smoke test failed.");
  console.error("Make sure the backend is running with npm run dev.");
  console.error(error.message);
  process.exit(1);
});
