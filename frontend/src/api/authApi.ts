import axiosClient from "./axiosClient";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    axiosClient.post<AuthResponse>("/auth/login", data).then((res) => res.data),

  register: (data: RegisterRequest) =>
    axiosClient.post<AuthResponse>("/auth/register", data).then((res) => res.data),
};
