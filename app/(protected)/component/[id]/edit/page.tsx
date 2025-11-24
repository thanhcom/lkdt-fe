"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ComponentItem } from "@/types/ComponentItem";

export default function EditComponentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "",
    specification: "",
    manufacturer: "",
    packageField: "",
    unit: "",
    stockQuantity: 0,
    location: "",
  });

  // Lấy token
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Helper sanitize dữ liệu API (tránh value=null)
  const sanitizeData = (data: ComponentItem) => ({
    name: data.name ?? "",
    type: data.type ?? "",
    specification: data.specification ?? "",
    manufacturer: data.manufacturer ?? "",
    packageField: data.packageField ?? "",
    unit: data.unit ?? "",
    stockQuantity: data.stockQuantity ?? 0,
    location: data.location ?? "",
  });

  // Load dữ liệu cũ từ backend
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        alert("Bạn chưa đăng nhập hoặc token không tồn tại!");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/components/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Không lấy được dữ liệu linh kiện");

        const data = await res.json();
        setForm(sanitizeData(data.data));
      } catch (error) {
        console.error(error);
        alert("Không thể tải dữ liệu linh kiện");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "stockQuantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Bạn chưa đăng nhập hoặc token không tồn tại!");
      return;
    }

    setSaving(true);

    const submitData = {
      name: form.name,
      type: form.type,
      specification: form.specification,
      manufacturer: form.manufacturer,
      packageField: form.packageField,
      unit: form.unit,
      stockQuantity: form.stockQuantity,
      location: form.location,
    };

    try {
      const res = await fetch(
        `https://api-lkdt.thanhcom.site/components/edit/${id}`,
        {
          method: "PUT", // hoặc PUT nếu backend hỗ trợ
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!res.ok) throw new Error("Cập nhật thất bại");

      router.push("/component");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi cập nhật linh kiện");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-10">Đang tải dữ liệu...</p>;

  return (
    <div className=" max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Sửa Linh Kiện: {form.name}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          placeholder="Tên linh kiện"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          name="type"
          placeholder="Loại linh kiện"
          value={form.type}
          onChange={handleChange}
        />
        <Textarea
          name="specification"
          placeholder="Thông số kỹ thuật"
          value={form.specification}
          onChange={handleChange}
        />
        <Input
          name="manufacturer"
          placeholder="Nhà sản xuất"
          value={form.manufacturer}
          onChange={handleChange}
        />
        <Input
          name="packageField"
          placeholder="Kiểu Đóng Gói"
          value={form.packageField}
          onChange={handleChange}
        />
        <Input
          name="unit"
          placeholder="Đơn vị"
          value={form.unit}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="stockQuantity"
          placeholder="Số lượng"
          value={form.stockQuantity}
          onChange={handleChange}
        />
        <Input
          name="location"
          placeholder="Vị trí"
          value={form.location}
          onChange={handleChange}
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => router.push("/component")}
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
