import type React from "react";
import RequireAuth from "@/components/auth/RequireAuth";

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RequireAuth>{children}</RequireAuth>;
}
