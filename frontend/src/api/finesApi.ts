import axiosClient from "./axiosClient";
import type { Fine, FineStatus } from "../types/fine";

export const finesApi = {
  getAll: (status?: FineStatus) =>
    axiosClient.get<Fine[]>("/fines", { params: { status } }).then((res) => res.data),
  getMy: () => axiosClient.get<Fine[]>("/fines/my").then((res) => res.data),
  pay: (id: number) => axiosClient.post<Fine>(`/fines/${id}/pay`).then((res) => res.data),
  waive: (id: number) => axiosClient.post<Fine>(`/fines/${id}/waive`).then((res) => res.data),
};
