import axiosClient from "./axiosClient";
import type { BorrowRecord, CreateBorrowRecordRequest } from "../types/borrowRecord";

export const borrowRecordsApi = {
  getAll: () => axiosClient.get<BorrowRecord[]>("/borrowrecords").then((res) => res.data),

  getMy: () => axiosClient.get<BorrowRecord[]>("/borrowrecords/my").then((res) => res.data),

  borrow: (data: CreateBorrowRecordRequest) =>
    axiosClient.post<BorrowRecord>("/borrowrecords", data).then((res) => res.data),

  return: (id: number) => axiosClient.post(`/borrowrecords/${id}/return`),
};
