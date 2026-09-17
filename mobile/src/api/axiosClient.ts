import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
});

// Tự động gắn "Authorization: Bearer <token>" vào mọi request nếu đã đăng nhập.
axiosClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// AuthProvider đăng ký handler này để tự logout khi token hết hạn/không hợp lệ.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Lấy message lỗi thân thiện từ response của ExceptionMiddleware backend. */
export function getErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (!error.response) {
      return "Không thể kết nối tới máy chủ. Kiểm tra điện thoại và máy tính cùng mạng Wi-Fi, và địa chỉ IP trong file .env còn đúng không.";
    }
  }
  return fallback;
}

export default axiosClient;
