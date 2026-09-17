import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/authApi";
import { setUnauthorizedHandler } from "../api/axiosClient";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

const STORAGE_KEY = "auth";

interface AuthContextValue {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setUser(JSON.parse(raw) as AuthResponse);
      })
      .finally(() => setIsLoading(false));

    setUnauthorizedHandler(() => {
      setUser(null);
      AsyncStorage.multiRemove([STORAGE_KEY, "token"]).catch(() => {});
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  async function persist(result: AuthResponse) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    await AsyncStorage.setItem("token", result.token);
    setUser(result);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: (data) => authApi.login(data).then(persist),
      register: (data) => authApi.register(data).then(persist),
      logout: async () => {
        await AsyncStorage.multiRemove([STORAGE_KEY, "token"]);
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}
