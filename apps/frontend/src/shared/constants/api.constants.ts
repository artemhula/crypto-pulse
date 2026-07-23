export const API_URL = import.meta.env.API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    LOGOUT: `${API_URL}/auth/logout`,
    ME: `${API_URL}/auth/me`,
    GOOGLE_CALLBACK: `${API_URL}/auth/google/callback`,
  },
};
