"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ImportLogItem = {
  id: number;
  componentId: number;
  supplierId: number;
  price: number;
  quantityChange: number;
  quantityAfter: number;
  action: string;
  createdAt: string;
};

export default function ImportLogPage() {
  // Filters
  const [componentId, setComponentId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [action, setAction] = useState("");

  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  const [quantityChangeFrom, setQuantityChangeFrom] = useState("");
  const [quantityChangeTo, setQuantityChangeTo] = useState("");

  const [quantityAfterFrom, setQuantityAfterFrom] = useState("");
  const [quantityAfterTo, setQuantityAfterTo] = useState("");

  const [data, setData] = useState<ImportLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const buildQuery = () => {
    const q = new URLSearchParams();
    q.set("page", String(page - 1));

    if (componentId) q.set("componentId", componentId);
    if (supplierId) q.set("supplierId", supplierId);
    if (action) q.set("action", action);

    if (createdFrom) q.set("createdFrom", createdFrom);
    if (createdTo) q.set("createdTo", createdTo);

    if (priceFrom) q.set("priceFrom", priceFrom);
    if (priceTo) q.set("priceTo", priceTo);

    if (quantityChangeFrom) q.set("quantityChangeFrom", quantityChangeFrom);
    if (quantityChangeTo) q.set("quantityChangeTo", quantityChangeTo);

    if (quantityAfterFrom) q.set("quantityAfterFrom", quantityAfterFrom);
    if (quantityAfterTo) q.set("quantityAfterTo", quantityAfterTo);

    return q.toString();
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `https://api-lkdt.thanhcom.site/component-supplier/search?${buildQuery()}`,
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
            Nhật ký nhập hàng (Import Log)
          </h2>

          {/* FILTER PANEL */}
          <div className="border rounded p-4 bg-gray-50 space-y-4">
            <h3 className="font-semibold text-gray-700">Bộ lọc</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Component ID"
                value={componentId}
                onChange={(e) => setComponentId(e.target.value)}
              />

              <Input
                placeholder="Supplier ID"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              />

              <Input
                placeholder="Action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              />

              <Input
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
              />

              <Input
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
              />

              <Input
                placeholder="Price From"
                type="number"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
              />

              <Input
                placeholder="Price To"
                type="number"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
              />

              <Input
                placeholder="QuantityChange From"
                type="number"
                value={quantityChangeFrom}
                onChange={(e) => setQuantityChangeFrom(e.target.value)}
              />

              <Input
                placeholder="QuantityChange To"
                type="number"
                value={quantityChangeTo}
                onChange={(e) => setQuantityChangeTo(e.target.value)}
              />

              <Input
                placeholder="QuantityAfter From"
                type="number"
                value={quantityAfterFrom}
                onChange={(e) => setQuantityAfterFrom(e.target.value)}
              />

              <Input
                placeholder="QuantityAfter To"
                type="number"
                value={quantityAfterTo}
                onChange={(e) => setQuantityAfterTo(e.target.value)}
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
                  <th className="p-2 border">Component ID</th>
                  <th className="p-2 border">Supplier ID</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Qty Change</th>
                  <th className="p-2 border">Qty After</th>
                  <th className="p-2 border">Action</th>
                  <th className="p-2 border">Created At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      Đang tải...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{item.id}</td>
                      <td className="p-2 border">{item.componentId}</td>
                      <td className="p-2 border">{item.supplierId}</td>
                      <td className="p-2 border">{item.price}</td>
                      <td className="p-2 border">{item.quantityChange}</td>
                      <td className="p-2 border">{item.quantityAfter}</td>
                      <td className="p-2 border">{item.action}</td>
                      <td className="p-2 border">
                        {formatDate(item.createdAt)}
                      </td>
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
