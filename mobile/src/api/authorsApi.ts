import axiosClient from "./axiosClient";
import type { Author } from "../types/author";

export interface AuthorRequest {
  fullName: string;
  bio?: string | null;
  nationality?: string | null;
}

export const authorsApi = {
  getAll: () => axiosClient.get<Author[]>("/authors").then((res) => res.data),

  create: (data: AuthorRequest) => axiosClient.post<Author>("/authors", data).then((res) => res.data),

  update: (id: number, data: AuthorRequest) => axiosClient.put(`/authors/${id}`, data),

  remove: (id: number) => axiosClient.delete(`/authors/${id}`),
};
