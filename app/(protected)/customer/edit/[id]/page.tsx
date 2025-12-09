"use client";

import React, { useEffect, useState } from "react";
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

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy ID khách hàng trong URL");
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        let res = await fetch(
          `https://api-lkdt.thanhcom.site/customer/${encodeURIComponent(id)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          setError(errJson?.error || "Không thể lấy thông tin khách hàng");
          setLoading(false);
          return;
        }

        const json = await res.json();
        const payload = json?.data ? json.data : json;

        if (mounted && payload) {
          setCustomer(payload);
          setFullName(payload.fullName || "");
          setPhone(payload.phone || "");
          setEmail(payload.email || "");
          setAddress(payload.address || "");
        }
      } catch (err) {
        setError("Lỗi khi gọi API");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    try {
      const body = { fullName, phone, email, address };

      const res = await fetch(
        `https://api-lkdt.thanhcom.site/customer/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(body),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        alert("Lỗi khi cập nhật: " + (json.error || JSON.stringify(json)));
        return;
      }

      alert("Cập nhật khách hàng thành công!");
      router.back();
    } catch {
      alert("Có lỗi khi cập nhật khách hàng");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-6">Đang tải thông tin khách hàng...</div>;

  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );

  if (!customer) return <div className="p-6">Không có dữ liệu khách hàng.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">
        Sửa khách hàng #{customer.id}
      </h1>

      <Card className="shadow-lg">
        <CardContent>
          <form className="space-y-4 mt-4">
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

            {/* 🟦 NÚT FOOTER - ĐÃ ĐỒNG BỘ 100% */}
            <section className="flex justify-end gap-3 mt-4">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Quay lại
              </Button>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </section>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
