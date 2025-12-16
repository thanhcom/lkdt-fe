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
import { Customer } from "@/types/CustomerType";

// ====================== TABLE =====================
const CustomerTable = ({
  data,
  setData,
  sorting,
  setSorting,
}: {
  data: Customer[];
  setData: React.Dispatch<React.SetStateAction<Customer[]>>;
  sorting: SortingState;
  setSorting: (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => void;
}) => {
  const router = useRouter();

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "fullName",
      header: "Tên khách hàng",
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded"
            onClick={() => router.push(`/customer/edit/${row.original.id}`)}
          >
            Edit
          </button>

          <button
            className="px-2 py-1 bg-red-600 text-white rounded"
            onClick={async () => {
              const id = row.original.id;
              if (!confirm(`Xoá khách hàng ${id}?`)) return;
              try {
                const res = await fetch(
                  `https://api-lkdt.thanhcom.site/customer/${id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                const json = await res.json();
                if (res.ok) {
                  alert("Xoá thành công!");
                  setData((prev) => prev.filter((c) => c.id !== id));
                } else {
                  alert("Lỗi: " + json.error);
                }
              } catch (err) {
                console.error(err);
                alert("Có lỗi khi xoá khách hàng!");
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
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
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
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// ====================== PAGE =====================
export default function CustomerPage() {
  const router = useRouter();

  const [data, setData] = useState<Customer[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageInfo, setPageInfo] = useState<any>({
    currentPage: 1,
    totalPage: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [jumpPage, setJumpPage] = useState<number>(1);

  const [keyword, setKeyword] = useState("");

  // ================= FETCH CUSTOMER =================
  const fetchPage = async (
    page: number,
    keywordString: string = "",
    sortingState: SortingState = []
  ) => {
    try {
      const apiPage = page - 1;
      let query = `page=${apiPage}&size=20`;

      if (keywordString.trim() !== "") {
        query += `&keyword=${encodeURIComponent(keywordString.trim())}`;
      }

      if (sortingState.length > 0) {
        const s = sortingState[0];
        query += `&sort=${s.id},${s.desc ? "desc" : "asc"}`;
      } else {
        query += `&sort=id,desc`;
      }

      const res = await fetch(
        `https://api-lkdt.thanhcom.site/customer/search?${query}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const json = await res.json();

      setData(json.data || []);
      setPageInfo(json.pageInfo);
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
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        <button
          onClick={() => router.push("/customer/create")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Thêm khách hàng
        </button>
      </div>

      <Card className="shadow-lg">
        <CardContent>
          {/* ================= SEARCH BAR ================= */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên / SĐT / email / địa chỉ..."
              className="border px-2 py-1 rounded flex-1"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => fetchPage(1, keyword, sorting)}
            >
              Tìm kiếm
            </button>
          </div>

          {/* ================= TABLE ================= */}
          <CustomerTable
            data={data}
            setData={setData}
            sorting={sorting}
            setSorting={setSorting}
          />

          {/* ================= PAGINATION ================= */}
          <div className="flex items-center gap-2 mt-4">
            <button
              disabled={!pageInfo.hasPrevious}
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => fetchPage(pageInfo.currentPage - 1)}
            >
              Previous
            </button>
            <span>Page</span>
            <input
              type="number"
              className="w-14 border px-2 py-1 rounded"
              min={1}
              max={pageInfo.totalPage}
              value={jumpPage}
              onChange={(e) => setJumpPage(Number(e.target.value))}
            />
            <button
              className="px-3 py-1 border rounded"
              onClick={() => fetchPage(jumpPage)}
            >
              Go
            </button>
            <span>/ {pageInfo.totalPage}</span>
            <button
              disabled={!pageInfo.hasNext}
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
