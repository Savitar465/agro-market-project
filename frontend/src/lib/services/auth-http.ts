import { apiRequest } from "@/lib/services/http-client";

const AUTH_PATH = "/auth";

export type Role = "user" | "seller" | "admin";

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "user" | "seller";
};

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: Role[];
};

type AuthResponse = {
  access_token?: string;
  user?: AuthUser;
};

export type AuthResult = {
  accessToken: string;
  user: AuthUser;
};

function normalizeAuthResponse(response: AuthResponse): AuthResult {
  const accessToken = response.access_token;

  if (!accessToken || !response.user) {
    throw new Error("Auth response is missing the access token or user");
  }

  return {
    accessToken,
    user: response.user,
  };
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResult> {
  const response = await apiRequest<AuthResponse>(`${AUTH_PATH}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeAuthResponse(response);
}

export async function registerRequest(
  payload: RegisterPayload,
): Promise<AuthResult> {
  const response = await apiRequest<AuthResponse>(`${AUTH_PATH}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeAuthResponse(response);
}

export async function logoutRequest(): Promise<void> {
  // Best-effort: the token is revoked server-side. Failures here must not
  // block clearing the local session.
  try {
    await apiRequest(`${AUTH_PATH}/logout`, { method: "POST" });
  } catch {
    // ignore — local logout still proceeds
  }
}
