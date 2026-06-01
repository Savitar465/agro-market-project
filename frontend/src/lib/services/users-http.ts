import type { Role } from "@/lib/services/auth-http";
import { apiRequest } from "@/lib/services/http-client";

const USERS_PATH = "/users";

export type ManagedUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  roles: Role[];
  isActive: boolean;
};

export type CreateUserPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  roles: Role[];
};

export type UpdateUserPayload = {
  name?: string;
  username?: string;
  email?: string;
  roles?: Role[];
};

type ApiUser = Partial<ManagedUser> & { id?: string };

function normalizeUser(raw: ApiUser): ManagedUser {
  return {
    id: String(raw.id ?? ""),
    name: raw.name ?? "",
    username: raw.username ?? "",
    email: raw.email ?? "",
    roles: raw.roles ?? [],
    // The API omits isActive only on legacy rows; default to active.
    isActive: raw.isActive ?? true,
  };
}

export async function listUsers(): Promise<ManagedUser[]> {
  const response = await apiRequest<ApiUser[]>(USERS_PATH, { method: "GET" });
  return response.map(normalizeUser);
}

export async function getUser(id: string): Promise<ManagedUser> {
  const response = await apiRequest<ApiUser>(`${USERS_PATH}/${id}`, {
    method: "GET",
  });
  return normalizeUser(response);
}

export async function getCurrentUser(): Promise<ManagedUser> {
  const response = await apiRequest<ApiUser>(`${USERS_PATH}/me`, {
    method: "GET",
  });
  return normalizeUser(response);
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<ManagedUser> {
  const response = await apiRequest<ApiUser>(USERS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeUser(response);
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<ManagedUser> {
  const response = await apiRequest<ApiUser>(`${USERS_PATH}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeUser(response);
}

/** Asociar tipo de usuario — replace the user's role set. */
export async function setUserRoles(
  id: string,
  roles: Role[],
): Promise<ManagedUser> {
  const response = await apiRequest<ApiUser>(`${USERS_PATH}/${id}/roles`, {
    method: "PATCH",
    body: JSON.stringify({ roles }),
  });
  return normalizeUser(response);
}

export async function suspendUser(id: string): Promise<ManagedUser> {
  const response = await apiRequest<ApiUser>(`${USERS_PATH}/${id}/suspend`, {
    method: "PATCH",
  });
  return normalizeUser(response);
}

export async function reactivateUser(id: string): Promise<ManagedUser> {
  const response = await apiRequest<ApiUser>(`${USERS_PATH}/${id}/reactivate`, {
    method: "PATCH",
  });
  return normalizeUser(response);
}

export function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`${USERS_PATH}/${id}`, { method: "DELETE" });
}
