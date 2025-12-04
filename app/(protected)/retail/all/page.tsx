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

// ====================== TYPES =====================
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

// ====================== TABLE =====================
const OrdersTable = ({
  data,
  setData,
  sorting,
  setSorting,
}: {
  data: Order[];
  setData: React.Dispatch<React.SetStateAction<Order[]>>;
  sorting: SortingState;
  setSorting: (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => void;
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
        const s = row.getValue("status");
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
        <div className="flex flex-col gap-3">
          {row.original.items.map((i, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 text-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-1">
                <span className="font-semibold text-gray-700">Mã Linh Kiện:</span>{" "}
                {i.componentId}
              </div>
              <div className="mb-1">
                <span className="font-semibold text-gray-700">Tên Linh Kiện:</span>{" "}
                {i.componentName}
              </div>
              <div className="mb-1">
                <span className="font-semibold text-gray-700">Số lượng:</span>{" "}
                {i.quantity}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Đơn Giá:</span>{" "}
                {i.price.toLocaleString("vi-VN")}đ
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
                  alert("Xoá thành công!");
                  // --- UPDATE UI NGAY ---
                  setData((prev) => prev.filter((o) => o.id !== id));
                } else {
                  alert("Lỗi: " + json.error);
                }
              } catch (err) {
                console.error(err);
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
export default function OrdersPage() {
  const router = useRouter();

  const [data, setData] = useState<Order[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageInfo, setPageInfo] = useState<any>({
    currentPage: 1,
    totalPage: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [jumpPage, setJumpPage] = useState<number>(1);

  const [searchField, setSearchField] = useState<
    "keyword" | "minTotal" | "maxTotal" | "status" | "time"
  >("keyword");
  const [searchValue, setSearchValue] = useState<string>("");

  // time filter
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // ================= FETCH ORDERS =================
  const fetchPage = async (
    page: number,
    keyword: string = "",
    field: "keyword" | "minTotal" | "maxTotal" | "status" = "keyword",
    sortingState: SortingState = []
  ) => {
    try {
      const apiPage = page - 1;
      let query = `page=${apiPage}&size=20`;

      if (keyword.trim() !== "" && field !== "time") {
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

  // ================= FETCH TIME =================
  const fetchTime = async () => {
    if (!start || !end) return;

    const dateFromISO = new Date(start).toISOString();
    const dateToISO = new Date(end).toISOString();

    const url = `https://api-lkdt.thanhcom.site/orders/search?dateFrom=${encodeURIComponent(
      dateFromISO
    )}&dateTo=${encodeURIComponent(dateToISO)}`;
    console.log("Fetch Time URL:", url);

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const errJson = await res.json();
        console.error("Error:", errJson);
        alert(`Server trả lỗi: ${errJson.error}`);
        return;
      }
      const json = await res.json();
      setData(json.data || []);
      setPageInfo(json.pageInfo || pageInfo);
      setJumpPage(1);
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
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <button
          onClick={() => router.push("/retail/add")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Thêm đơn hàng
        </button>
      </div>

      <Card className="shadow-lg">
        <CardContent>
          {/* ================= SEARCH BAR ================= */}
          <div className="mb-4 flex items-center gap-2">
            <select
              className="border px-2 py-1 rounded"
              value={searchField}
              onChange={(e) =>
                setSearchField(
                  e.target.value as
                    | "keyword"
                    | "maxTotal"
                    | "minTotal"
                    | "status"
                    | "time"
                )
              }
            >
              <option value="keyword">Tên khách hàng / SDT</option>
              <option value="maxTotal">Max Total</option>
              <option value="minTotal">Min Total</option>
              <option value="status">Trạng thái</option>
              <option value="time">Theo thời gian</option>
            </select>

            {searchField !== "time" ? (
              <>
                <input
                  type="text"
                  placeholder="Nhập từ khóa..."
                  className="border px-2 py-1 rounded flex-1"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() =>
                    fetchPage(1, searchValue, searchField, sorting)
                  }
                >
                  Tìm kiếm
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
                  Tìm theo thời gian
                </button>
              </>
            )}
          </div>

          {/* ================= TABLE ================= */}
          <OrdersTable
            data={data}
            setData={setData} // <--- truyền setData để update UI
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
