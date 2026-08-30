const express = require("express");
const repositoriesRouter = require("./routes/repositories");

const app = express();
const PORT = 4000;

app.get("/", function (request, response) {
  response.json({
    service: "RepoPulse API",
    status: "running",
    endpoints: [
      "/api/health",
      "/api/repositories",
      "/api/repositories/:repositoryId",
      "/api/repositories/:repositoryId/summary",
    ],
  });
});

app.get("/api/health", function (request, response) {
  response.json({
    status: "ok",
    service: "repo-pulse-api",
  });
});

app.use("/api/repositories", repositoriesRouter);

app.listen(PORT, function () {
  console.log(`RepoPulse API running at http://localhost:${PORT}`);
});
