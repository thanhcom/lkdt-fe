"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";



export default function AccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // dialog state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  // form state
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // Fetch API
  const loadData = () => {
    setLoading(true);
    fetch("https://api-lkdt.thanhcom.site/account/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setAccounts(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = accounts.filter(
    (x) =>
      x.username.toLowerCase().includes(search.toLowerCase()) ||
      x.email.toLowerCase().includes(search.toLowerCase()) ||
      x.phone.includes(search)
  );

  const paginated = filtered.slice(page * pageSize, page * pageSize + pageSize);

  // reset form
  const resetForm = () => {
    setForm({
      username: "",
      fullname: "",
      email: "",
      phone: "",
      role: "CUSTOMER",
    });
  };

  // create/update
  const handleSave = () => {
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `https://api-lkdt.thanhcom.site/account/update/${editing.username}`
      : "https://api-lkdt.thanhcom.site/account/create";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    })
      .then(() => {
        setOpen(false);
        resetForm();
        loadData();
      })
      .catch((err) => console.error(err));
  };

  // delete
  const handleDelete = (username: string) => {
    if (!confirm("Xóa tài khoản này?")) return;

    fetch(`https://api-lkdt.thanhcom.site/account/delete/${username}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => loadData())
      .catch((err) => console.error(err));
  };

  return (
    <Card className="p-6 mt-4">
      <h1 className="text-2xl font-semibold mb-4">Quản lý tài khoản</h1>

      {/* Search */}
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Tìm kiếm username / email / phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72"
        />
        <Button
          onClick={() => {
            resetForm();
            setEditing(null);
            setOpen(true);
          }}
        >
          + Thêm tài khoản
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="font-bold">Username</TableCell>
            <TableCell className="font-bold">Fullname</TableCell>
            <TableCell className="font-bold">Email</TableCell>
            <TableCell className="font-bold">Phone</TableCell>
            <TableCell className="font-bold">Roles</TableCell>
            <TableCell className="font-bold">Active</TableCell>
            <TableCell className="font-bold">Actions</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginated.map((acc) => (
            <TableRow key={acc.username}>
              <TableCell>{acc.username}</TableCell>
              <TableCell>{acc.fullname}</TableCell>
              <TableCell>{acc.email}</TableCell>
              <TableCell>{acc.phone}</TableCell>

              <TableCell>
                {acc.roles.map((r) => (
                  <span
                    key={r.id}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded block w-fit mb-1"
                  >
                    {r.name}
                  </span>
                ))}
              </TableCell>

              <TableCell>
                {acc.active ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </TableCell>

              <TableCell className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditing(acc);
                    setForm({
                      username: acc.username,
                      fullname: acc.fullname,
                      email: acc.email,
                      phone: acc.phone,
                      role: acc.roles[0]?.name || "CUSTOMER",
                    });
                    setOpen(true);
                  }}
                >
                  Sửa
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(acc.username)}
                >
                  Xóa
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
          ← Trang trước
        </Button>

        <p>
          Trang {page + 1} / {Math.ceil(filtered.length / pageSize)}
        </p>

        <Button
          disabled={(page + 1) * pageSize >= filtered.length}
          onClick={() => setPage(page + 1)}
        >
          Trang sau →
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa tài khoản" : "Thêm tài khoản"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Username"
              value={form.username}
              disabled={!!editing}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <Input
              placeholder="Fullname"
              value={form.fullname}
              onChange={(e) => setForm({ ...form, fullname: e.target.value })}
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <Select
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
