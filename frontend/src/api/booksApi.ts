import axiosClient from "./axiosClient";
import type { Book, BookQuery, CreateBookRequest, UpdateBookRequest } from "../types/book";
import type { PagedResult } from "../types/common";

export const booksApi = {
  getAll: (query: BookQuery = {}) =>
    axiosClient.get<PagedResult<Book>>("/books", { params: query }).then((res) => res.data),
  getById: (id: number) => axiosClient.get<Book>(`/books/${id}`).then((res) => res.data),
  create: (data: CreateBookRequest) => axiosClient.post<Book>("/books", data).then((res) => res.data),
  update: (id: number, data: UpdateBookRequest) => axiosClient.put(`/books/${id}`, data),
  remove: (id: number) => axiosClient.delete(`/books/${id}`),
};
