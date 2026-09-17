import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import { setUnauthorizedHandler } from "../api/axiosClient";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

const STORAGE_KEY = "auth";

interface AuthContextValue {
  user: AuthResponse | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as AuthResponse);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);

    setUnauthorizedHandler(() => {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("token");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  function persist(result: AuthResponse) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    localStorage.setItem("token", result.token);
    setUser(result);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: (data) => authApi.login(data).then(persist),
      register: (data) => authApi.register(data).then(persist),
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("token");
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
