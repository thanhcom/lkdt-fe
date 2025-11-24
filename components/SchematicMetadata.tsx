// components/SchematicMetadata.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

interface MetadataProps {
  data: {
    id: number;
    name: string;
    type?: string;
    manufacturer?: string;
    packageField?: string;
    unit?: string;
    stockQuantity?: number;
    location?: string;
    createdAt?: string;
  };
}

const SchematicMetadata: React.FC<MetadataProps> = ({ data }) => {
  return (
    <Card className="mb-6 shadow-lg border border-gray-200">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
          Thông tin linh kiện
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
          <p>
            <strong>Tên linh kiện:</strong> {data.name}
          </p>
          {data.type && (
            <p>
              <strong>Loại:</strong> {data.type}
            </p>
          )}
          {data.manufacturer && (
            <p>
              <strong>Hãng sản xuất:</strong> {data.manufacturer}
            </p>
          )}
          {data.packageField && (
            <p>
              <strong>Package:</strong> {data.packageField}
            </p>
          )}
          {data.unit && (
            <p>
              <strong>Đơn vị:</strong> {data.unit}
            </p>
          )}
          {data.stockQuantity !== undefined && (
            <p>
              <strong>Tồn kho:</strong> {data.stockQuantity}
            </p>
          )}
          {data.location && (
            <p>
              <strong>Vị trí:</strong> {data.location}
            </p>
          )}
          {data.createdAt && (
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(data.createdAt).toLocaleDateString("vi-VN")}
            </p>
          )}
        </div>
        {/*
        {data.id && (
          <Button
            className="mt-4 w-full"
            onClick={() => window.location.href = `/component/${data.id}`}
          >
            Xem chi tiết linh kiện
          </Button>
        )}
        */}
      </CardContent>
    </Card>
  );
};

export default SchematicMetadata;
