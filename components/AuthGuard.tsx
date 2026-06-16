"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import axiosClient from "@/lib/axios";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const publicPages = ["/login", "/forgot-password", "/reset-password"];

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      // 1. Nếu là trang công khai
      if (publicPages.includes(pathname)) {
        // Nếu đã có token mà cố vào trang login thì đá vào trong
        if (token) {
          router.replace("/component"); // hoặc trang chủ của bạn
          return;
        }
        setIsVerified(true);
        setLoading(false);
        return;
      }

      // 2. Nếu trang bảo mật mà không có token
      if (!token) {
        setIsVerified(false);
        setLoading(false);
        router.replace("/login");
        return;
      }

      try {
        // Gọi API check token
        await axiosClient.post("/auth/check_token", {
          token: localStorage.getItem("token"),
        });
        setIsVerified(true);
      } catch (error: any) {
        console.error("Xác thực thất bại:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setIsVerified(false);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // Bỏ hasChecked.current đi để nó re-check khi pathname thay đổi (từ login sang protected)
  }, [pathname, router]);

  // Nếu đang load hoặc chưa xác thực xong thì hiện loading
  if (loading || !isVerified) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
