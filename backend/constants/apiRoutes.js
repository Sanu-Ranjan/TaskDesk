const BASE_PATH = "/api";
const VERSION = "v1";

const homePath = `${BASE_PATH}/${VERSION}`;

const API_ROUTES = {
  home: `${homePath}`,
  auth: `${homePath}/auth`,
  tasks: `${homePath}/tasks`,
  teams: `${homePath}/teams`,
  projects: `${homePath}/projects`,
  tags: `${homePath}/tags`,
  reports: `${homePath}/report`,
  users: `${homePath}/users`,
};

module.exports = { API_ROUTES };
