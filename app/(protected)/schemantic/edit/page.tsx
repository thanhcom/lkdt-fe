"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UpdateSchematicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schematicId = searchParams.get("sid") ?? "";

  const [form, setForm] = useState({
    schematicName: "",
    description: "",
    schematicFile: null as File | null,
    schematicImages: [] as File[],
  });

  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!schematicId || !token) return;
      try {
        const res = await axios.get(`https://api-lkdt.thanhcom.site/schematic/${schematicId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;

        setForm({
          schematicName: data.schematicName || "",
          description: data.description || "",
          schematicFile: null,
          schematicImages: [],
        });

        setPreviewFile(data.schematicFile || null);
        setPreviewImages(data.schematicImages || []);
      } catch (err) {
        console.error(err);
        alert("Không tải được dữ liệu schematic!");
      }
    };
    fetchData();
  }, [schematicId, token]);

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
      data.append("schematicName", form.schematicName);
      data.append("description", form.description);
      if (form.schematicFile) data.append("schematicFile", form.schematicFile);
      form.schematicImages.forEach((file) => data.append("schematicImages", file));

      await axios.put(`https://api-lkdt.thanhcom.site/schematic/${schematicId}`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / (p.total ?? 1));
          setUploadProgress(percent);
        },
      });

      alert("Cập nhật schematic thành công!");
      router.back();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra khi cập nhật schematic");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex justify-center py-20">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Cập Nhật Schematic</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            <div className="flex flex-col">
              <Label htmlFor="schematicName">Tên Schematic</Label>
              <Input id="schematicName" name="schematicName" value={form.schematicName} onChange={handleChange} required />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="schematicFile">File PDF Schematic</Label>
              {previewFile && <a href={previewFile} target="_blank" className="text-blue-600 underline mb-1">Xem file hiện tại</a>}
              <Input id="schematicFile" name="schematicFile" type="file" accept=".pdf" onChange={handleChange} />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="schematicImages">Ảnh Schematic</Label>
              {previewImages.length > 0 && (
                <div className="flex gap-2 mb-1">
                  {previewImages.map((img, i) => (<img key={i} src={img} className="w-16 h-16 object-cover border" />))}
                </div>
              )}
              <Input id="schematicImages" name="schematicImages" type="file" accept="image/*" multiple onChange={handleChange} />
            </div>

            {loading && (
              <>
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-sm text-center">{uploadProgress}%</p>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? "Đang cập nhật..." : "Cập nhật"}</Button>
              <Button type="button" onClick={handleCancel}>Hủy</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}