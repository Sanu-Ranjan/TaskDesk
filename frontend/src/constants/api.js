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
};
