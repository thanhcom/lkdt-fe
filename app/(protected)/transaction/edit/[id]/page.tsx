"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { ComponentData } from "@/types/ComponentData";
import { ProjectType } from "@/types/ProjectType";

type TransactionType = {
  id: number;
  transactionType: string;
  quantity: number;
  transactionDate: string;
  note: string;
  component: ComponentData;
  project: ProjectType;
};

export default function EditTransaction() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id;

  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const [loading, setLoading] = useState(true);

  const [transactionType, setTransactionType] = useState("IN");
  const [quantity, setQuantity] = useState(0);
  const [transactionDate, setTransactionDate] = useState("");
  const [note, setNote] = useState("");

  const [componentSearch, setComponentSearch] = useState("");
  const [componentOptions, setComponentOptions] = useState<ComponentData[]>([]);
  const [component, setComponent] = useState<ComponentData | null>(null);

  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [project, setProject] = useState<ProjectType | null>(null);

  // Load transaction
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/transaction/${transactionId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const json = await res.json();
        if (res.ok && json.data) {
          const t = json.data;
          setTransaction(t);
          setTransactionType(t.transactionType);
          setQuantity(t.quantity);
          setTransactionDate(t.transactionDate);
          setNote(t.note);
          setComponent(t.component);
          setComponentSearch(t.component?.name || "");
          setProject(t.project);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [transactionId]);

  // Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("https://api-lkdt.thanhcom.site/project/all", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const json = await res.json();
        if (res.ok && Array.isArray(json.data)) setProjects(json.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  // Component search
  useEffect(() => {
    if (!componentSearch) {
      setComponentOptions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/components/search?keyword=${encodeURIComponent(
            componentSearch
          )}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const json = await res.json();
        if (res.ok && Array.isArray(json.data)) setComponentOptions(json.data);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [componentSearch]);

  const handleSubmit = async () => {
    if (!component) return alert("Chưa chọn component");
    if (!project) return alert("Chưa chọn project");

    const payload = {
      transactionType,
      quantity,
      transactionDate,
      note,
      component,
      project,
    };

    try {
      const res = await fetch(
        `https://api-lkdt.thanhcom.site/transaction/update/${transactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();

      if (res.ok) {
        alert("Cập nhật thành công!");
        router.back();
      } else alert("Lỗi: " + JSON.stringify(json));
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra!");
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  if (!transaction) return <div className="p-4 text-center">Không tìm thấy dữ liệu</div>;

  const formattedDate = transactionDate?.substring(0, 16) || "";

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-8 shadow-lg">
      <CardContent className="space-y-5">
        <h2 className="text-2xl font-bold text-center mb-4">
          Chỉnh sửa Transaction
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Transaction Type</Label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>

          <div>
            <Label>Số lượng</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Ngày giao dịch</Label>
            <Input
              type="datetime-local"
              value={formattedDate}
              onChange={(e) =>
                setTransactionDate(new Date(e.target.value).toISOString())
              }
            />
          </div>

          <div>
            <Label>Ghi chú</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Component</Label>
          <Input
            placeholder="Gõ tên component..."
            value={componentSearch}
            onChange={(e) => {
              setComponentSearch(e.target.value);
              setComponent(null);
            }}
          />

          {componentOptions.length > 0 && (
            <ul className="border rounded max-h-44 overflow-y-auto bg-white mt-1">
              {componentOptions.map((c) => (
                <li
                  key={c.id}
                  className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setComponent(c);
                    setComponentSearch(c.name);
                    setComponentOptions([]);
                  }}
                >
                  {c.name} ({c.type}) - Tồn kho: {c.stockQuantity}
                </li>
              ))}
            </ul>
          )}
        </div>

        {component && (
          <div className="p-4 border rounded bg-gray-50 mt-2 space-y-1">
            <p className="font-semibold text-lg">
              {component.name} ({component.type})
            </p>
            <p>Hãng: {component.manufacturer}</p>
            <p>Package: {component.packageField}</p>
            <p>Đơn vị: {component.unit}</p>
            <p>Tồn kho: {component.stockQuantity}</p>
            <p>Vị trí: {component.location}</p>
            <p>
              Ngày tạo:{" "}
              {new Date(component.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <p>Mô tả: {component.specification}</p>
          </div>
        )}

        <div>
          <Label>Project</Label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={project?.id ?? ""}
            onChange={(e) => {
              const selected =
                projects.find((p) => p.id === Number(e.target.value)) || null;
              setProject(selected);
            }}
          >
            <option value="">-- Chọn Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✨ 2 nút dưới cùng – Căn phải – Style thống nhất */}
        <section className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
          <Button onClick={handleSubmit}>
            Lưu thay đổi
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}
