import axiosClient from "./axiosClient";
import type { CreatePublisherRequest, Publisher, UpdatePublisherRequest } from "../types/publisher";

export const publishersApi = {
  getAll: () => axiosClient.get<Publisher[]>("/publishers").then((res) => res.data),
  getById: (id: number) => axiosClient.get<Publisher>(`/publishers/${id}`).then((res) => res.data),
  create: (data: CreatePublisherRequest) =>
    axiosClient.post<Publisher>("/publishers", data).then((res) => res.data),
  update: (id: number, data: UpdatePublisherRequest) =>
    axiosClient.put(`/publishers/${id}`, data),
  remove: (id: number) => axiosClient.delete(`/publishers/${id}`),
};
