import type { Role } from "@/lib/services/auth-http";

/** All roles an admin can assign, in display order. */
export const ALL_ROLES: Role[] = ["user", "seller", "admin"];

/** Spanish-facing labels for each role. */
export const ROLE_LABELS: Record<Role, string> = {
  user: "Consumidor",
  seller: "Productor",
  admin: "Administrador",
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role;
}

export function rolesLabel(roles: Role[]): string {
  return roles.length ? roles.map(roleLabel).join(", ") : "—";
}
