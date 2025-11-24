// AddComponentForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AddComponentForm() {
  const router = useRouter();

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
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập");
        return;
      }
      const res = await fetch(
        "https://api-lkdt.thanhcom.site/components/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // thêm token vào header
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Thêm linh kiện thất bại");
      alert("Thêm linh kiện thành công");
      router.push("/component");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi thêm linh kiện");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Thêm Linh Kiện</h1>
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
          <Button type="submit" variant="default" className="flex-1">
            Thêm Linh Kiện
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
