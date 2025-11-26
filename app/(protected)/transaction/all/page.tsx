"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

export type Transaction = {
  id: number;
  transactionType: string;
  quantity: number;
  transactionDate: string;
  note: string;
  component: {
    name: string;
    type: string;
    stockQuantity: number;
  };
  project: {
    name: string;
    description: string;
  };
};

const columns: ColumnDef<Transaction>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "transactionType",
    header: "Loại",
    cell: ({ row }) => {
      const type = row.getValue("transactionType");
      return (
        <span
          className={type === "IN" ? "text-green-600 font-bold" : "text-red-600 font-bold"}
        >
          {type}
        </span>
      );
    },
  },
  { accessorKey: "quantity", header: "Số lượng" },
  {
    accessorKey: "transactionDate",
    header: "Ngày",
    cell: ({ row }) => new Date(row.getValue("transactionDate")).toLocaleString(),
  },
  { accessorKey: "note", header: "Ghi chú" },
  {
    id: "component",
    header: "Linh kiện",
    cell: ({ row }) => {
      const c = row.original.component;
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{c.name}</span>
          <span className="text-sm text-gray-500">{c.type}</span>
          <span className="text-sm">Tồn kho: {c.stockQuantity}</span>
        </div>
      );
    },
  },
  {
    id: "project",
    header: "Dự án",
    cell: ({ row }) => {
      const p = row.original.project;
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{p.name}</span>
          <span className="text-sm text-gray-500">{p.description}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded"
            onClick={() => alert(`Edit transaction ${row.original.id}`)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white rounded"
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xoá transaction ${row.original.id}?`)) {
                alert(`Deleted transaction ${row.original.id}`);
                // TODO: gọi API delete ở đây và refresh dữ liệu
              }
            }}
          >
            Delete
          </button>
        </div>
      );
    },
  },
];

function TransactionTable({
  data,
  sorting,
  setSorting,
}: {
  data: Transaction[];
  sorting: SortingState;
  setSorting: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
}) {
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
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              const sort = sorting.find(s => s.id === header.id);
              return (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={() => {
                    const current = sorting.find(s => s.id === header.id);
                    const newDesc = current ? !current.desc : false;
                    setSorting([{ id: header.id, desc: newDesc }]);
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {sort && (
                    <span
                      className="inline-block transition-transform duration-200 ml-1"
                      style={{ transform: sort.desc ? "rotate(0deg)" : "rotate(180deg)" }}
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
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function TransactionPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [pageInfo, setPageInfo] = useState<any>({
    currentPage: 1,
    totalPage: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [jumpPage, setJumpPage] = useState<number>(1);

  // Search nâng cao
  const [searchField, setSearchField] = useState<"componentName" | "type">("componentName");
  const [searchValue, setSearchValue] = useState<string>("");

  const fetchPage = async (
    page: number,
    keyword: string = "",
    field: "componentName" | "type" = "componentName",
    sortingState: SortingState = []
  ) => {
    try {
      const sortQuery =
        sortingState.length > 0
          ? `&sortField=${sortingState[0].id}&sortOrder=${sortingState[0].desc ? "desc" : "asc"}`
          : "";

      const res = await fetch(
        `https://api-lkdt.thanhcom.site/transaction/all?page=${page}&searchField=${field}&search=${keyword}${sortQuery}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const json = await res.json();
      setData(json.data || []);
      setPageInfo(
        json.pageInfo || { currentPage: page, totalPage: 1, hasNext: false, hasPrevious: false }
      );
      setJumpPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý giao dịch</h1>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => alert("Open Add Transaction Modal")}
        >
          Thêm mới
        </button>
      </div>

      <Card className="shadow-lg">
        <CardContent>
          {/* Search nâng cao */}
          <div className="mb-4 flex items-center gap-2">
            <select
              className="border px-2 py-1 rounded"
              value={searchField}
              onChange={e => setSearchField(e.target.value as "componentName" | "type")}
            >
              <option value="componentName">Tên linh kiện</option>
              <option value="type">Loại Giao Dịch</option>
            </select>

            <input
              type="text"
              placeholder="Nhập từ khóa..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="border px-2 py-1 rounded flex-1"
            />

            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => fetchPage(1, searchValue, searchField, sorting)}
            >
              Tìm kiếm
            </button>
          </div>

          <TransactionTable data={data} sorting={sorting} setSorting={setSorting} />

          {/* Pagination */}
          <div className="flex items-center gap-2 mt-4">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={!pageInfo.hasPrevious}
              onClick={() => fetchPage(pageInfo.currentPage - 1, searchValue, searchField, sorting)}
            >
              Previous
            </button>

            <span>Page </span>
            <input
              type="number"
              value={jumpPage}
              min={1}
              max={pageInfo.totalPage}
              onChange={e => setJumpPage(Number(e.target.value))}
              className="w-16 border px-2 py-1 rounded"
            />
            <button
              className="px-3 py-1 border rounded"
              onClick={() => fetchPage(jumpPage, searchValue, searchField, sorting)}
            >
              Go
            </button>

            <span>/ {pageInfo.totalPage}</span>

            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={!pageInfo.hasNext}
              onClick={() => fetchPage(pageInfo.currentPage + 1, searchValue, searchField, sorting)}
            >
              Next
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
