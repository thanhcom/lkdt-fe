"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Account } from "@/types/AccountType";
import { Role } from "@/types/dataUser";

export default function UserInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Account | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const fetchUserInfo = useCallback(async () => {
  try {
    const token = getToken();

    if (!token) {
      console.error("Không có token!");
      setUser(null);
      return;
    }

    const res = await axios.get(
      "https://api-lkdt.thanhcom.site/account/my-info",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser(res.data.data);
  } catch (error) {
    console.error("Lỗi API:", error);
    setUser(null);
  } finally {
    setLoading(false);
  }
}, []); // 👈 deps rỗng là OK

  useEffect(() => {
  fetchUserInfo();
}, [fetchUserInfo]);

  if (loading)
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium">Đang tải thông tin...</p>
    </div>
  );
  if (!user)
    return (
      <div className="p-4">
        <p className="text-red-500 mb-3">Không thể tải thông tin tài khoản.</p>
        <Button variant="outline" onClick={() => router.push("/login")}>
          Đăng nhập lại
        </Button>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><strong>Họ tên:</strong> {user.fullname}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Số điện thoại:</strong> {user.phone}</p>
          <p><strong>Ngày sinh:</strong> {new Date(user.birthday).toLocaleDateString("vi-VN")}</p>
          <p><strong>Ngày tạo:</strong> {new Date(user.datecreate).toLocaleString("vi-VN")}</p>
          <p><strong>Cập nhật cuối:</strong> {new Date(user.last_update).toLocaleString("vi-VN")}</p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {user.active ? (
              <span className="text-green-600 font-semibold">Đang hoạt động</span>
            ) : (
              <span className="text-red-600 font-semibold">Bị khóa</span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vai trò & Quyền hạn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.roles.map((role: Role) => (
            <div key={role.id} className="border p-3 rounded-md">
              <p className="font-semibold text-lg">Role : {role.name}</p>
              <p className="text-sm text-gray-600">{role.description}</p>

              <div className="mt-2">
                <p className="font-medium">Permissions:</p>
                <ul className="list-disc pl-5 text-sm mt-1">
                  {role.permissions.map((p) => (
                    <li key={p.id}>
                      <strong>{p.name}</strong> – {p.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
