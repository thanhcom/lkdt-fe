"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function AddSupplier() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  });

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async () => {
    const res = await fetch("https://api-lkdt.thanhcom.site/supplier/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Thêm thành công!");
      router.push("/supplier/all");
    } else {
      const j = await res.json();
      alert(j.error);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardContent className="space-y-3">

          <h2 className="text-xl font-bold">Thêm Nhà Cung Cấp</h2>

          {["name", "contact", "email", "phone", "address"].map((field) => (
            <input
              key={field}
              className="border px-3 py-2 w-full rounded"
              placeholder={field}
              value={(form as any)[field]}
              onChange={(e) => update(field, e.target.value)}
            />
          ))}

          <button
            className="px-4 py-2 bg-green-600 text-white rounded w-full"
            onClick={submit}
          >
            Lưu
          </button>

        </CardContent>
      </Card>
    </div>
  );
}
