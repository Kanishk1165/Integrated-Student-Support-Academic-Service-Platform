import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers?.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login:    (data) => api.post("/auth/login", data),
  syncSupabaseSession: (accessToken) => api.post("/auth/supabase-sync", null, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }),
  getMe:    ()     => api.get("/auth/me"),
  updatePassword: (data) => api.patch("/auth/update-password", data),
};

// ── Queries ───────────────────────────────────────────────────────────────────
export const queryAPI = {
  getAll:      (params) => api.get("/queries", { params }),
  getById:     (id)     => api.get(`/queries/${id}`),
  create:      (data)   => api.post("/queries", data),
  updateStatus:(id, data) => api.patch(`/queries/${id}/status`, data),
  respond:     (id, data) => api.post(`/queries/${id}/respond`, data),
  delete:      (id)     => api.delete(`/queries/${id}`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:   ()     => api.get("/users/profile"),
  updateProfile:(data) => api.patch("/users/profile", data),
  getAll:       (params) => api.get("/users", { params }),
  toggleActive: (id)   => api.patch(`/users/${id}/toggle-active`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getOverview:    () => api.get("/analytics/overview"),
  getByCategory:  () => api.get("/analytics/by-category"),
  getResponseTime:() => api.get("/analytics/response-time"),
  getMonthly:     () => api.get("/analytics/monthly"),
};

// ── Departments ───────────────────────────────────────────────────────────────
export const departmentAPI = {
  getAll:  ()     => api.get("/departments"),
  create:  (data) => api.post("/departments", data),
  update:  (id, data) => api.patch(`/departments/${id}`, data),
  remove:  (id)   => api.delete(`/departments/${id}`),
};

export default api;
