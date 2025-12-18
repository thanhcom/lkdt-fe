"use client";

import { useCallback, useEffect, useState } from "react";
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

interface Role {
  id: number;
  name: string;
  description: string;
}

/* ================= COMPONENT ================= */

export default function AccountPage() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

  /* ======= FORM ======= */
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullname: "",
    email: "",
    phone: "",
    birthday: "", // ✅ thêm birthday (yyyy-MM-dd)
    active: true,
    roleNames: [] as string[],
  });

  /* ================= DEBOUNCE SEARCH ================= */

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 500);
    return () => clearTimeout(t);
  }, [keyword]);

  /* ================= LOAD ROLES ================= */

  const loadRoles = () => {
    fetch("https://api-lkdt.thanhcom.site/role/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((res) => setRoles(res.data || []));
  };

  useEffect(() => {
    loadRoles();
  }, []);

  /* ================= LOAD ACCOUNTS ================= */

  const loadData = useCallback(() => {
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
}, [page, debouncedKeyword, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
  loadData();
}, [loadData]);


  /* ================= CREATE ================= */

  const handleCreate = () => {
    const body = {
      ...form,
      birthday: form.birthday
        ? new Date(form.birthday).toISOString()
        : null,
    };

    fetch("https://api-lkdt.thanhcom.site/account/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then(() => {
      setOpen(false);
      setCreating(false);
      loadData();
    });
  };

  /* ================= UPDATE ================= */

  const handleSave = () => {
    if (!editing) return;

    const body: any = {
      fullname: form.fullname || null,
      email: form.email || null,
      phone: form.phone || null,
      active: form.active,
      roleNames: form.roleNames,
      birthday: form.birthday
        ? new Date(form.birthday).toISOString()
        : null,
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

    fetch(
      `https://api-lkdt.thanhcom.site/account/delete/${confirmDelete.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then(() => {
      setConfirmDelete(null);
      loadData();
    });
  };

  /* ================= TOGGLE ACTIVE ================= */

  const toggleActive = (acc: Account) => {
    fetch(
      `https://api-lkdt.thanhcom.site/account/toggle-active/${acc.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then(loadData);
  };

  /* ================= RENDER ================= */

  return (
    <Card className="p-6 mt-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quản lý tài khoản</h1>

        <Button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setForm({
              username: "",
              password: "",
              fullname: "",
              email: "",
              phone: "",
              birthday: "",
              active: true,
              roleNames: [],
            });
            setOpen(true);
          }}
        >
          + Tạo mới
        </Button>
      </div>

      <Input
        placeholder="Tìm theo username / email..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="w-80 mb-4"
      />

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
                    setCreating(false);
                    setForm({
                      username: acc.username,
                      password: "",
                      fullname: acc.fullname ?? "",
                      email: acc.email ?? "",
                      phone: acc.phone ?? "",
                      birthday: acc.birthday
                        ? acc.birthday.substring(0, 10)
                        : "",
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

      {/* CREATE / EDIT */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {creating ? "Tạo tài khoản" : "Sửa tài khoản"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              disabled={!creating}
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            <Input
              type="password"
              placeholder={
                creating ? "Password *" : "Password (để trống nếu không đổi)"
              }
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <Input
              placeholder="Fullname"
              value={form.fullname}
              onChange={(e) =>
                setForm({ ...form, fullname: e.target.value })
              }
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            {/* ✅ BIRTHDAY */}
            <Input
              type="date"
              value={form.birthday}
              onChange={(e) =>
                setForm({ ...form, birthday: e.target.value })
              }
            />

            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) =>
                  setForm({ ...form, active: v })
                }
              />
              <span>Active</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Roles</p>
              {roles.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.roleNames.includes(role.name)}
                    onCheckedChange={(checked) =>
                      setForm({
                        ...form,
                        roleNames: checked
                          ? [...form.roleNames, role.name]
                          : form.roleNames.filter(
                              (r) => r !== role.name
                            ),
                      })
                    }
                  />
                  <span>{role.name}</span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={creating ? handleCreate : handleSave}>
              {creating ? "Tạo mới" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
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
            <AlertDialogAction onClick={handleDelete}>
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
