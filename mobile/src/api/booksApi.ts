import axiosClient from "./axiosClient";
import type { Book, CreateBookRequest, UpdateBookRequest } from "../types/book";

export const booksApi = {
  getAll: () => axiosClient.get<Book[]>("/books").then((res) => res.data),
  create: (data: CreateBookRequest) =>
    axiosClient.post<Book>("/books", data).then((res) => res.data),
  update: (id: number, data: UpdateBookRequest) => axiosClient.put(`/books/${id}`, data),
  remove: (id: number) => axiosClient.delete(`/books/${id}`),
};
