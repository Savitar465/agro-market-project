import RequireAuth from "@/components/auth/RequireAuth";
import type React from "react";

export default function CartLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RequireAuth>{children}</RequireAuth>;
}
