import axiosClient from "./axiosClient";
import type { BorrowRecord, CreateBorrowRecordRequest } from "../types/borrowRecord";

export const borrowRecordsApi = {
  getAll: () => axiosClient.get<BorrowRecord[]>("/borrowrecords").then((res) => res.data),
  getMy: () => axiosClient.get<BorrowRecord[]>("/borrowrecords/my").then((res) => res.data),
  getById: (id: number) =>
    axiosClient.get<BorrowRecord>(`/borrowrecords/${id}`).then((res) => res.data),
  borrow: (data: CreateBorrowRecordRequest) =>
    axiosClient.post<BorrowRecord>("/borrowrecords", data).then((res) => res.data),
  returnCopy: (id: number) =>
    axiosClient.post<{ message: string }>(`/borrowrecords/${id}/return`).then((res) => res.data),
  renew: (id: number) => axiosClient.post<BorrowRecord>(`/borrowrecords/${id}/renew`).then((res) => res.data),
};
