import RequireAuth from "@/components/auth/RequireAuth";
import type React from "react";

export default function SellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RequireAuth roles={["seller", "admin"]}>{children}</RequireAuth>;
}
