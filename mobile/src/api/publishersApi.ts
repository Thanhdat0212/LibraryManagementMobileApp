import axiosClient from "./axiosClient";
import type { Publisher } from "../types/publisher";

export interface PublisherRequest {
  name: string;
  address?: string | null;
  phone?: string | null;
}

export const publishersApi = {
  getAll: () => axiosClient.get<Publisher[]>("/publishers").then((res) => res.data),

  create: (data: PublisherRequest) =>
    axiosClient.post<Publisher>("/publishers", data).then((res) => res.data),

  update: (id: number, data: PublisherRequest) => axiosClient.put(`/publishers/${id}`, data),

  remove: (id: number) => axiosClient.delete(`/publishers/${id}`),
};
