"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function AddCustomerPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = { fullName, phone, email, address };

    try {
      const res = await fetch(
        "https://api-lkdt.thanhcom.site/customer/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(body),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        alert("Lỗi: " + json.error);
        return;
      }

      alert("Thêm khách hàng thành công!");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Thêm khách hàng</h1>

      <Card className="shadow-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">

            {/* FULL NAME */}
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

            {/* PHONE */}
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

            {/* EMAIL */}
            <div className="flex flex-col">
              <label className="font-semibold">Email</label>
              <input
                type="email"
                className="border px-3 py-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* ADDRESS */}
            <div className="flex flex-col">
              <label className="font-semibold">Địa chỉ</label>
              <textarea
                className="border px-3 py-2 rounded"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Lưu
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
