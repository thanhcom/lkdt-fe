"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ComponentData = {
  id: number;
  name: string;
  type: string;
  specification: string;
  manufacturer: string;
  packageField: string;
  unit: string;
  stockQuantity: number;
  location: string;
  createdAt: string;
};

export default function ComponentTable() {
  const [data, setData] = useState<ComponentData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        const res = await fetch("https://api-lkdt.thanhcom.site/components/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) localStorage.removeItem("token");
          return router.push("/login");
        }

        const json = await res.json();

        // ✅ Chỉ set mảng data
        if (Array.isArray(json.data)) {
          setData(json.data);
        } else {
          setData([]);
          console.error("API trả về không phải mảng:", json);
        }
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Loại</th>
          <th>Số lượng</th>
          <th>Vị trí</th>
          <th>Ngày tạo</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.type}</td>
              <td>{c.stockQuantity}</td>
              <td>{c.location}</td>
              <td>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6}>Không có dữ liệu</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
