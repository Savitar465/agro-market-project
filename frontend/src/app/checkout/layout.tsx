import RequireAuth from "@/components/auth/RequireAuth";
import type React from "react";

export default function CheckoutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RequireAuth>{children}</RequireAuth>;
}
