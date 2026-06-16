"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Supplier } from "../../all/page";

export default function EditSupplier() {
  const router = useRouter();
  const { id } = useParams();

  const [data, setData] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const res = await fetch(
        `https://api-lkdt.thanhtrang.online/supplier/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const json = await res.json();
      setData(json.data);
    };

    fetchData();
  }, [id]);

  if (!data) return <p className="p-6">Đang tải...</p>;

  const update = (k: string, v: string) => setData({ ...data, [k]: v });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`https://api-lkdt.thanhtrang.online/supplier/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) return alert(json.error);

    alert("Cập nhật thành công!");
    router.back();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardContent className="space-y-4 mt-4">

          <h2 className="text-xl font-bold text-center">Sửa Nhà Cung Cấp</h2>

          {["name", "contact", "email", "phone", "address"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="font-semibold capitalize">{field}</label>
              <input
                className="border px-3 py-2 rounded w-full"
                value={(data as any)[field]}
                onChange={(e) => update(field, e.target.value)}
              />
            </div>
          ))}

          {/* 🔥 CHUẨN STYLE NÚT NHƯ EDIT ORDER */}
          <section className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => router.back()}>
              Quay lại
            </Button>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
