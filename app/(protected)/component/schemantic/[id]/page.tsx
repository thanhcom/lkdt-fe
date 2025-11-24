"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SchematicMetadata from "@/components/SchematicMetadata";
import Link from "next/link";
import axios from "axios";

interface Schematic {
  id: number;
  schematicName: string;
  schematicFile?: string;
  schematicImages?: string[];
  description?: string;
  extra?: any;
}

export default function ComponentSchematicsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const componentid = params.id as string;

  const rawData = searchParams.get("data");
  const extraData = rawData ? JSON.parse(decodeURIComponent(rawData)) : null;

  const [loading, setLoading] = useState(true);
  const [schematics, setSchematics] = useState<Schematic[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSchematicIndex, setModalSchematicIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://api-lkdt.thanhcom.site/schematic/component/${componentid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Không lấy được dữ liệu schematic");

        const data = await res.json();
        let results: Schematic[] = data.data;

        if (extraData) {
          results = results.map((s) => ({ ...s, extra: extraData }));
        }

        setSchematics(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [componentid, token, rawData]);

  const handleDelete = async (schematicId: number) => {
    if (!confirm("Bạn có chắc muốn xóa Schematic này?")) return;
    try {
      await axios.delete(
        `https://api-lkdt.thanhcom.site/schematic/${schematicId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSchematics((prev) => prev.filter((s) => s.id !== schematicId));
      alert("Xóa schematic thành công!");
    } catch (err) {
      console.error(err);
      alert("Xóa schematic thất bại!");
    }
  };

  if (loading) return <p className="text-center py-10">Đang tải dữ liệu...</p>;

  if (!schematics || schematics.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-500 text-lg font-medium">
          Không tìm thấy sơ đồ nào
        </p>
        <Link
          href={`/schemantic/create?componentid=${componentid}`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Tạo mới Schematic
        </Link>
      </div>
    );

  const openModal = (schematicIdx: number, imageIdx: number) => {
    setModalSchematicIndex(schematicIdx);
    setModalImageIndex(imageIdx);
    setModalOpen(true);
  };

  const nextImage = () => {
    const images = schematics[modalSchematicIndex].schematicImages;
    if (!images) return;
    setModalImageIndex((modalImageIndex + 1) % images.length);
  };

  const prevImage = () => {
    const images = schematics[modalSchematicIndex].schematicImages;
    if (!images) return;
    setModalImageIndex((modalImageIndex + images.length - 1) % images.length);
  };

  const metadata = schematics.find((s) => s.extra)?.extra;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Thông tin Schematic Component
      </h1>

      {metadata && (
        <div className="mb-8">
          <SchematicMetadata data={metadata} />
        </div>
      )}

      {schematics.map((schematic, idx) => (
        <div key={schematic.id} className="mb-10 border p-4 rounded-md shadow">
          <h2 className="text-2xl font-bold mb-2">{schematic.schematicName}</h2>

          {schematic.schematicFile && (
            <Card className="mb-4">
              <CardContent>
                <a
                  href={schematic.schematicFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Mở File Sơ Đồ
                </a>
              </CardContent>
            </Card>
          )}

          {schematic.schematicImages &&
            schematic.schematicImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {schematic.schematicImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Schematic ${idx + 1} Image ${i + 1}`}
                    className="rounded shadow cursor-pointer hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onClick={() => openModal(idx, i)}
                  />
                ))}
              </div>
            )}

          {schematic.description && <p>{schematic.description}</p>}

          <div className="flex gap-2 mt-4">
            <Link href={`/schemantic/edit?sid=${schematic.id}`}>
              <Button >
                Update
              </Button>
            </Link>
            <Button
              
              onClick={() => handleDelete(schematic.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      {modalOpen && schematics[modalSchematicIndex].schematicImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <Button
            variant="outline"
            className="absolute top-4 right-4"
            onClick={() => setModalOpen(false)}
          >
            Đóng
          </Button>
          <Button
            variant="outline"
            className="absolute left-4"
            onClick={prevImage}
          >
            ←
          </Button>
          <img
            src={
              schematics[modalSchematicIndex].schematicImages[modalImageIndex]
            }
            alt={`Image ${modalImageIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-md shadow-2xl"
          />
          <Button
            variant="outline"
            className="absolute right-4"
            onClick={nextImage}
          >
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
