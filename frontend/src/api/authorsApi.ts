import axiosClient from "./axiosClient";
import type { Author, CreateAuthorRequest, UpdateAuthorRequest } from "../types/author";

export const authorsApi = {
  getAll: () => axiosClient.get<Author[]>("/authors").then((res) => res.data),
  getById: (id: number) => axiosClient.get<Author>(`/authors/${id}`).then((res) => res.data),
  create: (data: CreateAuthorRequest) =>
    axiosClient.post<Author>("/authors", data).then((res) => res.data),
  update: (id: number, data: UpdateAuthorRequest) =>
    axiosClient.put(`/authors/${id}`, data),
  remove: (id: number) => axiosClient.delete(`/authors/${id}`),
};
