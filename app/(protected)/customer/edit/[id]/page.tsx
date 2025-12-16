"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Customer = {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
};

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();

  // Normalize id -> string | undefined
  const id: string | undefined =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : undefined;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // ==========================
  // FETCH CUSTOMER
  // ==========================
  const fetchCustomer = useCallback(async () => {
    if (!id) {
      setError("Không tìm thấy ID khách hàng trong URL");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await fetch(
        `https://api-lkdt.thanhcom.site/customer/${encodeURIComponent(id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errJson = (await res.json().catch(() => null)) as
          | ApiResponse<unknown>
          | null;

        setError(errJson?.error ?? "Không thể lấy thông tin khách hàng");
        return;
      }

      const json = (await res.json()) as ApiResponse<Customer>;
      const payload = json.data ?? null;

      if (!payload) {
        setError("Dữ liệu khách hàng không hợp lệ");
        return;
      }

      setCustomer(payload);
      setFullName(payload.fullName ?? "");
      setPhone(payload.phone ?? "");
      setEmail(payload.email ?? "");
      setAddress(payload.address ?? "");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Lỗi khi gọi API");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  // ==========================
  // SAVE
  // ==========================
  const handleSave = useCallback(async () => {
    if (!id) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const body = {
        fullName,
        phone,
        email,
        address,
      };

      const res = await fetch(
        `https://api-lkdt.thanhcom.site/customer/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const json = (await res.json().catch(() => null)) as
        | ApiResponse<Customer>
        | null;

      if (!res.ok) {
        alert(
          "Lỗi khi cập nhật: " +
            (json?.error ?? "Không xác định")
        );
        return;
      }

      alert("Cập nhật khách hàng thành công!");
      router.back();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Có lỗi khi cập nhật khách hàng");
      }
    } finally {
      setSaving(false);
    }
  }, [id, fullName, phone, email, address, router]);

  // ==========================
  // RENDER STATES
  // ==========================
  if (loading) {
    return <div className="p-6">Đang tải thông tin khách hàng...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!customer) {
    return <div className="p-6">Không có dữ liệu khách hàng.</div>;
  }

  // ==========================
  // UI
  // ==========================
  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">
        Sửa khách hàng #{customer.id}
      </h1>

      <Card className="shadow-lg">
        <CardContent>
          <form
            className="space-y-4 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="flex flex-col">
              <label className="font-semibold">Tên khách hàng</label>
              <input
                type="text"
                className="border px-3 py-2 rounded"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Số điện thoại</label>
              <input
                type="text"
                className="border px-3 py-2 rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Email</label>
              <input
                type="email"
                className="border px-3 py-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold">Địa chỉ</label>
              <textarea
                className="border px-3 py-2 rounded"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <section className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Quay lại
              </Button>

              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </section>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
