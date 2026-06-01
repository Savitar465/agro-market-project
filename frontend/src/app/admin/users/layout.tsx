import type React from "react";
import RequireAuth from "@/components/auth/RequireAuth";

export default function AdminUsersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RequireAuth roles={["admin"]}>{children}</RequireAuth>;
}
