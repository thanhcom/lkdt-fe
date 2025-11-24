"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddSchematicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const componentid = searchParams.get("componentid") ?? "";

  const [form, setForm] = useState({
    schematicName: "",
    description: "",
    schematicFile: null as File | null,
    schematicImages: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const token = localStorage.getItem("token");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      if (name === "schematicFile") {
        setForm({ ...form, schematicFile: files[0] });
      } else if (name === "schematicImages") {
        setForm({ ...form, schematicImages: Array.from(files) });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    if (!token) {
      alert("Bạn chưa đăng nhập!");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("componentId", componentid);
      data.append("schematicName", form.schematicName);
      data.append("description", form.description);
      if (form.schematicFile) data.append("schematicFile", form.schematicFile);
      form.schematicImages.forEach((file) => data.append("schematicImages", file));

      await axios.post(
        `https://api-lkdt.thanhcom.site/schematic/create?componentid=${componentid}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      alert("Tạo Schematic thành công!");
      router.push("/component");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra khi tạo Schematic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-20">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Thêm Schematic Mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <Label htmlFor="componentId">Component ID</Label>
              <Input id="componentId" name="componentId" value={componentid} disabled />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="schematicName">Tên Schematic</Label>
              <Input
                id="schematicName"
                name="schematicName"
                value={form.schematicName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="schematicFile">File PDF Schematic</Label>
              <Input
                id="schematicFile"
                name="schematicFile"
                type="file"
                accept=".pdf"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="schematicImages">Ảnh Schematic</Label>
              <Input
                id="schematicImages"
                name="schematicImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
              />
            </div>

            {loading && (
              <div className="w-full bg-gray-200 rounded h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            {loading && <p className="text-sm text-center">{uploadProgress}%</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo Schematic"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
