"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";

/* ====================== TYPES ===================== */
export type Supplier = {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

/* ====================== TABLE ===================== */
const SupplierTable = ({
  data,
  sorting,
  setSorting,
  loading,
}: {
  data: Supplier[];
  sorting: SortingState;
  setSorting: (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => void;
  loading: boolean;
}) => {
  const router = useRouter();

  const columns: ColumnDef<Supplier>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Tên NCC" },
    { accessorKey: "phone", header: "SDT" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "address", header: "Địa chỉ" },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleString("vi-VN"),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => router.push(`/supplier/edit/${row.original.id}`)}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded"
            onClick={async () => {
              const id = row.original.id;
              if (!confirm(`Xoá Supplier ${id}?`)) return;

              const res = await fetch(
                `https://api-lkdt.thanhcom.site/supplier/delete/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              if (res.ok) {
                alert("Xoá thành công!");
                location.reload();
              } else {
                const j = await res.json();
                alert("Lỗi: " + j.error);
              }
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((header) => {
              const sort = sorting.find((s) => s.id === header.id);

              return (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={() => {
                    const current = sorting.find((s) => s.id === header.id);
                    const newDesc = current ? !current.desc : false;
                    setSorting([{ id: header.id, desc: newDesc }]);
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {sort && (
                    <span
                      className="ml-1 inline-block"
                      style={{
                        transform: sort.desc
                          ? "rotate(0deg)"
                          : "rotate(180deg)",
                      }}
                    >
                      🔽
                    </span>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6">
              Đang tải...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6">
              Không có dữ liệu
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

/* ====================== PAGE ===================== */
export default function SupplierPage() {
  const router = useRouter();

  const [data, setData] = useState<Supplier[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);

  const [pageInfo, setPageInfo] = useState<any>({
    currentPage: 1,
    totalPage: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [jumpPage, setJumpPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  /* ================= FETCH ================= */
  const fetchPage = async (page: number, keywordValue = keyword) => {
    setLoading(true);
    try {
      const apiPage = page - 1;
      let query = `page=${apiPage}&size=20`;

      if (keywordValue.trim() !== "") {
        query += `&keyword=${encodeURIComponent(keywordValue.trim())}`;
      }

      const res = await fetch(
        `https://api-lkdt.thanhcom.site/supplier/search?${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const json = await res.json();

      setData(json.data || []);
      setPageInfo(json.pageInfo || {});
      setJumpPage(page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Quản lý Nhà Cung Cấp</h1>
        <button
          className="px-4 py-2 bg-green-700 text-white rounded"
          onClick={() => router.push("/supplier/add")}
        >
          Thêm NCC
        </button>
      </div>

      <Card className="shadow-md">
        <CardContent>
          {/* SEARCH */}
          <div className="flex items-center gap-2 mb-4">
            <input
              className="border px-2 py-1 rounded w-full"
              placeholder="Tên / SDT / Email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => fetchPage(1)}
            >
              Tìm
            </button>
          </div>

          <SupplierTable
            data={data}
            sorting={sorting}
            setSorting={setSorting}
            loading={loading}
          />

          {/* PAGINATION */}
          <div className="flex items-center gap-2 mt-4">
            <button
              disabled={!pageInfo.hasPrevious || loading}
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => fetchPage(pageInfo.currentPage - 1)}
            >
              Previous
            </button>

            <span>Page</span>
            <input
              type="number"
              className="w-16 border rounded px-2 py-1"
              min={1}
              max={pageInfo.totalPage}
              value={jumpPage}
              onChange={(e) => setJumpPage(Number(e.target.value))}
            />

            <button
              className="px-3 py-1 border rounded"
              onClick={() => fetchPage(jumpPage)}
              disabled={loading}
            >
              Go
            </button>

            <span>/ {pageInfo.totalPage}</span>

            <button
              disabled={!pageInfo.hasNext || loading}
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => fetchPage(pageInfo.currentPage + 1)}
            >
              Next
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
