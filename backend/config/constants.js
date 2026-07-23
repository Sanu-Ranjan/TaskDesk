const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    ME: "/auth/me",
  },
  TASKS: {
    BASE: "/tasks",
    BY_ID: (id) => `/tasks/${id}`,
  },
  TEAMS: {
    BASE: "/teams",
  },
  PROJECTS: {
    BASE: "/projects",
  },
  TAGS: {
    BASE: "/tags",
  },
  REPORTS: {
    LAST_WEEK: "/report/last-week",
    PENDING: "/report/pending",
    CLOSED_TASKS: "/report/closed-tasks",
  },
};

module.exports = {
  TASK_STATUS: ["To Do", "In Progress", "Completed", "Blocked"],
  DEFAULT_TASK_STATUS: "To Do",
  JWT_EXPIRES_IN: "7d",
  SALT_ROUNDS: 10,
  DEFAULT_PORT: 5000,
  API_ENDPOINTS,
};
