"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

interface ComponentItem {
  id: number;
  name: string;
}

interface Item {
  componentId: number;
  componentName: string;
  quantity: number;
  price: number;
  total: number;
}

export default function CreateOrderPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [customerActive, setCustomerActive] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ComponentItem[]>([]);

  const [status, setStatus] = useState("PENDING");
  const [saving, setSaving] = useState(false);

  const recalcTotal = (items: Item[]) =>
    items.reduce((sum, item) => sum + (item.total || 0), 0);

  // Tìm khách hàng
  useEffect(() => {
    const TOKEN = localStorage.getItem("token");
    if (!customerSearchTerm) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/customer/search?keyword=${encodeURIComponent(
            customerSearchTerm
          )}`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        if (!res.ok) throw new Error("Customer search failed");
        const data = await res.json();
        setCustomerResults(data.data);
      } catch (err) {
        console.error(err);
        setCustomerResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchTerm]);

  // Tìm sản phẩm
  useEffect(() => {
    const TOKEN = localStorage.getItem("token");
    if (!searchTerm || activeItemIndex === null) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/components/search?keyword=${encodeURIComponent(
            searchTerm
          )}`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );
        if (!res.ok) throw new Error("Component search failed");
        const data = await res.json();
        setSearchResults(data.data);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, activeItemIndex]);

  const handleAddItem = () => {
    const newItem: Item = {
      componentId: 0,
      componentName: "",
      quantity: 1,
      price: 0,
      total: 0,
    };
    setItems([...items, newItem]);
    setActiveItemIndex(items.length);
  };

  const handleRemoveItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
  };

  const handleItemChange = (
    idx: number,
    field: "componentId" | "componentName" | "quantity" | "price" | "total",
    value: any
  ) => {
    const newItems = [...items];
    newItems[idx][field] = value;

    if (field === "quantity" || field === "price") {
      newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
    }

    setItems(newItems);
  };

  const handleCreateOrder = async () => {
    if (!customer) {
      alert("Vui lòng chọn khách hàng!");
      return;
    }
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất 1 sản phẩm!");
      return;
    }
    if (items.some((i) => i.componentId === 0)) {
      alert("Vui lòng chọn đầy đủ sản phẩm!");
      return;
    }

    const TOKEN = localStorage.getItem("token");
    if (!TOKEN) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    setSaving(true);
    try {
      const body = {
        customer: { ...customer },
        status,
        items: items.map((i) => ({
          componentId: i.componentId,
          componentName: i.componentName,
          quantity: i.quantity,
          price: i.price,
          total: i.quantity * i.price,
        })),
      };

      const res = await fetch(`https://api-lkdt.thanhcom.site/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      alert("Tạo đơn hàng thành công!");
      router.back();
    } catch (err) {
      console.error(err);
      alert("Tạo đơn hàng thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-lg rounded-lg border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Tạo đơn hàng mới</h2>
          <span className="text-lg font-semibold text-blue-600">
            Tổng: {recalcTotal(items).toLocaleString("vi-VN")}đ
          </span>

          {/* Khách hàng */}
          <section className="space-y-2 border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-700">Khách hàng</h3>
            <div className="relative">
              <Input
                placeholder="Gõ tên hoặc số điện thoại khách hàng..."
                value={customer ? customer.fullName : customerSearchTerm}
                onChange={(e) => {
                  setCustomerSearchTerm(e.target.value);
                  setCustomerActive(true);
                  setCustomer(null);
                }}
              />
              {customerActive && customerResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded max-h-40 overflow-auto mt-1">
                  {customerResults.map((c) => (
                    <li
                      key={c.id}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setCustomer(c);
                        setCustomerSearchTerm(c.fullName);
                        setCustomerActive(false);
                      }}
                    >
                      {c.fullName} - {c.phone}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {customer && (
              <div className="text-gray-800 grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="font-semibold">Họ và tên:</span> {customer.fullName}
                </div>
                <div>
                  <span className="font-semibold">Số điện thoại:</span> {customer.phone}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {customer.email}
                </div>
                <div>
                  <span className="font-semibold">Địa chỉ:</span> {customer.address}
                </div>
              </div>
            )}
          </section>

          {/* Trạng thái */}
          <section className="space-y-2 border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-700">Trạng thái đơn hàng</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              <option value="OK">Hoàn thành</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="CANCELLED">Hủy</option>
            </select>
          </section>

          {/* Sản phẩm */}
          <section className="space-y-4 relative">
            <h3 className="font-semibold text-lg text-gray-700">Sản phẩm</h3>
            <div className="space-y-3">
              {items.map((i, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 bg-gray-50 shadow-sm flex flex-col gap-3 relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Label>Chọn sản phẩm</Label>
                      <Input
                        type="text"
                        value={i.componentName}
                        onChange={(e) => {
                          setActiveItemIndex(idx);
                          setSearchTerm(e.target.value);
                          handleItemChange(idx, "componentName", e.target.value);
                        }}
                        placeholder="Gõ tên sản phẩm..."
                      />
                      {activeItemIndex === idx && searchResults.length > 0 && (
                        <ul className="border rounded max-h-40 overflow-auto bg-white absolute z-10 w-full mt-1">
                          {searchResults.map((c) => (
                            <li
                              key={c.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                handleItemChange(idx, "componentId", c.id);
                                handleItemChange(idx, "componentName", c.name);
                                handleItemChange(
                                  idx,
                                  "total",
                                  items[idx].quantity * items[idx].price
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
                      size="sm"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      Xóa
                    </Button>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col">
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        value={i.quantity}
                        min={0}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", parseInt(e.target.value) || 0)
                        }
                        className="w-24"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label>Giá</Label>
                      <Input
                        type="number"
                        value={i.price}
                        min={0}
                        onChange={(e) =>
                          handleItemChange(idx, "price", parseFloat(e.target.value) || 0)
                        }
                        className="w-32"
                      />
                    </div>
                    <div className="ml-auto font-semibold text-gray-800">
                      Tổng: {(i.total ?? 0).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleAddItem} variant="outline">
              Thêm sản phẩm
            </Button>
          </section>

          {/* Hành động */}
          <section className="flex justify-end gap-3 mt-4">
            <Button onClick={handleCreateOrder} disabled={saving}>
              {saving ? "Đang tạo..." : "Tạo đơn hàng"}
            </Button>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
