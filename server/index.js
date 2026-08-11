const express = require("express");
const repositories = require("./data/repositories.json");

const app = express();
const PORT = 4000;

app.get("/api/health", function (request, response) {
  response.json({
    status: "ok",
    service: "repo-pulse-api",
  });
});

app.get("/api/repositories", function (request, response) {
  response.json(repositories);
});

app.listen(PORT, function () {
  console.log(`RepoPulse API running at http://localhost:${PORT}`);
});
