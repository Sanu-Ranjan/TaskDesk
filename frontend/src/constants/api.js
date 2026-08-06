export const API_BASE = "/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE}/auth/signup`,
    LOGIN: `${API_BASE}/auth/login`,
    ME: `${API_BASE}/auth/me`,
    LOGOUT: `${API_BASE}/auth/logout`,
  },
  PROJECTS: {
    BASE: `${API_BASE}/projects`,
  },
  TASKS: {
    BASE: `${API_BASE}/tasks`,
  },
  TEAM: {
    CREATE_TEAM: `${API_BASE}/teams`,
    GET_TEAMS: `${API_BASE}/teams`,
    GET_TEAM_BY_ID: (id) => `${API_BASE}/teams/${id}`,
    UPDATE_TEAM: (id) => `${API_BASE}/teams/${id}`,
    DELETE_TEAM: (id) => `${API_BASE}/teams/${id}`,
    ADD_MEMBER: (id) => `${API_BASE}/teams/${id}/members`,
    REMOVE_MEMBER: (id, userId) => `${API_BASE}/teams/${id}/members/${userId}`,
  },
  USERS: {
    GET_ALL: `${API_BASE}/users`,
  },
};
