"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiOrderResponse } from "@/types/ComponentData";
import { ComponentItem } from "@/app/(protected)/component/page";
import { Item, Order } from "@/types/OrderType";


export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ComponentItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const recalcTotal = (items: Item[]) =>
    items.reduce((sum, item) => sum + item.total, 0);

  /* ===================== FETCH ORDER ===================== */
  useEffect(() => {
    const TOKEN = localStorage.getItem("token");
    if (!id || !TOKEN) {
      setError("ID đơn hàng hoặc token không hợp lệ");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/orders/${id}`,
          {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: ApiOrderResponse = await res.json();

        const items: Item[] = json.data.items.map((i) => ({
          componentId: i.componentId,
          componentName: i.componentName,
          quantity: i.quantity,
          price: i.price,
          total: i.total ?? i.quantity * i.price,
        }));

        setOrder({
          customer: json.data.customer,
          orderDate: json.data.orderDate,
          status: json.data.status,
          items,
          totalAmount: recalcTotal(items),
        });
      } catch (e) {
        console.error(e);
        setError("Không thể tải dữ liệu đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ===================== SEARCH COMPONENT ===================== */
  useEffect(() => {
    const TOKEN = localStorage.getItem("token");
    if (!TOKEN || !searchTerm || activeItemIndex === null) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/components/search?q=${encodeURIComponent(
            searchTerm
          )}`,
          {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
        );
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        setSearchResults(json.data);
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, activeItemIndex]);

  /* ===================== HANDLERS ===================== */
  const handleStatusChange = (value: string) => {
    if (!order) return;
    setOrder({ ...order, status: value });
  };

  const handleItemChange = <K extends keyof Item>(
    idx: number,
    field: K,
    value: Item[K]
  ) => {
    if (!order) return;

    const newItems = [...order.items];

    if (field === "componentId") {
      if (
        order.items.some(
          (item, i) => i !== idx && item.componentId === value
        )
      ) {
        alert("Sản phẩm này đã có trong đơn hàng!");
        return;
      }
    }

    newItems[idx][field] = value;

    if (field === "quantity" || field === "price") {
      newItems[idx].total =
        newItems[idx].quantity * newItems[idx].price;
    }

    setOrder({
      ...order,
      items: newItems,
      totalAmount: recalcTotal(newItems),
    });
  };

  const handleAddItem = () => {
    if (!order) return;

    const newItem: Item = {
      componentId: 0,
      componentName: "",
      quantity: 1,
      price: 0,
      total: 0,
    };

    const newItems = [...order.items, newItem];
    setOrder({
      ...order,
      items: newItems,
      totalAmount: recalcTotal(newItems),
    });
    setActiveItemIndex(order.items.length);
  };

  const handleRemoveItem = (idx: number) => {
    if (!order) return;

    const newItems = order.items.filter((_, i) => i !== idx);
    setOrder({
      ...order,
      items: newItems,
      totalAmount: recalcTotal(newItems),
    });
  };

  const handleSave = async () => {
    if (!order) return;

    const TOKEN = localStorage.getItem("token");
    if (!TOKEN) {
      alert("Bạn chưa đăng nhập");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `https://api-lkdt.thanhcom.site/orders/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            status: order.status,
            items: order.items.map((i) => ({
              componentId: i.componentId,
              quantity: i.quantity,
              price: i.price,
            })),
          }),
        }
      );

      if (!res.ok) throw new Error("Save failed");
      router.back();
    } catch (e) {
      console.error(e);
      alert("Lưu đơn hàng thất bại");
    } finally {
      setSaving(false);
    }
  };

  /* ===================== RENDER ===================== */
  if (loading)
    return (
      <div className="p-4 text-center text-gray-500">Đang tải...</div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-600">{error}</div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Chỉnh sửa đơn hàng #{id}
            </h2>
            <span className="font-semibold text-blue-600">
              Tổng:{" "}
              {(order?.totalAmount ?? 0).toLocaleString("vi-VN")}đ
            </span>
          </div>

          {/* CUSTOMER */}
          <section className="border-b pb-4 space-y-2">
            <h3 className="font-semibold">Khách hàng</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Họ tên: {order?.customer.fullName}</div>
              <div>SĐT: {order?.customer.phone}</div>
              <div>Email: {order?.customer.email}</div>
              <div>Địa chỉ: {order?.customer.address}</div>
            </div>
          </section>

          {/* STATUS */}
          <section className="border-b pb-4">
            <Label>Trạng thái</Label>
            <select
              value={order?.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="OK">Hoàn thành</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="CANCELLED">Hủy</option>
            </select>
          </section>

          {/* ITEMS */}
          <section className="space-y-4">
            {order?.items.map((i, idx) => (
              <div
                key={idx}
                className="border rounded p-4 space-y-3"
              >
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Label>Sản phẩm</Label>
                    <Input
                      value={i.componentName}
                      onChange={(e) => {
                        setActiveItemIndex(idx);
                        setSearchTerm(e.target.value);
                        handleItemChange(
                          idx,
                          "componentName",
                          e.target.value
                        );
                      }}
                    />
                    {activeItemIndex === idx &&
                      searchResults.length > 0 && (
                        <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-auto">
                          {searchResults.map((c) => (
                            <li
                              key={c.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                handleItemChange(
                                  idx,
                                  "componentId",
                                  c.id
                                );
                                handleItemChange(
                                  idx,
                                  "componentName",
                                  c.name
                                );
                                setSearchResults([]);
                              }}
                            >
                              {c.name}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveItem(idx)}
                  >
                    Xóa
                  </Button>
                </div>

                <div className="flex gap-4 items-center">
                  <div>
                    <Label>Số lượng</Label>
                    <Input
                      type="number"
                      value={i.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "quantity",
                          Number(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Giá</Label>
                    <Input
                      type="number"
                      value={i.price}
                      onChange={(e) =>
                        handleItemChange(
                          idx,
                          "price",
                          Number(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="ml-auto font-semibold">
                    Tổng: {i.total.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddItem}>
              Thêm sản phẩm
            </Button>
          </section>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Quay lại
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
