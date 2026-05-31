"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type React from "react";
import {
  type AuthResult,
  type AuthUser,
  type RegisterPayload,
  type Role,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "@/lib/services/auth-http";

type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: AuthUser | null;
  roles: Role[];
  hasRole: (...roles: Role[]) => boolean;
  isSeller: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";

/** Returns the JWT expiry as epoch milliseconds, or null if unreadable. */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(() => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = null;
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Schedule an automatic logout when the JWT expires.
  const scheduleExpiry = useCallback(
    (accessToken: string) => {
      if (expiryTimer.current) {
        clearTimeout(expiryTimer.current);
        expiryTimer.current = null;
      }
      const expiresAt = getTokenExpiry(accessToken);
      if (expiresAt === null) {
        return;
      }
      const msUntilExpiry = expiresAt - Date.now();
      if (msUntilExpiry <= 0) {
        clearSession();
        return;
      }
      expiryTimer.current = setTimeout(clearSession, msUntilExpiry);
    },
    [clearSession],
  );

  const applySession = useCallback(
    (result: AuthResult) => {
      localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
      setToken(result.accessToken);
      setUser(result.user);
      scheduleExpiry(result.accessToken);
    },
    [scheduleExpiry],
  );

  // Restore the session from storage on first load.
  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (storedToken) {
      const expiresAt = getTokenExpiry(storedToken);
      if (expiresAt !== null && expiresAt <= Date.now()) {
        // Expired while away — drop it.
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      } else {
        setToken(storedToken);
        scheduleExpiry(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser) as AuthUser);
          } catch {
            localStorage.removeItem(AUTH_USER_KEY);
          }
        }
      }
    }

    setIsAuthLoading(false);

    return () => {
      if (expiryTimer.current) {
        clearTimeout(expiryTimer.current);
      }
    };
  }, [scheduleExpiry]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await loginRequest({ username, password });
      applySession(result);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await registerRequest(payload);
      applySession(result);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    clearSession();
  }, [clearSession]);

  const roles = useMemo<Role[]>(() => user?.roles ?? [], [user]);

  const hasRole = useCallback(
    (...required: Role[]) => required.some((role) => roles.includes(role)),
    [roles],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      isAuthLoading,
      user,
      roles,
      hasRole,
      isSeller: roles.includes("seller"),
      isAdmin: roles.includes("admin"),
      login,
      register,
      logout,
    }),
    [token, isAuthLoading, user, roles, hasRole, login, register, logout],
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
