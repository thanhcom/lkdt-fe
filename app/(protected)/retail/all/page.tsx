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
export type Order = {
  id: number;
  customer: {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    address: string;
  };
  orderDate: string;
  totalAmount: number;
  status: string;
  items: {
    componentId: number;
    componentName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
};

type PageInfo = {
  currentPage: number;
  totalPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

/* ====================== TABLE ===================== */
const OrdersTable = ({
  data,
  setData,
  sorting,
  setSorting,
  loading,
}: {
  data: Order[];
  setData: React.Dispatch<React.SetStateAction<Order[]>>;
  sorting: SortingState;
  setSorting: (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => void;
  loading: boolean;
}) => {
  const router = useRouter();

  const columns: ColumnDef<Order>[] = [
    { accessorKey: "id", header: "ID" },
    {
      id: "customer",
      header: "Khách hàng",
      cell: ({ row }) => {
        const c = row.original.customer;
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{c.fullName}</span>
            <span className="text-sm">{c.phone}</span>
            <span className="text-sm text-gray-500">{c.address}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "orderDate",
      header: "Ngày đặt",
      cell: ({ row }) =>
        new Date(row.getValue("orderDate")).toLocaleString("vi-VN"),
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng tiền",
      cell: ({ row }) =>
        Number(row.getValue("totalAmount")).toLocaleString("vi-VN") + " đ",
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const s = row.getValue("status") as string;
        const color =
          s === "OK"
            ? "text-green-600"
            : s === "PENDING"
            ? "text-yellow-600"
            : "text-red-600";
        return <span className={`font-bold ${color}`}>{s}</span>;
      },
    },
    {
      id: "items",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          {row.original.items.map((i, idx) => (
            <div
              key={idx}
              className="border rounded p-2 text-sm bg-white shadow-sm"
            >
              <div>
                <b>Mã:</b> {i.componentId}
              </div>
              <div>
                <b>Tên:</b> {i.componentName}
              </div>
              <div>
                <b>Số lượng:</b> {i.quantity}
              </div>
              <div>
                <b>Đơn giá:</b>{" "}
                {i.price.toLocaleString("vi-VN")} đ
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded"
            onClick={() => router.push(`/retail/edit/${row.original.id}`)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 bg-red-600 text-white rounded"
            onClick={async () => {
              const id = row.original.id;
              if (!confirm(`Xoá đơn hàng ${id}?`)) return;

              try {
                const res = await fetch(
                  `https://api-lkdt.thanhcom.site/orders/delete/${id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                const json = await res.json();

                if (res.ok) {
                  setData((prev) => prev.filter((o) => o.id !== id));
                  alert("Xoá thành công!");
                } else {
                  alert("Lỗi: " + json.error);
                }
              } catch {
                alert("Có lỗi khi xoá đơn hàng!");
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
                    const current = sorting.find(
                      (s) => s.id === header.id
                    );
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
              Không có đơn hàng
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
export default function OrdersPage() {
  const router = useRouter();

  const [data, setData] = useState<Order[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);

  const [pageInfo, setPageInfo] = useState<PageInfo>({
    currentPage: 1,
    totalPage: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [jumpPage, setJumpPage] = useState(1);

  const [searchField, setSearchField] = useState<
    "keyword" | "minTotal" | "maxTotal" | "status" | "time"
  >("keyword");
  const [searchValue, setSearchValue] = useState("");

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  /* ================= FETCH ================= */
  const fetchPage = async (
    page: number,
    keyword = searchValue,
    field:
      | "keyword"
      | "minTotal"
      | "maxTotal"
      | "status" = searchField,
    sortingState: SortingState = sorting
  ) => {
    setLoading(true);
    try {
      const apiPage = page - 1;
      let query = `page=${apiPage}&size=20`;

      if (keyword.trim()) {
        query += `&${field}=${encodeURIComponent(keyword.trim())}`;
      }

      if (sortingState.length > 0) {
        const s = sortingState[0];
        query += `&sort=${s.id},${s.desc ? "desc" : "asc"}`;
      } else {
        query += `&sort=id,desc`;
      }

      const res = await fetch(
        `https://api-lkdt.thanhcom.site/orders/search?${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const json = await res.json();
      setData(json.data || []);
      setPageInfo(json.pageInfo || pageInfo);
      setJumpPage(page);
    } finally {
      setLoading(false);
    }
  };

  const fetchTime = async () => {
    if (!start || !end) return;

    setLoading(true);
    try {
      const from = new Date(start).toISOString();
      const to = new Date(end).toISOString();

      const res = await fetch(
        `https://api-lkdt.thanhcom.site/orders/search?dateFrom=${encodeURIComponent(
          from
        )}&dateTo=${encodeURIComponent(to)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const json = await res.json();
      setData(json.data || []);
      setPageInfo(json.pageInfo || pageInfo);
      setJumpPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  /* sort đổi → fetch lại */
  useEffect(() => {
    fetchPage(1);
  }, [sorting]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <button
          onClick={() => router.push("/retail/add")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Thêm đơn hàng
        </button>
      </div>

      <Card>
        <CardContent>
          {/* SEARCH */}
          <div className="mb-4 flex items-center gap-2">
            <select
              className="border px-2 py-1 rounded"
              value={searchField}
              onChange={(e) =>
                setSearchField(
                  e.target.value as
                    | "keyword"
                    | "minTotal"
                    | "maxTotal"
                    | "status"
                    | "time"
                )
              }
            >
              <option value="keyword">Tên / SDT</option>
              <option value="maxTotal">Max Total</option>
              <option value="minTotal">Min Total</option>
              <option value="status">Trạng thái</option>
              <option value="time">Theo thời gian</option>
            </select>

            {searchField !== "time" ? (
              <>
                <input
                  className="border px-2 py-1 rounded flex-1"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => fetchPage(1)}
                >
                  Tìm
                </button>
              </>
            ) : (
              <>
                <input
                  type="datetime-local"
                  className="border px-2 py-1 rounded"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
                <input
                  type="datetime-local"
                  className="border px-2 py-1 rounded"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={fetchTime}
                >
                  Tìm
                </button>
              </>
            )}
          </div>

          <OrdersTable
            data={data}
            setData={setData}
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

            <input
              type="number"
              className="w-14 border px-2 py-1 rounded"
              min={1}
              max={pageInfo.totalPage}
              value={jumpPage}
              onChange={(e) => setJumpPage(Number(e.target.value))}
            />

            <button
              disabled={loading}
              className="px-3 py-1 border rounded"
              onClick={() => fetchPage(jumpPage)}
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
