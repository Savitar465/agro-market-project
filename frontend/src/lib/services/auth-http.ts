import { apiRequest } from "@/lib/services/http-client";

const AUTH_PATH = "/auth";

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
};

type LoginResponse = {
  access_token?: string;
};

export async function loginRequest(payload: LoginPayload): Promise<{ accessToken: string }> {
  const response = await apiRequest<LoginResponse>(`${AUTH_PATH}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const accessToken = response.access_token;

  if (!accessToken) {
    throw new Error("Login response does not include an access token");
  }

  return {
    accessToken,
  };
}

