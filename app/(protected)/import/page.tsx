"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Supplier {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface ComponentItem {
  id: number;
  name: string;
}

interface ImportItem {
  componentId: number;
  componentName: string;
  price: number;
  quantity: number;
  total: number;
}

export default function CreateImportPage() {
  const router = useRouter();

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [supplierActive, setSupplierActive] = useState(false);

  const [items, setItems] = useState<ImportItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [componentResults, setComponentResults] = useState<ComponentItem[]>([]);

  const [saving, setSaving] = useState(false);

  const supplierTimer = useRef<number | null>(null);
  const componentTimer = useRef<number | null>(null);

  const recalcTotal = () => items.reduce((s, i) => s + (i.total || 0), 0);

  // ---------- Supplier search ----------
  useEffect(() => {
    if (supplierTimer.current) {
      clearTimeout(supplierTimer.current);
      supplierTimer.current = null;
    }

    if (!supplierSearch) {
      setSupplierList([]);
      return;
    }

    supplierTimer.current = window.setTimeout(async () => {
      try {
        const token = getToken();

        const res = await fetch(
          `https://api-lkdt.thanhcom.site/supplier/search?keyword=${encodeURIComponent(
            supplierSearch
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.warn("Lỗi fetch supplier:", res.status);
          setSupplierList([]);
          return;
        }

        const data = await res.json();
        setSupplierList(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        console.error("Supplier search error:", e);
        setSupplierList([]);
      }
    }, 300);

    return () => {
      if (supplierTimer.current) {
        clearTimeout(supplierTimer.current);
        supplierTimer.current = null;
      }
    };
  }, [supplierSearch]);

  // ---------- Component search ----------
  useEffect(() => {
    if (componentTimer.current) {
      clearTimeout(componentTimer.current);
      componentTimer.current = null;
    }

    if (!searchTerm || activeItemIndex === null) {
      setComponentResults([]);
      return;
    }

    componentTimer.current = window.setTimeout(async () => {
      try {
        const token = getToken();

        const res = await fetch(
          `https://api-lkdt.thanhcom.site/components/search?keyword=${encodeURIComponent(
            searchTerm
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.warn("Lỗi fetch components:", res.status);
          setComponentResults([]);
          return;
        }

        const data = await res.json();
        setComponentResults(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        console.error("Component search error:", e);
        setComponentResults([]);
      }
    }, 300);

    return () => {
      if (componentTimer.current) {
        clearTimeout(componentTimer.current);
        componentTimer.current = null;
      }
    };
  }, [searchTerm, activeItemIndex]);

  // ---------- Item Actions ----------
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { componentId: 0, componentName: "", price: 0, quantity: 1, total: 0 },
    ]);
    setActiveItemIndex(items.length);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    if (activeItemIndex === idx) setActiveItemIndex(null);
  };

  const updateItem = (
    idx: number,
    field: "componentId" | "componentName" | "price" | "quantity" | "total",
    value: any
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };

      const price = Number(next[idx].price) || 0;
      const quantity = Number(next[idx].quantity) || 0;

      next[idx].total = price * quantity;
      return next;
    });
  };

  // ---------- Submit ----------
  const handleCreateImport = async () => {
    if (!supplier) {
      alert("Vui lòng chọn nhà cung cấp!");
      return;
    }

    if (items.length === 0) {
      alert("Vui lòng thêm sản phẩm!");
      return;
    }

    if (items.some((i) => i.componentId === 0)) {
      alert("Vui lòng chọn đúng sản phẩm từ danh sách.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Không có token — vui lòng đăng nhập lại.");
      return;
    }

    setSaving(true);

    try {
      for (const item of items) {
        const payload = {
          componentId: item.componentId,
          supplierId: supplier.id,
          price: item.price,
          quantity: item.quantity,
        };

        const res = await fetch(
          `https://api-lkdt.thanhcom.site/component-supplier`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(
            `Tạo item thất bại (${item.componentName}): ${res.status} - ${errText}`
          );
        }
      }

      alert("Nhập hàng thành công!");
      router.back();
    } catch (err: any) {
      console.error("Create import error:", err);
      alert("Nhập hàng thất bại: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-2xl font-bold">Tạo phiếu nhập hàng</h2>

          <span className="text-xl font-semibold text-green-600">
            Tổng: {recalcTotal().toLocaleString("vi-VN")}đ
          </span>

          {/* Supplier */}
          <section className="space-y-3 border-b pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Nhà cung cấp</h3>
              <Button onClick={() => router.push("/supplier/create")}>
                + Tạo nhà cung cấp
              </Button>
            </div>

            <div className="relative">
              <Input
                placeholder="Tìm nhà cung cấp..."
                value={supplier ? supplier.name : supplierSearch}
                onChange={(e) => {
                  setSupplier(null);
                  setSupplierSearch(e.target.value);
                  setSupplierActive(true);
                }}
              />

              {supplierActive && supplierList.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-40 overflow-auto mt-1">
                  {supplierList.map((s) => (
                    <li
                      key={s.id}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSupplier(s);
                        setSupplierSearch(s.name);
                        setSupplierActive(false);
                      }}
                    >
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-gray-600">
                        {s.phone} — {s.address}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {supplier && (
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <strong>Địa chỉ:</strong> {supplier.address}
                </div>
                <div>
                  <strong>Email:</strong> {supplier.email}
                </div>
                <div>
                  <strong>SĐT:</strong> {supplier.phone}
                </div>
              </div>
            )}
          </section>

          {/* Items */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Danh sách sản phẩm</h3>

            {items.map((item, idx) => (
              <div
                key={idx}
                className="border rounded p-4 bg-gray-50 flex flex-col gap-3"
              >
                <div className="flex gap-3 w-full">
                  <div className="relative flex-1">
                    <Label>Sản phẩm</Label>
                    <Input
                      value={item.componentName}
                      onChange={(e) => {
                        setActiveItemIndex(idx);
                        setSearchTerm(e.target.value);
                        updateItem(idx, "componentName", e.target.value);
                      }}
                      placeholder="Tìm sản phẩm..."
                    />

                    {activeItemIndex === idx && componentResults.length > 0 && (
                      <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-40 overflow-auto mt-1">
                        {componentResults.map((c) => (
                          <li
                            key={c.id}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              updateItem(idx, "componentId", c.id);
                              updateItem(idx, "componentName", c.name);
                              setComponentResults([]);
                            }}
                          >
                            {c.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Button variant="destructive" onClick={() => removeItem(idx)}>
                    Xóa
                  </Button>
                </div>

                <div className="flex gap-4 items-center">
                  <div>
                    <Label>Số lượng</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          idx,
                          "quantity",
                          Math.max(0, parseInt(e.target.value || "0"))
                        )
                      }
                      className="w-24"
                    />
                  </div>

                  <div>
                    <Label>Giá nhập</Label>
                    <Input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          idx,
                          "price",
                          Math.max(0, parseFloat(e.target.value || "0"))
                        )
                      }
                      className="w-32"
                    />
                  </div>

                  <div className="ml-auto font-semibold">
                    Tổng: {Number(item.total).toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addItem}>
              + Thêm sản phẩm
            </Button>
          </section>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Quay lại
            </Button>

            <Button disabled={saving} onClick={handleCreateImport}>
              {saving ? "Đang lưu..." : "Tạo phiếu nhập"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
