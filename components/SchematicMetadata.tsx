// components/SchematicMetadata.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const SchematicMetadata: React.FC = () => {
  const component = useSelector((state: RootState) => state.component.component);

  if (!component) return null; // fallback nếu chưa có component

  return (
    <Card className="mb-6 shadow-lg border border-gray-200">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
          Thông tin linh kiện
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
          <p>
            <strong>Tên linh kiện:</strong> {component.name}
          </p>
          {component.type && (
            <p>
              <strong>Loại:</strong> {component.type}
            </p>
          )}
          {component.manufacturer && (
            <p>
              <strong>Hãng sản xuất:</strong> {component.manufacturer}
            </p>
          )}
          {component.packageField && (
            <p>
              <strong>Package:</strong> {component.packageField}
            </p>
          )}
          {component.unit && (
            <p>
              <strong>Đơn vị:</strong> {component.unit}
            </p>
          )}
          {component.stockQuantity !== undefined && (
            <p>
              <strong>Tồn kho:</strong> {component.stockQuantity}
            </p>
          )}
          {component.location && (
            <p>
              <strong>Vị trí:</strong> {component.location}
            </p>
          )}
          {component.createdAt && (
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(component.createdAt).toLocaleDateString("vi-VN")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchematicMetadata;
