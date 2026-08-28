const express = require("express");
const repositoriesRouter = require("./routes/repositories");

const app = express();
const PORT = 4000;

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
