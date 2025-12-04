"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface Order {
  customer: Customer;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: Item[];
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ComponentItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const recalcTotal = (items: Item[]) => items.reduce((sum, item) => sum + (item.total || 0), 0);

  useEffect(() => {
    const TOKEN = localStorage.getItem("token");
    if (!id || !TOKEN) {
      setError("ID đơn hàng hoặc token không hợp lệ");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`https://api-lkdt.thanhcom.site/orders/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const items: Item[] = data.data.items.map((i: any) => ({
          componentId: i.componentId,
          componentName: i.componentName,
          quantity: i.quantity,
          price: i.price,
          total: i.total || (i.quantity * i.price),
        }));

        setOrder({
          customer: data.data.customer,
          orderDate: data.data.orderDate,
          totalAmount: recalcTotal(items),
          status: data.data.status,
          items: items,
        });

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu. Vui lòng kiểm tra token và mạng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  useEffect(() => {
    const TOKEN = localStorage.getItem("token");
    if (!searchTerm || activeItemIndex === null) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-lkdt.thanhcom.site/components/search?q=${encodeURIComponent(searchTerm)}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSearchResults(data.data);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, activeItemIndex]);

  const handleStatusChange = (value: string) => {
    if (!order) return;
    setOrder({ ...order, status: value });
  };

  const handleItemChange = (idx: number, field: 'componentId' | 'componentName' | 'quantity' | 'price', value: any) => {
    if (!order) return;
    const newItems = [...order.items];

    if (field === 'componentId') {
      if (order.items.some((item, i) => i !== idx && item.componentId === value)) {
        alert('Sản phẩm này đã có trong đơn hàng!');
        return;
      }
    }

    newItems[idx][field] = value;

    if (field === 'quantity' || field === 'price') {
      newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
    }

    setOrder({ ...order, items: newItems, totalAmount: recalcTotal(newItems) });
  };

  const handleAddItem = () => {
    if (!order) return;
    const newItem: Item = { componentId: 0, componentName: '', quantity: 1, price: 0, total: 0 };
    const newItems = [...order.items, newItem];
    setOrder({ ...order, items: newItems, totalAmount: recalcTotal(newItems) });
    setActiveItemIndex(order.items.length);
  };

  const handleRemoveItem = (idx: number) => {
    if (!order) return;
    const newItems = order.items.filter((_, i) => i !== idx);
    setOrder({ ...order, items: newItems, totalAmount: recalcTotal(newItems) });
  };

  const handleSave = async () => {
    if (!order) return;
    const TOKEN = localStorage.getItem("token");
    if (!TOKEN) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    setSaving(true);
    try {
      const body = {
        status: order.status,
        items: order.items.map(i => ({
          componentId: i.componentId,
          quantity: i.quantity,
          price: i.price
        })),
      };
      const res = await fetch(`https://api-lkdt.thanhcom.site/orders/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      router.back();
    } catch (err) {
      console.error(err);
      alert("Lưu đơn hàng thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-lg rounded-lg border border-gray-200">
        <CardContent className="p-6 space-y-6">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa đơn hàng #{id}</h2>
            <span className="text-lg font-semibold text-blue-600">
              Tổng: {(order?.totalAmount ?? 0).toLocaleString("vi-VN")}đ
            </span>
          </div>

          {/* Customer info (readonly) */}
          <section className="space-y-2 border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-700">Thông tin khách hàng</h3>
            <div className="text-gray-800 grid grid-cols-2 gap-4">
              <div><span className="font-semibold">Họ và tên:</span> {order?.customer.fullName}</div>
              <div><span className="font-semibold">Số điện thoại:</span> {order?.customer.phone}</div>
              <div><span className="font-semibold">Email:</span> {order?.customer.email}</div>
              <div><span className="font-semibold">Địa chỉ:</span> {order?.customer.address}</div>
            </div>
          </section>

          {/* Order info */}
          <section className="space-y-2 border-b pb-4">
            <h3 className="font-semibold text-lg text-gray-700">Trạng thái đơn hàng</h3>
            <select
              value={order?.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              <option value="OK">Hoàn thành</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="CANCELLED">Hủy</option>
            </select>
          </section>

          {/* Items list */}
          <section className="space-y-4 relative">
            <h3 className="font-semibold text-lg text-gray-700">Sản phẩm</h3>
            <div className="space-y-3">
              {order?.items.map((i, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50 shadow-sm flex flex-col gap-3 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Label>Chọn sản phẩm</Label>
                      <Input
                        type="text"
                        value={i.componentName}
                        onChange={(e) => {
                          setActiveItemIndex(idx);
                          setSearchTerm(e.target.value);
                          handleItemChange(idx, 'componentName', e.target.value);
                        }}
                        placeholder="Gõ tên sản phẩm..."
                      />
                      {activeItemIndex === idx && searchResults.length > 0 && (
                        <ul className="border rounded max-h-40 overflow-auto bg-white absolute z-10 w-full mt-1">
                          {searchResults.map(c => (
                            <li key={c.id} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => {
                              handleItemChange(idx, 'componentId', c.id);
                              handleItemChange(idx, 'componentName', c.name);
                              setSearchResults([]);
                            }}>{c.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(idx)}>Xóa</Button>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col">
                      <Label>Số lượng</Label>
                      <Input type="number" value={i.quantity} min={0} onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)} className="w-24" />
                    </div>
                    <div className="flex flex-col">
                      <Label>Giá</Label>
                      <Input type="number" value={i.price} min={0} onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)} className="w-32" />
                    </div>
                    <div className="ml-auto font-semibold text-gray-800">Tổng: {(i.total ?? 0).toLocaleString("vi-VN")}đ</div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleAddItem} variant="outline">Thêm sản phẩm</Button>
          </section>

          {/* Actions */}
          <section className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Button>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}