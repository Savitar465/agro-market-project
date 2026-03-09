"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type React from "react";
import { loginRequest } from "@/lib/services/auth-http";

type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    setToken(storedToken);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
      }
    }

    setIsAuthLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest({ username: email, password });

    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    setToken(result.accessToken);

    // if (result.user) {
    //   localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
    //   setUser(result.user);
    // } else {
    //   localStorage.removeItem(AUTH_USER_KEY);
    //   setUser(null);
    // }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      isAuthLoading,
      user,
      login,
      logout,
    }),
    [token, isAuthLoading, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

