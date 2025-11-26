"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ProjectType } from "@/types/ProjectType";


export default function AddTransaction() {
  const router = useRouter();
  const component = useSelector((state: RootState) => state.component.component);

  const [transactionType, setTransactionType] = useState("IN");
  const [quantity, setQuantity] = useState(0);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString());
  const [note, setNote] = useState("");

  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [project, setProject] = useState<ProjectType | null>(null);
  const [searchText, setSearchText] = useState("");

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("https://api-lkdt.thanhcom.site/project/all", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const json = await res.json();
        if (res.ok) setProjects(json.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

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
      const res = await fetch("https://api-lkdt.thanhcom.site/transaction/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        alert("Tạo transaction thành công!");
        router.push("/transaction/all"); // redirect về danh sách
      } else alert("Lỗi: " + JSON.stringify(json));
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
  };

  return (
    <Card className="p-4 max-w-3xl mx-auto">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-center mb-4">Tạo Transaction</h2>

        <div>
          <Label>Transaction Type</Label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
          >
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
        </div>

        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div>
          <Label>Transaction Date</Label>
          <Input
            type="datetime-local"
            value={transactionDate.slice(0, 16)}
            onChange={(e) => setTransactionDate(new Date(e.target.value).toISOString())}
          />
        </div>

        <div>
          <Label>Note</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="font-bold mt-2">Component Info</div>
        {component ? (
          <div className="p-4 border rounded bg-gray-50 space-y-1">
            <p><strong>{component.name}</strong> ({component.type})</p>
            <p>Manufacturer: {component.manufacturer}</p>
            <p>Package: {component.packageField}</p>
            <p>Unit: {component.unit}</p>
            <p>Stock: {component.stockQuantity}</p>
            <p>Location: {component.location}</p>
            <p>Created At: {new Date(component.createdAt).toLocaleDateString("vi-VN")}</p>
            <p>Specification: {component.specification}</p>
          </div>
        ) : (
          <p className="text-red-500">Chưa có component</p>
        )}

        <div className="font-bold mt-4">Project</div>
        <Label>Chọn Project</Label>
        <Input
          placeholder="Gõ tên project..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {filteredProjects.length > 0 && (
          <ul className="border rounded mt-1 max-h-40 overflow-y-auto bg-white">
            {filteredProjects.map((p) => (
              <li
                key={p.id}
                className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setProject(p);
                  setSearchText(p.name);
                }}
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}

        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={() => router.push("/project/new")}
        >
          Tạo Project Mới
        </Button>

        <Button onClick={handleSubmit} className="mt-4 w-full">
          Tạo Transaction
        </Button>
      </CardContent>
    </Card>
  );
}
