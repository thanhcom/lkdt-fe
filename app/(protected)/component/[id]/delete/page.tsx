"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ComponentItem } from "@/types/ComponentItem";

export default function DeleteComponentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [component, setComponent] = useState<ComponentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch dữ liệu linh kiện
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        alert("Bạn chưa đăng nhập hoặc token không tồn tại!");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://api-lkdt.thanhcom.site/components/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không lấy được dữ liệu linh kiện");

        const data = await res.json();
        setComponent(data.data);
      } catch (error) {
        console.error(error);
        alert("Không thể tải dữ liệu linh kiện");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleDelete = async () => {
    if (!token) {
      alert("Bạn chưa đăng nhập hoặc token không tồn tại!");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa linh kiện "${component?.name}" không?`)) return;

    setDeleting(true);

    try {
      const res = await fetch(`https://api-lkdt.thanhcom.site/components/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Xóa thất bại");

      alert("Xóa thành công!");
      router.push("/component");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi xóa linh kiện");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-center py-10">Đang tải dữ liệu...</p>;
  if (!component) return <p className="text-center py-10 text-red-500">Không tìm thấy linh kiện</p>;

  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md text-center">
      <h1 className="text-2xl font-bold mb-4">Xóa Linh Kiện</h1>
      <p className="mb-6">
        Bạn sắp xóa linh kiện: <strong>{component.name}</strong>
      </p>

      <div className="flex gap-4 justify-center">
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Đang xóa..." : "Xóa"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/component")}>
          Hủy
        </Button>
      </div>
    </div>
  </div>
);

}
