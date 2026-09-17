import axiosClient from "./axiosClient";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types/category";

export const categoriesApi = {
  getAll: () => axiosClient.get<Category[]>("/categories").then((res) => res.data),
  getById: (id: number) => axiosClient.get<Category>(`/categories/${id}`).then((res) => res.data),
  create: (data: CreateCategoryRequest) =>
    axiosClient.post<Category>("/categories", data).then((res) => res.data),
  update: (id: number, data: UpdateCategoryRequest) =>
    axiosClient.put(`/categories/${id}`, data),
  remove: (id: number) => axiosClient.delete(`/categories/${id}`),
};
