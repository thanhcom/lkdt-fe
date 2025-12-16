"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/* ================= TYPES ================= */

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

interface OrderItem {
  componentId: number;
  componentName: string;
  quantity: number;
  price: number;
  total: number;
}

type OrderStatus = "OK" | "PENDING" | "CANCELLED";

/* ================= PAGE ================= */

export default function CreateOrderPage() {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ===== STATE ===== */

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerKeyword, setCustomerKeyword] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const [componentKeyword, setComponentKeyword] = useState("");
  const [componentResults, setComponentResults] = useState<ComponentItem[]>([]);

  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [saving, setSaving] = useState(false);

  /* ===== UTILS ===== */

  const calcTotal = useCallback(
    (list: OrderItem[]) =>
      list.reduce((sum, i) => sum + i.quantity * i.price, 0),
    []
  );

  /* ===== CUSTOMER SEARCH ===== */

  useEffect(() => {
    if (!customerKeyword || !token) {
      setCustomerResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/customer/search?keyword=${encodeURIComponent(
            customerKeyword
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Customer search failed");

        const json: { data: Customer[] } = await res.json();
        setCustomerResults(json.data);
      } catch {
        setCustomerResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerKeyword, token]);

  /* ===== COMPONENT SEARCH ===== */

  useEffect(() => {
    if (
      !componentKeyword ||
      activeItemIndex === null ||
      !token
    ) {
      setComponentResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/components/search?keyword=${encodeURIComponent(
            componentKeyword
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Component search failed");

        const json: { data: ComponentItem[] } = await res.json();
        setComponentResults(json.data);
      } catch {
        setComponentResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [componentKeyword, activeItemIndex, token]);

  /* ===== ITEM HANDLERS (STRICT SAFE) ===== */

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        componentId: 0,
        componentName: "",
        quantity: 1,
        price: 0,
        total: 0,
      },
    ]);
    setActiveItemIndex(items.length);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    data: Partial<Omit<OrderItem, "total">>
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, ...data };
        return { ...next, total: next.quantity * next.price };
      })
    );
  };

  /* ===== SUBMIT ===== */

  const createOrder = async () => {
    if (!customer) return alert("Vui lòng chọn khách hàng");
    if (!items.length) return alert("Chưa có sản phẩm");
    if (items.some((i) => i.componentId === 0))
      return alert("Sản phẩm chưa hợp lệ");
    if (!token) return alert("Chưa đăng nhập");

    setSaving(true);

    try {
      const res = await fetch(
        "https://api-lkdt.thanhcom.site/orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customer,
            status,
            items,
          }),
        }
      );

      if (!res.ok) throw new Error();
      alert("Tạo đơn hàng thành công");
      router.back();
    } catch {
      alert("Tạo đơn thất bại");
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="space-y-6 p-6">
          <h2 className="text-2xl font-bold">Tạo đơn hàng</h2>

          <div className="font-semibold text-blue-600">
            Tổng: {calcTotal(items).toLocaleString("vi-VN")}đ
          </div>

          {/* CUSTOMER */}
          <section className="space-y-2">
            <Label>Khách hàng</Label>
            <Input
              value={customer ? customer.fullName : customerKeyword}
              placeholder="Tên hoặc SĐT..."
              onChange={(e) => {
                setCustomer(null);
                setCustomerKeyword(e.target.value);
                setShowCustomerDropdown(true);
              }}
            />

            {showCustomerDropdown && customerResults.length > 0 && (
              <ul className="border rounded bg-white max-h-40 overflow-auto">
                {customerResults.map((c) => (
                  <li
                    key={c.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCustomer(c);
                      setCustomerKeyword(c.fullName);
                      setShowCustomerDropdown(false);
                    }}
                  >
                    {c.fullName} - {c.phone}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ITEMS */}
          <section className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="border p-4 rounded space-y-3">
                <Input
                  placeholder="Tên sản phẩm"
                  value={item.componentName}
                  onChange={(e) => {
                    setActiveItemIndex(idx);
                    setComponentKeyword(e.target.value);
                    updateItem(idx, { componentName: e.target.value });
                  }}
                />

                {activeItemIndex === idx &&
                  componentResults.length > 0 && (
                    <ul className="border rounded bg-white max-h-32 overflow-auto">
                      {componentResults.map((c) => (
                        <li
                          key={c.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            updateItem(idx, {
                              componentId: c.id,
                              componentName: c.name,
                            });
                            setComponentResults([]);
                          }}
                        >
                          {c.name}
                        </li>
                      ))}
                    </ul>
                  )}

                <div className="flex gap-3">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, {
                        quantity: Number(e.target.value) || 0,
                      })
                    }
                  />
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(idx, {
                        price: Number(e.target.value) || 0,
                      })
                    }
                  />
                  <Button
                    variant="destructive"
                    onClick={() => removeItem(idx)}
                  >
                    Xóa
                  </Button>
                </div>

                <div className="font-semibold">
                  Tổng: {item.total.toLocaleString("vi-VN")}đ
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addItem}>
              Thêm sản phẩm
            </Button>
          </section>

          <Button onClick={createOrder} disabled={saving}>
            {saving ? "Đang tạo..." : "Tạo đơn hàng"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
