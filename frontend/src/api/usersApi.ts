import axiosClient from "./axiosClient";
import type { User } from "../types/user";

export const usersApi = {
  getAll: () => axiosClient.get<User[]>("/users").then((res) => res.data),
  lock: (id: number) => axiosClient.put(`/users/${id}/lock`),
  unlock: (id: number) => axiosClient.put(`/users/${id}/unlock`),
  changeRole: (id: number, role: string) => axiosClient.put(`/users/${id}/role`, { role }),
};
