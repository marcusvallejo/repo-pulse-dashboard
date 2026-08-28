const BASE_URL = "http://localhost:4000";
const REQUEST_TIMEOUT_MS = 5000;

const checks = [
  {
    name: "health route",
    path: "/api/health",
  },
  {
    name: "repository detail route",
    path: "/api/repositories/shopfront",
  },
  {
    name: "repository summary route",
    path: "/api/repositories/shopfront/summary",
  },
];

async function checkEndpoint(check) {
  const controller = new AbortController();
  const timeout = setTimeout(function () {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const response = await fetch(`${BASE_URL}${check.path}`, {
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`${check.name} failed with status ${response.status}`);
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
