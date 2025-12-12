"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: ReactNode;
  redirectIfUnauthenticatedTo?: string;
}

function parseJwt(token: string) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

export default function AuthGuard({
  children,
  redirectIfUnauthenticatedTo = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok">("checking");

  const getToken = () => localStorage.getItem("token");
  const getRefreshToken = () => localStorage.getItem("refreshToken");

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const token = getToken();
      const refreshToken = getRefreshToken();

      // Không có token -> thử refresh nếu có refreshToken
      if (!token) {
        if (refreshToken) {
          return attemptRefresh(refreshToken);
        }
        return forceLogout();
      }

      // Token có nhưng hết hạn -> refresh
      if (isTokenExpired(token)) {
        if (refreshToken) {
          return attemptRefresh(refreshToken);
        }
        return forceLogout();
      }

      // Token còn hạn
      if (active) setStatus("ok");
    };

    const attemptRefresh = async (refreshToken: string) => {
      try {
        const res = await fetch(
          "https://api-lkdt.thanhcom.site/auth/refresh-token",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data.data?.token) throw new Error("Refresh failed");

        // 👉 Cập nhật token mới
        localStorage.setItem("token", data.data.token);

        if (active) setStatus("ok");
      } catch {
        forceLogout();
      }
    };

    const forceLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      router.replace(redirectIfUnauthenticatedTo);
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [redirectIfUnauthenticatedTo, router]);

  if (status === "checking") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Đang kiểm tra đăng nhập...</div>
      </div>
    );
  }

  return <>{children}</>;
}
