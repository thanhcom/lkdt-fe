"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import type { Account } from "@/types/AccountType";

/* ================= TYPES ================= */

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
}

/* ================= CONSTANT ================= */

const ROLE_OPTIONS = ["ADMIN", "CUSTOMER"];

/* ================= COMPONENT ================= */

export default function AccountPage() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Account | null>(null);

  /* ======= FORM (MATCH UserRequest) ======= */
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullname: "",
    email: "",
    phone: "",
    active: true,
    roleNames: [] as string[],
  });

  /* ================= DEBOUNCE SEARCH ================= */

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 500);
    return () => clearTimeout(t);
  }, [keyword]);

  /* ================= LOAD DATA ================= */

  const loadData = () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

    if (debouncedKeyword.trim()) {
      params.append("keyword", debouncedKeyword);
    }

    fetch(`https://api-lkdt.thanhcom.site/account/search?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((res) => {
        const data: PageResponse<Account> = res.data;
        setAccounts(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, debouncedKeyword]);

  /* ================= SAVE (UPDATE) ================= */

  const handleSave = () => {
    if (!editing) return;

    const body: any = {
      fullname: form.fullname || null,
      email: form.email || null,
      phone: form.phone || null,
      active: form.active,
      roleNames: form.roleNames,
    };

    if (form.password.trim()) {
      body.password = form.password;
    }

    fetch(`https://api-lkdt.thanhcom.site/account/update/${editing.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then(() => {
      setOpen(false);
      setEditing(null);
      loadData();
    });
  };

  /* ================= DELETE ================= */

  const handleDelete = () => {
    if (!confirmDelete) return;

    fetch(`https://api-lkdt.thanhcom.site/account/delete/${confirmDelete.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      setConfirmDelete(null);
      loadData();
    });
  };

  /* ================= TOGGLE ACTIVE ================= */

  const toggleActive = (acc: Account) => {
    fetch(`https://api-lkdt.thanhcom.site/account/toggle-active/${acc}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(loadData);
  };

  /* ================= RENDER ================= */

  return (
    <Card className="p-6 mt-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quản lý tài khoản</h1>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Tìm theo username / email..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-80 mb-4"
      />

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Fullname</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {accounts.map((acc) => (
            <TableRow key={acc.id}>
              <TableCell>{acc.username}</TableCell>
              <TableCell>{acc.fullname}</TableCell>
              <TableCell>{acc.email}</TableCell>

              <TableCell>
                {acc.roles.map((r) => (
                  <span
                    key={r.id}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1"
                  >
                    {r.name}
                  </span>
                ))}
              </TableCell>

              <TableCell>
                <Switch
                  checked={acc.active}
                  onCheckedChange={() => toggleActive(acc)}
                />
              </TableCell>

              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditing(acc);
                    setForm({
                      username: acc.username,
                      password: "",
                      fullname: acc.fullname ?? "",
                      email: acc.email ?? "",
                      phone: acc.phone ?? "",
                      active: acc.active,
                      roleNames: acc.roles.map((r) => r.name),
                    });
                    setOpen(true);
                  }}
                >
                  Sửa
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmDelete(acc)}
                >
                  Xoá
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div className="flex justify-between mt-4">
        <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
          ← Trước
        </Button>
        <span>
          Trang {page + 1} / {totalPages}
        </span>
        <Button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Sau →
        </Button>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa tài khoản</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input disabled value={form.username} />

            <Input
              type="password"
              placeholder="Password (để trống nếu không đổi)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {/* ACTIVE */}
            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <span>Active</span>
            </div>

            {/* ROLES */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Roles</p>
              {ROLE_OPTIONS.map((role) => (
                <div key={role} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.roleNames.includes(role)}
                    onCheckedChange={(checked) => {
                      setForm({
                        ...form,
                        roleNames: checked
                          ? [...form.roleNames, role]
                          : form.roleNames.filter((r) => r !== role),
                      });
                    }}
                  />
                  <span>{role}</span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá tài khoản?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
