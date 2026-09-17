import axiosClient from "./axiosClient";
import type { User } from "../types/user";

export const usersApi = {
  getAll: () => axiosClient.get<User[]>("/users").then((res) => res.data),
};
