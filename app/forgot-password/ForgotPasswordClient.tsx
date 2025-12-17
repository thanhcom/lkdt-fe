"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordClient() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Vui lòng nhập username");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://api-lkdt.thanhcom.site/account/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim() }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error((data as { message?: string })?.message || "Gửi yêu cầu thất bại");

      setMessage(
        (data as { message?: string })?.message ||
          "Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email."
      );
      setUsername("");
    } catch (err: unknown) {
      // Fix "Unexpected any"
      const e = err as Error;
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="p-8 w-full max-w-md shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập username của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}
