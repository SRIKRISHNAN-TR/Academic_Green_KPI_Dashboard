import { apiClient } from "./apiClient";

// Types
export interface MetricData {
  _id: string;
  metric: "ENERGY" | "WATER" | "WASTE";
  month: string;
  year: number;
  actual: number;
  target: number;
  unit: string;
  source?: string;
  location?: string;
  status: "GREEN" | "YELLOW" | "RED";
  createdAt: string;
}

export interface MetricInput {
  month: string;
  year: number;
  actual: number;
  target: number;
  unit: string;
  source?: string;
  location?: string;
  status: "GREEN" | "YELLOW" | "RED";
}

export interface Target {
  _id: string;
  metric: "ENERGY" | "WATER" | "WASTE";
  year: number;
  targetValue: number;
  unit: string;
  location?: string;
}

export interface TargetInput {
  metric: "ENERGY" | "WATER" | "WASTE";
  year: number;
  targetValue: number;
  unit: string;
  location?: string;
}

export interface KpiSnapshot {
  _id: string;
  metric: "ENERGY" | "WATER" | "WASTE";
  month: string;
  year: number;
  actual: number;
  target: number;
  status: "GREEN" | "YELLOW" | "RED";
  location?: string;
  generatedAt: string;
}

export interface DashboardSummary {
  month: string;
  year: number;
  energy: MetricSummary;
  water: MetricSummary;
  waste: MetricSummary;
}

export interface MetricSummary {
  metric: string;
  mtd: { actual: number; target: number; status: string; unit: string } | null;
  ytd: { actual: number; target: number; status: string };
}

export interface HighestUsageData {
  energy: Array<{ _id: string; totalActual: number; totalTarget: number; count: number }>;
  water: Array<{ _id: string; totalActual: number; totalTarget: number; count: number }>;
  waste: Array<{ _id: string; avgActual: number; avgTarget: number; count: number }>;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: "admin" | "data-entry" | "user";
  };
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", { email, password }),
  signup: (username: string, email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/signup", { username, email, password }),
  forgotPassword: (email: string) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", { email }),
};

// Users (admin)
export interface UserData {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "data-entry" | "user";
  createdAt: string;
}

export const userApi = {
  getAll: () => apiClient.get<UserData[]>("/users"),
  updateRole: (id: string, role: string) => apiClient.put<UserData>(`/users/${id}/role`, { role }),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/users/${id}`),
};

// Notifications
export interface NotificationData {
  _id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  kpi?: string;
  location?: string;
  actualValue?: number;
  targetValue?: number;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  getAll: (params?: { read?: string }) => {
    const query = new URLSearchParams();
    if (params?.read !== undefined) query.set("read", params.read);
    const qs = query.toString();
    return apiClient.get<NotificationData[]>(`/notifications${qs ? `?${qs}` : ""}`);
  },
  getUnreadCount: () => apiClient.get<{ count: number }>("/notifications/unread-count"),
  markAsRead: (id: string) => apiClient.put<NotificationData>(`/notifications/${id}/read`, {}),
  markAllAsRead: () => apiClient.put<{ message: string }>("/notifications/read-all", {}),
};

// Metric CRUD factory
const createMetricApi = (resource: string) => ({
  getAll: (params?: { year?: number; month?: string; location?: string }) => {
    const query = new URLSearchParams();
    if (params?.year) query.set("year", String(params.year));
    if (params?.month) query.set("month", params.month);
    if (params?.location) query.set("location", params.location);
    const qs = query.toString();
    return apiClient.get<MetricData[]>(`/${resource}${qs ? `?${qs}` : ""}`);
  },
  getById: (id: string) => apiClient.get<MetricData>(`/${resource}/${id}`),
  create: (data: MetricInput) => apiClient.post<MetricData>(`/${resource}`, data),
  update: (id: string, data: Partial<MetricInput>) => apiClient.put<MetricData>(`/${resource}/${id}`, data),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/${resource}/${id}`),
});

export const energyApi = createMetricApi("energy");
export const waterApi = createMetricApi("water");
export const wasteApi = createMetricApi("waste");

// Targets
export const targetApi = {
  getAll: (params?: { year?: number; metric?: string; location?: string }) => {
    const query = new URLSearchParams();
    if (params?.year) query.set("year", String(params.year));
    if (params?.metric) query.set("metric", params.metric);
    if (params?.location) query.set("location", params.location);
    const qs = query.toString();
    return apiClient.get<Target[]>(`/targets${qs ? `?${qs}` : ""}`);
  },
  create: (data: TargetInput) => apiClient.post<Target>("/targets", data),
  update: (id: string, data: Partial<TargetInput>) => apiClient.put<Target>(`/targets/${id}`, data),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/targets/${id}`),
};

// Dashboard
export const dashboardApi = {
  getSummary: (params?: { month?: string; year?: number; location?: string }) => {
    const query = new URLSearchParams();
    if (params?.month) query.set("month", params.month);
    if (params?.year) query.set("year", String(params.year));
    if (params?.location) query.set("location", params.location);
    const qs = query.toString();
    return apiClient.get<DashboardSummary>(`/dashboard/summary${qs ? `?${qs}` : ""}`);
  },
  getHighestUsage: (params?: { year?: number }) => {
    const query = new URLSearchParams();
    if (params?.year) query.set("year", String(params.year));
    const qs = query.toString();
    return apiClient.get<HighestUsageData>(`/dashboard/highest-usage${qs ? `?${qs}` : ""}`);
  },
  generateSnapshot: (month: string, year: number) =>
    apiClient.post<KpiSnapshot[]>("/dashboard/snapshot", { month, year }),
  getSnapshots: (params?: { year?: number; metric?: string }) => {
    const query = new URLSearchParams();
    if (params?.year) query.set("year", String(params.year));
    if (params?.metric) query.set("metric", params.metric);
    const qs = query.toString();
    return apiClient.get<KpiSnapshot[]>(`/dashboard/snapshots${qs ? `?${qs}` : ""}`);
  },
};