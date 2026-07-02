export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:8080/api/v1';

export const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});
