import axiosClient from "./axiosClient";
import type { Category } from "../types/category";

export interface CategoryRequest {
  name: string;
  description?: string | null;
}

export const categoriesApi = {
  getAll: () => axiosClient.get<Category[]>("/categories").then((res) => res.data),

  create: (data: CategoryRequest) =>
    axiosClient.post<Category>("/categories", data).then((res) => res.data),

  update: (id: number, data: CategoryRequest) => axiosClient.put(`/categories/${id}`, data),

  remove: (id: number) => axiosClient.delete(`/categories/${id}`),
};
