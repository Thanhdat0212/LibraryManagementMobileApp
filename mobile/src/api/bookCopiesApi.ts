import axiosClient from "./axiosClient";
import type { BookCopy, CreateBookCopyRequest, UpdateBookCopyRequest } from "../types/bookCopy";

export const bookCopiesApi = {
  getAll: () => axiosClient.get<BookCopy[]>("/bookcopies").then((res) => res.data),

  create: (data: CreateBookCopyRequest) =>
    axiosClient.post<BookCopy>("/bookcopies", data).then((res) => res.data),

  update: (id: number, data: UpdateBookCopyRequest) => axiosClient.put(`/bookcopies/${id}`, data),

  remove: (id: number) => axiosClient.delete(`/bookcopies/${id}`),
};
