const ROUTE_END = {
  auth: {
    signup: "/signup",
    login: "/login",
    me: "/me",
    logout: "/logout",
  },
  tasks: {
    add: "/",
    getAll: "/",
    update: "/:id",
    delete: "/:id",
  },
  teams: {
    add: "/",
    getAll: "/",
    getOne: "/:id",
    update: "/:id",
    delete: "/:id",
  },
  projects: {
    add: "/",
    getAll: "/",
    getOne: "/:id",
    update: "/:id",
    delete: "/:id",
  },
  tags: {
    add: "/",
    getAll: "/",
  },
  reports: {
    lastWeek: "/last-week",
    pending: "/pending",
    closedTasks: "/closed-tasks",
  },
};

module.exports = {
  ROUTE_END,
};
