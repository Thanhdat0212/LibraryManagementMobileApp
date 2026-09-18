import axiosClient from "./axiosClient";
import type { BorrowRequest, BorrowRequestStatus, CreateBorrowRequestRequest } from "../types/borrowRequest";

export const borrowRequestsApi = {
  getAll: (status?: BorrowRequestStatus) =>
    axiosClient.get<BorrowRequest[]>("/borrowrequests", { params: { status } }).then((res) => res.data),
  getMy: () => axiosClient.get<BorrowRequest[]>("/borrowrequests/my").then((res) => res.data),
  create: (data: CreateBorrowRequestRequest) =>
    axiosClient.post<BorrowRequest>("/borrowrequests", data).then((res) => res.data),
  approve: (id: number) => axiosClient.post<BorrowRequest>(`/borrowrequests/${id}/approve`).then((res) => res.data),
  reject: (id: number, reason?: string) =>
    axiosClient.post<BorrowRequest>(`/borrowrequests/${id}/reject`, { reason }).then((res) => res.data),
  cancel: (id: number) => axiosClient.post<BorrowRequest>(`/borrowrequests/${id}/cancel`).then((res) => res.data),
};
