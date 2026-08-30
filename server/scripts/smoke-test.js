const BASE_URL = "http://localhost:4000";
const REQUEST_TIMEOUT_MS = 5000;

const checks = [
  {
    name: "health route",
    path: "/api/health",
    validate: function (data) {
      return data.status === "ok";
    },
  },
  {
    name: "repository detail route",
    path: "/api/repositories/shopfront",
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
    validate: function (data) {
      return (
        data.id === "shopfront" &&
        data.openPullRequests !== undefined &&
        data.commits !== undefined &&
        data.healthScore !== undefined
      );
    },
  },
];

async function checkEndpoint(check) {
  const response = await fetch(`${BASE_URL}${check.path}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`${check.name} failed with status ${response.status}`);
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
