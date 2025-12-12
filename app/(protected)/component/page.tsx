"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { setComponent } from "@/store/slices/componentSlice";

// Kiểu dữ liệu ComponentItem
export type ComponentItem = {
  id: number;
  name: string;
  type: string;
  specification: string;
  manufacturer: string;
  packageField: string;
  unit: string;
  stockQuantity: number;
  location: string;
  createdAt: string;
};

export default function Page() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [data, setData] = React.useState<ComponentItem[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalElement, setTotalElement] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // FILTER
  const [filters, setFilters] = React.useState({
    keyword: "",
    id: "",
    stockQuantity: "",
  });

  // Columns
  const columns: ColumnDef<ComponentItem>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = row.getIsSomeSelected();
            }}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Name <ArrowUpDown />
          </Button>
        ),
      },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "manufacturer", header: "Manufacturer" },
      {
        accessorKey: "stockQuantity",
        header: "Stock Qty",
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("stockQuantity")}</div>
        ),
      },
      { accessorKey: "location", header: "Location" },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) =>
          new Date(row.getValue("createdAt")).toLocaleString(),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <button
                    className="w-full text-left"
                    onClick={() => {
                      dispatch(setComponent(item));
                      router.push(`/schemantic/${item.id}`);
                    }}
                  >
                    Schematic
                  </button>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <button
                    className="w-full text-left"
                    onClick={() => {
                      dispatch(setComponent(item));
                      router.push(`/transaction/create`);
                    }}
                  >
                    Transaction
                  </button>
                </DropdownMenuItem>

                <div className="my-1 border-t border-gray-200" />

                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(String(item.id))}
                >
                  Detail
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      router.push(`/component/${item.id}/edit`)
                    }
                  >
                    Edit
                  </button>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      router.push(`/component/${item.id}/delete`)
                    }
                  >
                    Delete
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [dispatch, router]
  );

  // React Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  // ==========================
  // FETCH DATA (SERVER SIDE)
  // ==========================
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const params = new URLSearchParams({
        page: String(currentPage - 1),
        size: "20",
      });

      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.id) params.append("id", filters.id);
      if (filters.stockQuantity)
        params.append("stockQuantity", filters.stockQuantity);

      const url = `https://api-lkdt.thanhcom.site/components/search?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      setData(json.data || []);
      setTotalPages(json.pageInfo?.totalPage || 1);
      setTotalElement(json.pageInfo?.totalElement || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page changes
  React.useEffect(() => {
    fetchData();
  }, [currentPage]);

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">

      {/* FILTER UI */}
      <div className="flex gap-4 py-4 items-end flex-wrap">

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Keyword</label>
          <Input
            placeholder="Tên, loại, hãng..."
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            className="w-64"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">ID</label>
          <Input
            placeholder="ID linh kiện"
            value={filters.id}
            onChange={(e) => setFilters({ ...filters, id: e.target.value })}
            className="w-32"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Stock ≥</label>
          <Input
            placeholder="Số lượng"
            value={filters.stockQuantity}
            onChange={(e) =>
              setFilters({ ...filters, stockQuantity: e.target.value })
            }
            className="w-32"
          />
        </div>

        <Button
          className="h-10"
          onClick={() => {
            setCurrentPage(1);
            fetchData();
          }}
        >
          🔍 Tìm Kiếm
        </Button>

        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            setFilters({ keyword: "", id: "", stockQuantity: "" });
            setCurrentPage(1);
            fetchData();
          }}
        >
         Xóa Bộ Lọc
        </Button>

        <Button variant="outline" onClick={() => router.push("/component/create")}>
          Thêm Linh Kiện
        </Button>

        <Button variant="outline" onClick={() => router.push("/import")}>
          Phiếu Nhập Hàng
        </Button>
      </div>

      {/* Column Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto mb-4">
            Columns <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={() =>
                  column.toggleVisibility(!column.getIsVisible())
                }
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>

        <span className="self-center ml-2">
          [Trang {currentPage} / {totalPages}] - [{totalElement} Linh Kiện]
        </span>
      </div>
    </div>
  );
}
