"use client";

import { useAuth } from "@/lib/auth/auth-context";
import type { Role } from "@/lib/services/auth-http";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type React from "react";

type RequireAuthProps = Readonly<{
  children: React.ReactNode;
  /** If provided, the user must have at least one of these roles. */
  roles?: Role[];
}>;

/**
 * Client-side guard for private pages. Redirects unauthenticated users to
 * /login and users lacking the required role(s) to /store.
 */
export default function RequireAuth({ children, roles }: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading, hasRole } = useAuth();

  const isAllowed =
    isAuthenticated && (!roles || roles.length === 0 || hasRole(...roles));

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (roles && roles.length > 0 && !hasRole(...roles)) {
      router.replace("/store");
    }
  }, [isAuthLoading, isAuthenticated, roles, hasRole, router]);

  if (isAuthLoading || !isAllowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
