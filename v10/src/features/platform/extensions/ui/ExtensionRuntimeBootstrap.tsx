"use client";

import { useEffect } from "react";

import { useLocalStore } from "@features/platform/store/useLocalStore";
import ErrorBoundary from "@ui/components/ErrorBoundary";

import { createBootstrapOrchestrator } from "./runtime";

export function ExtensionRuntimeBootstrap() {
  const role = useLocalStore((state) => state.role);
  const setTrustedRoleClaim = useLocalStore((state) => state.setTrustedRoleClaim);
  const clearTrustedRoleClaim = useLocalStore(
    (state) => state.clearTrustedRoleClaim
  );

  useEffect(() => {
    const verifyTrustedRole = async () => {
      if (typeof window === "undefined") return;
      if (role === "student") {
        setTrustedRoleClaim("student");
        return;
      }
      const roleToken = process.env.NEXT_PUBLIC_ROLE_TRUST_TOKEN;
      if (!roleToken) {
        clearTrustedRoleClaim();
        return;
      }
      try {
        const response = await fetch("/api/trust/role", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            requestedRole: role,
            roleToken,
          }),
        });
        if (!response.ok) {
          clearTrustedRoleClaim();
          return;
        }
        const body = (await response.json()) as { role?: unknown };
        if (body.role === "host" || body.role === "student") {
          setTrustedRoleClaim(body.role);
          return;
        }
        clearTrustedRoleClaim();
      } catch {
        clearTrustedRoleClaim();
      }
    };
    void verifyTrustedRole();

    return createBootstrapOrchestrator({ role });
  }, [clearTrustedRoleClaim, role, setTrustedRoleClaim]);

  return <ErrorBoundary fallback={null}>{null}</ErrorBoundary>;
}
