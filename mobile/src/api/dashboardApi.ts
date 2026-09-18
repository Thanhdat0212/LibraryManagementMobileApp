import axiosClient from "./axiosClient";
import type { DashboardSummary } from "../types/dashboard";

export const dashboardApi = {
  getSummary: () => axiosClient.get<DashboardSummary>("/dashboard/summary").then((res) => res.data),
};
