"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
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
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { setComponent } from "@/store/slices/componentSlice";

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

  const [filters, setFilters] = React.useState({
    keyword: "",
    id: "",
    stockQuantity: "",
  });

  // ==========================
  // COLUMNS
  // ==========================
  const columns: ColumnDef<ComponentItem>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={
              row.getIsSelected()
                ? true
                : row.getIsSomeSelected()
                ? "indeterminate"
                : false
            }
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        ),
      },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "manufacturer", header: "Manufacturer" },
      {
        accessorKey: "stockQuantity",
        header: "Stock Qty",
        cell: ({ row }) => (
          <div className="text-right">{row.getValue<number>("stockQuantity")}</div>
        ),
      },
      { accessorKey: "location", header: "Location" },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) =>
          new Date(row.getValue<string>("createdAt")).toLocaleString(),
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
                <DropdownMenuItem
                  onClick={() => {
                    dispatch(setComponent(item));
                    router.push(`/schemantic/${item.id}`);
                  }}
                >
                  Schematic
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    dispatch(setComponent(item));
                    router.push(`/transaction/create`);
                  }}
                >
                  Transaction
                </DropdownMenuItem>

                <div className="my-1 border-t" />

                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(String(item.id))}
                >
                  Copy ID
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push(`/component/${item.id}/edit`)}
                >
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push(`/component/${item.id}/delete`)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [dispatch, router]
  );

  // ==========================
  // TABLE STATE
  // ==========================
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
  data,
  columns,
  state: {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
  },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  onRowSelectionChange: setRowSelection,

  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),

  manualPagination: true,
  pageCount: totalPages,
});



  // ==========================
  // FETCH DATA (chỉ khi bấm nút)
  // ==========================
  const fetchData = React.useCallback(
    async (searchFilters: typeof filters) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");

        const params = new URLSearchParams({
          page: String(currentPage - 1),
          size: "20",
        });

        if (searchFilters.keyword) params.append("keyword", searchFilters.keyword);
        if (searchFilters.id) params.append("id", searchFilters.id);
        if (searchFilters.stockQuantity)
          params.append("stockQuantity", searchFilters.stockQuantity);

        const res = await fetch(
          `https://api-lkdt.thanhcom.site/components/search?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setData(json.data ?? []);
        setTotalPages(json.pageInfo?.totalPage ?? 1);
        setTotalElement(json.pageInfo?.totalElement ?? 0);
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message);
        else setError("Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  // Chỉ fetch khi đổi page, dùng filters hiện tại
  React.useEffect(() => {
    fetchData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // filters không gây re-fetch

  if (loading) return <Loading />;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="p-8">
      {/* FILTER */}
      <div className="flex gap-4 py-4 flex-wrap items-end">
        <Input
          placeholder="Keyword..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          className="w-64"
        />
        <Input
          placeholder="ID"
          value={filters.id}
          onChange={(e) => setFilters({ ...filters, id: e.target.value })}
          className="w-32"
        />
        <Input
          placeholder="Stock ≥"
          value={filters.stockQuantity}
          onChange={(e) =>
            setFilters({ ...filters, stockQuantity: e.target.value })
          }
          className="w-32"
        />

        <Button
          onClick={() => {
            setCurrentPage(1);
            fetchData(filters);
          }}
        >
          🔍 Tìm Kiếm
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            const emptyFilters = { keyword: "", id: "", stockQuantity: "" };
            setFilters(emptyFilters);
            setCurrentPage(1);
            fetchData(emptyFilters);
          }}
        >
          Xóa Bộ Lọc
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push("/component/create")}
        >
          Thêm Linh Kiện
        </Button>

        <Button
          variant="outline"
          onClick={() => router.push("/import")}
        >
          Nhập Kho
        </Button>
      </div>

      {/* COLUMN TOGGLE */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="mb-4">
            Columns <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((c) => c.getCanHide())
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
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
          Trang {currentPage}/{totalPages} – {totalElement} linh kiện
        </span>
      </div>
    </div>
  );
}
