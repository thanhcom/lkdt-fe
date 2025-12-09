"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type HistoryItem = {
  id: number;
  orderId: number;
  action: string;
  description: string;
  createdAt: string;
  updatedBy: string;
};

export default function OrderHistoryPage() {
  const router = useRouter();

  // Filters
  const [keyword, setKeyword] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [componentId, setComponentId] = useState("");
  const [componentName, setComponentName] = useState("");
  const [action, setAction] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const buildQuery = () => {
    const q = new URLSearchParams();
    q.set("page", String(page - 1));

    if (keyword) q.set("orderId", keyword);
    if (customerId) q.set("customerId", customerId);
    if (customerName) q.set("customerName", customerName);
    if (componentId) q.set("componentId", componentId);
    if (componentName) q.set("componentName", componentName);
    if (action) q.set("action", action);
    if (updatedBy) q.set("updatedBy", updatedBy);
    if (createdFrom) q.set("createdFrom", createdFrom);
    if (createdTo) q.set("createdTo", createdTo);

    return q.toString();
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://api-lkdt.thanhcom.site/order-history/search?${buildQuery()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const json = await res.json();
      if (json.data) setData(json.data);
      if (json.pageInfo) setTotalPage(json.pageInfo.totalPage);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const formatDate = (str: string) => {
    if (!str) return "";
    return new Date(str).toLocaleString("vi-VN", { hour12: false });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardContent className="space-y-6 mt-4">
          <h2 className="text-xl font-bold text-center">
            Lịch sử thay đổi đơn hàng
          </h2>

          {/* FILTER PANEL */}
          <div className="border rounded p-4 bg-gray-50 space-y-4">
            <h3 className="font-semibold text-gray-700">Bộ lọc nâng cao</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

              <Input
                placeholder="Order ID"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />

              <Input
                placeholder="Customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />

              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <Input
                placeholder="Component ID"
                value={componentId}
                onChange={(e) => setComponentId(e.target.value)}
              />

              <Input
                placeholder="Component Name"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
              />

              <Input
                placeholder="Action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              />

              <Input
                placeholder="Updated By"
                value={updatedBy}
                onChange={(e) => setUpdatedBy(e.target.value)}
              />

              <Input
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                placeholder="Từ ngày"
              />

              <Input
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                placeholder="Đến ngày"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSearch}>Tìm kiếm</Button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">Action</th>
                  <th className="p-2 border">Mô tả</th>
                  <th className="p-2 border">Ngày</th>
                  <th className="p-2 border">User Update</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4">
                      Đang tải...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{item.id}</td>
                      <td className="p-2 border">{item.orderId}</td>
                      <td className="p-2 border">{item.action}</td>
                      <td className="p-2 border whitespace-pre-line">
                        {item.description}
                      </td>
                      <td className="p-2 border">{formatDate(item.createdAt)}</td>
                      <td className="p-2 border">{item.updatedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ← Trước
            </Button>

            <span>
              Trang {page}/{totalPage}
            </span>

            <Button
              variant="outline"
              disabled={page >= totalPage}
              onClick={() => setPage(page + 1)}
            >
              Sau →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
