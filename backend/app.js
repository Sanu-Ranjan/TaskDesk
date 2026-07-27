const express = require("express");
//const cors = require("cors");
const cookieParser = require("cookie-parser");

const { API_ROUTES } = require("./constants/apiRoutes");
const tasks = require("./routes/tasks.route");
const auth = require("./routes/auth.route");
const teams = require("./routes/teams.route");
// const projects = require("./routes/projects.route");
// const tags = require("./routes/tags.route");
// const reports = require("./routes/reports.route");
const app = express();

app.use(cookieParser());
app.use(express.json());

app.get(API_ROUTES.home, (req, res) => {
  res.send("Welcome to Workasana Api");
});

app.use(API_ROUTES.auth, auth.router);
app.use(API_ROUTES.tasks, tasks.router);
app.use(API_ROUTES.teams, teams.router);
// app.use(API_ROUTES.projects, projects.router);
// app.use(API_ROUTES.tags, tags.router);
// app.use(API_ROUTES.reports, reports.router);

module.exports = { app };
