import axiosClient from "./axiosClient";
import type { LibraryUser } from "../types/user";

export const usersApi = {
  getAll: () => axiosClient.get<LibraryUser[]>("/users").then((res) => res.data),
};
