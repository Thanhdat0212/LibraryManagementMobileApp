import axiosClient from "./axiosClient";
import type { LibraryUser } from "../types/user";

export const usersApi = {
  getAll: () => axiosClient.get<LibraryUser[]>("/users").then((res) => res.data),
  lock: (id: number) => axiosClient.put(`/users/${id}/lock`),
  unlock: (id: number) => axiosClient.put(`/users/${id}/unlock`),
};
