"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SchematicMetadata from "@/components/SchematicMetadata";
import Link from "next/link";
import axios from "axios";
import { SchematicType } from "@/types/SchematicType";

export default function ComponentSchematicsPage() {
  const { id: componentId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawData = searchParams.get("data");
  const extraData = rawData ? JSON.parse(decodeURIComponent(rawData)) : null;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [loading, setLoading] = useState(true);
  const [schematics, setSchematics] = useState<SchematicType[]>([]);

  const [modal, setModal] = useState({
    open: false,
    schematicIndex: 0,
    imageIndex: 0,
  });

  /** FETCH */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://api-lkdt.thanhcom.site/schematic/component/${componentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Không lấy được dữ liệu schematic");

        let results: SchematicType[] = (await res.json()).data;

        if (extraData) {
          results = results.map((item) => ({ ...item, extra: extraData }));
        }

        setSchematics(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [componentId, token, rawData]);

  /** MODAL */
  const openModal = useCallback((scheIdx: number, imgIdx: number) => {
    setModal({ open: true, schematicIndex: scheIdx, imageIndex: imgIdx });
  }, []);

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const changeImage = (direction: number) => {
    const images = schematics[modal.schematicIndex].schematicImages;
    if (!images) return;

    setModal((m) => ({
      ...m,
      imageIndex: (m.imageIndex + direction + images.length) % images.length,
    }));
  };

  /** DELETE */
  const handleDelete = async (schematicId: number) => {
    if (!confirm("Bạn có chắc muốn xóa Schematic này?")) return;

    try {
      await axios.delete(`https://api-lkdt.thanhcom.site/schematic/${schematicId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchematics((prev) => prev.filter((s) => s.id !== schematicId));
      alert("Xóa schematic thành công!");
    } catch (err) {
      console.error(err);
      alert("Xóa schematic thất bại!");
    }
  };

  /** EMPTY STATE */
  if (loading) return <p className="text-center py-10">Đang tải dữ liệu...</p>;

  if (schematics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-500 text-lg font-medium">Không tìm thấy sơ đồ nào</p>

        <Link
          href={`/schemantic/create?componentid=${componentId}`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Tạo mới Schematic
        </Link>
      </div>
    );
  }

  /** UI */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Thông tin Schematic Component</h1>

      <div className="mb-8">
        <SchematicMetadata />
      </div>

      {schematics.map((item, idx) => (
        <div key={item.id} className="mb-10 border p-4 rounded-md shadow">
          <h2 className="text-2xl font-bold mb-2">{item.schematicName}</h2>

          {/* FILE */}
          {item.schematicFile && (
            <Card className="mb-4">
              <CardContent>
                <a href={item.schematicFile} target="_blank" className="text-blue-600 underline">
                  Mở File Sơ Đồ
                </a>
              </CardContent>
            </Card>
          )}

          {/* IMAGES */}
          {item.schematicImages?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {item.schematicImages.map((img, i) => (
                <div key={i} className="relative w-full h-64">
                  <Image
                    src={img}
                    alt={`Schematic ${idx + 1} Image ${i + 1}`}
                    fill
                    className="rounded shadow object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openModal(idx, i)}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {item.description && <p>{item.description}</p>}

          <div className="flex gap-2 mt-4">
            <Link href={`/schemantic/edit?sid=${item.id}`}>
              <Button>Update</Button>
            </Link>
            <Button onClick={() => handleDelete(item.id)}>Delete</Button>
          </div>
        </div>
      ))}

      {/* MODAL */}
      {modal.open && schematics[modal.schematicIndex].schematicImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <Button variant="outline" className="absolute top-4 right-4" onClick={closeModal}>
            Đóng
          </Button>

          <Button variant="outline" className="absolute left-4" onClick={() => changeImage(-1)}>
            ←
          </Button>

          <div className="relative w-[90vw] h-[90vh]">
            <Image
              src={
                schematics[modal.schematicIndex].schematicImages![modal.imageIndex]
              }
              alt="Modal image"
              fill
              className="object-contain rounded-md"
            />
          </div>

          <Button variant="outline" className="absolute right-4" onClick={() => changeImage(1)}>
            →
          </Button>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button variant="outline" onClick={() => router.back()}>
          ← Quay lại
        </Button>
      </div>
    </div>
  );
}
